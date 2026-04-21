<template>
  <iframe
    v-show="isVisible"
    ref="iframeRef"
    :src="initialSrc"
    :title="title"
    :style="iframeStyle"
  />
</template>

<script setup lang="ts">
/**
 * RemoteApp — Iframe wrapper component that handles:
 * - Automatic iframe height based on remote content (via penpal)
 * - Bidirectional messaging via penpal
 * - Route synchronization between shell and remote (when basePath is provided)
 * - Connection status tracking (loading, connected, error, no-plugin)
 * - fullHeight mode: iframe takes at least 100% of container height
 */
import { ref, computed, inject, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
  fullHeight: { type: Boolean, default: false },
})

const messenger = inject<RemoteMessenger | null>(REMOTE_MESSENGER_KEY, null)

const route = useRoute()
const router = useRouter()

const iframeRef = ref<HTMLIFrameElement | null>(null)
let penpalConnection: { promise: Promise<unknown>; destroy: () => void } | null = null
let timeoutId: ReturnType<typeof setTimeout> | null = null

// Track the remote content height reported via penpal
const remoteHeight = ref(0)

// Compute the iframe style based on fullHeight mode
const iframeStyle = computed(() => {
  const base: Record<string, string> = { width: '100%', border: 'none' }
  if (remoteHeight.value > 0) {
    base.height = remoteHeight.value + 'px'
  }
  if (props.fullHeight) {
    base.minHeight = '100%'
  }
  return base
})

let ignoreNextRouteChange = false
let isFirstRouteSync = true

const isVisible = computed(() => {
  if (!messenger) return true
  const status = messenger.status.value
  return status === RemoteStatus.Connected || status === RemoteStatus.NoPlugin
})

const remotePath = computed(() => {
  if (!props.basePath) return ''
  const path = route.params.path
  if (!path || (Array.isArray(path) && path.length === 0)) return ''
  const joined = Array.isArray(path) ? path.join('/') : path
  return '/' + joined
})

const initialSrc = ref('')

async function checkServerReachable(url: string): Promise<boolean> {
  try {
    await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(props.timeout) })
    return true
  } catch {
    return false
  }
}

onMounted(async () => {
  initialSrc.value = props.basePath
    ? props.src + (remotePath.value || '')
    : props.src

  const iframe = iframeRef.value
  if (!iframe) return

  const windowMessenger = new WindowMessenger({
    remoteWindow: iframe.contentWindow!,
    allowedOrigins: props.allowedOrigins,
  })

  penpalConnection = connect({
    messenger: windowMessenger,
    timeout: props.timeout,
    methods: {
      onRemoteMessage(payload: unknown) {
        if (messenger) messenger.handleRemoteMessage(payload as any)
      },
      onRemoteRouteChange(path: unknown) {
        // Reset height on navigation so fullHeight kicks in
        if (props.fullHeight) {
          remoteHeight.value = 0
        }
        if (props.basePath) {
          const shellPath = props.basePath + path
          if (route.fullPath !== shellPath) {
            ignoreNextRouteChange = true
            if (isFirstRouteSync) {
              isFirstRouteSync = false
              router.replace(shellPath)
            } else {
              router.push(shellPath)
            }
          }
        }
        if (messenger) messenger.handleRouteChange(path as string)
      },
      /** Called by the remote when its content height changes */
      onRemoteHeight(height: unknown) {
        const h = Number(height)
        if (!isNaN(h) && h > 0) {
          remoteHeight.value = h
        }
      },
    },
  })

  if (messenger) {
    const serverReachable = await checkServerReachable(props.src)
    if (serverReachable) {
      messenger.setIframeLoaded()
    }
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Connection timeout')), props.timeout)
    })
    messenger.setConnection(Promise.race([penpalConnection.promise, timeoutPromise]))
  }
})

if (props.basePath) {
  watch(
    () => remotePath.value,
    async (newPath) => {
      if (ignoreNextRouteChange) {
        ignoreNextRouteChange = false
        return
      }
      if (!penpalConnection) return
      // Reset height on back/forward navigation
      if (props.fullHeight) {
        remoteHeight.value = 0
      }
      const targetPath = newPath || '/'
      try {
        const remote = await penpalConnection.promise as Record<string, (p: string) => Promise<void>>
        await remote.onShellNavigate(targetPath)
      } catch {}
    },
  )
}

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
  if (penpalConnection) penpalConnection.destroy()
})
</script>
