<template>
  <iframe
    v-show="isVisible"
    ref="iframeRef"
    :src="resolvedSrc"
    :title="title"
    style="width: 100%; border: none;"
  />
</template>

<script setup lang="ts">
/**
 * RemoteApp — Iframe wrapper component that handles:
 * - Automatic iframe resizing via open-iframe-resizer
 * - Bidirectional messaging via penpal
 * - Route synchronization between shell and remote (when basePath is provided)
 * - Connection status tracking (loading, connected, error, no-plugin)
 *
 * Communicates with the useRemote composable via provide/inject.
 */
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { initialize } from '@open-iframe-resizer/core'
import { WindowMessenger, connect } from 'penpal'
import type { RemoteMessenger } from './useRemote'
import { RemoteStatus } from './useRemote'

const REMOTE_MESSENGER_KEY = Symbol.for('remote-messenger')

const props = defineProps({
  src: { type: String, required: true },
  title: { type: String, required: true },
  basePath: { type: String, default: '' },
  timeout: { type: Number, default: 10000 },
  allowedOrigins: { type: Array as () => string[], default: () => ['*'] },
})

// Injected from useRemote composable (may be null if useRemote is not used)
const messenger = inject<RemoteMessenger | null>(REMOTE_MESSENGER_KEY, null)

const route = useRoute()
const router = useRouter()

const iframeRef = ref<HTMLIFrameElement | null>(null)
let resizerCleanup: { unsubscribe: () => void } | null = null
let penpalConnection: { promise: Promise<unknown>; destroy: () => void } | null = null
let timeoutId: ReturnType<typeof setTimeout> | null = null

// Only show iframe when connected or when server loaded without plugin
const isVisible = computed(() => {
  if (!messenger) return true
  const status = messenger.status.value
  return status === RemoteStatus.Connected || status === RemoteStatus.NoPlugin
})

// Extract the sub-path from the shell route (e.g., /remote2/page1 → /page1)
const remotePath = computed(() => {
  if (!props.basePath) return ''
  const path = route.params.path
  if (!path || (Array.isArray(path) && path.length === 0)) return ''
  const joined = Array.isArray(path) ? path.join('/') : path
  return '/' + joined
})

// Build the full iframe URL by combining src with the remote sub-path
const resolvedSrc = computed(() => {
  if (!props.basePath) return props.src
  return props.src + remotePath.value
})

/**
 * Check if the remote server is reachable using a HEAD request with no-cors mode.
 * Used to distinguish between "server down" (Error) and "server up but no plugin" (NoPlugin).
 * Note: no-cors returns an opaque response, so we can only detect if the server exists, not its status code.
 */
async function checkServerReachable(url: string): Promise<boolean> {
  try {
    await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors', 
      signal: AbortSignal.timeout(props.timeout),
    })
    return true
  } catch {
    return false
  }
}

onMounted(async () => {
  const iframe = iframeRef.value
  if (!iframe) return

  // Initialize iframe auto-resizer
  initialize({}, iframe).then((results) => {
    resizerCleanup = results[0]
  })

  // Set up penpal connection for bidirectional messaging
  const windowMessenger = new WindowMessenger({
    remoteWindow: iframe.contentWindow!,
    allowedOrigins: props.allowedOrigins,
  })

  penpalConnection = connect({
    messenger: windowMessenger,
    timeout: props.timeout,
    methods: {
      /** Called by the remote when it sends a message to the shell */
      onRemoteMessage(payload: unknown) {
        if (messenger) messenger.handleRemoteMessage(payload as any)
      },
      /** Called by the remote when its internal route changes */
      onRemoteRouteChange(path: unknown) {
        // Sync the shell URL with the remote's internal route
        if (props.basePath) {
          const shellPath = props.basePath + path
          if (route.fullPath !== shellPath) {
            router.replace(shellPath)
          }
        }
        if (messenger) messenger.handleRouteChange(path as string)
      },
    },
  })

  if (messenger) {
    // Check if the server is reachable before waiting for penpal
    const serverReachable = await checkServerReachable(props.src)
    if (serverReachable) {
      messenger.setIframeLoaded()
    }

    // Race between penpal connection and manual timeout
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Connection timeout')), props.timeout)
    })
    messenger.setConnection(Promise.race([penpalConnection.promise, timeoutPromise]))
  }
})

// Clean up all resources on component unmount
onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
  if (resizerCleanup) resizerCleanup.unsubscribe()
  if (penpalConnection) penpalConnection.destroy()
})
</script>
