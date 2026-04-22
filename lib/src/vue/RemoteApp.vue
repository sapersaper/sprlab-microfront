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
import { ref, computed, inject, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { connectToRemote } from '../core/connection'
import type { PenpalHandle } from '../core/types'
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
let penpalConnection: PenpalHandle | null = null
let timeoutId: ReturnType<typeof setTimeout> | null = null

const remoteHeight = ref(0)
let baseContainerHeight = 0

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
let isMpaReload = false

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

/**
 * Ask the remote for its effective height given the container height.
 * Forces the iframe to container height via DOM, waits for layout, then measures.
 */
async function requestRemoteHeight() {
  if (!penpalConnection || !props.fullHeight || baseContainerHeight <= 0) return
  
  const iframe = iframeRef.value
  if (!iframe) return

  // 1. Force iframe to container height via DOM directly (bypass Vue reactivity)
  remoteHeight.value = 0
  iframe.style.height = baseContainerHeight + 'px'
  
  // 2. Wait for two animation frames so the iframe actually resizes
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  
  try {
    const remote = await penpalConnection.promise as any
    const effectiveHeight = await remote.onShellContainerHeight(baseContainerHeight)
    if (effectiveHeight > baseContainerHeight) {
      remoteHeight.value = effectiveHeight
      // Sync the DOM style with the reactive value
      iframe.style.height = effectiveHeight + 'px'
    } else {
      // Content fits in container, remove explicit height (min-height: 100% takes over)
      iframe.style.height = ''
    }
  } catch {
    iframe.style.height = ''
  }
}

onMounted(async () => {
  initialSrc.value = props.basePath
    ? props.src + (remotePath.value || '')
    : props.src

  const iframe = iframeRef.value
  if (!iframe) return

  if (props.fullHeight && iframe.parentElement) {
    baseContainerHeight = iframe.parentElement.clientHeight
  }

  function createConnection() {
    if (penpalConnection) penpalConnection.destroy()

    penpalConnection = connectToRemote({
      iframe: iframe!,
      allowedOrigins: props.allowedOrigins,
      timeout: props.timeout,
      methods: {
        onRemoteMessage(payload: unknown) {
          if (messenger) messenger.handleRemoteMessage(payload as any)
        },
        onRemoteRouteChange(path: unknown) {
          if (props.basePath) {
            const shellPath = props.basePath + path
            if (route.fullPath !== shellPath) {
              ignoreNextRouteChange = true
              if (isFirstRouteSync || isMpaReload) {
                isFirstRouteSync = false
                isMpaReload = false
                router.replace(shellPath)
              } else {
                router.push(shellPath)
              }
            }
          }
          if (messenger) messenger.handleRouteChange(path as string)
          
          // After route change, re-measure height
          if (props.fullHeight) {
            requestRemoteHeight()
          }
        },
        onRemoteHeight(height: unknown) {
          // When fullHeight is active, ignore automatic height reports
          // Height is managed via requestRemoteHeight() on route changes
          if (props.fullHeight) return
          
          const h = Number(height)
          if (!isNaN(h) && h > 0) {
            remoteHeight.value = h
          }
        },
      },
    })

    return penpalConnection
  }

  // Initial connection
  createConnection()

  // Reconnect on iframe load (for MPA remotes that do full page reloads)
  let isInitialLoad = true
  iframe.addEventListener('load', () => {
    if (isInitialLoad) {
      isInitialLoad = false
      return
    }
    // Iframe reloaded (MPA navigation) — reconnect penpal
    // TODO: MPA forward navigation doesn't work because we use replace() instead of push()
    // to avoid double-back. Need a strategy to handle both back and forward with MPA iframes.
    isMpaReload = true
    createConnection()
  })

  if (messenger) {
    const serverReachable = await checkServerReachable(props.src)
    if (serverReachable) {
      messenger.setIframeLoaded()
    }
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Connection timeout')), props.timeout)
    })
    messenger.setConnection(Promise.race([penpalConnection!.promise, timeoutPromise]))
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
