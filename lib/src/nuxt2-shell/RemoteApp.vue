<template>
  <iframe
    v-show="isVisible"
    ref="iframeRef"
    :src="initialSrc"
    :title="title"
    :style="iframeStyle"
  />
</template>

<script>
/**
 * RemoteApp — Vue 2 / Nuxt 2 shell component.
 *
 * Options API port of the Vue 3 component (src/vue/RemoteApp.vue). It keeps the
 * exact same behaviour: penpal connection, automatic height, bidirectional route
 * sync and messaging.
 *
 * Route sync uses the shell's own router ($router.push/replace) — never
 * history.replaceState — so the shell URL stays a first-class Vue Router route.
 *
 * IMPORTANT (Nuxt 2 only): Nuxt keys <NuxtChild> by $route.path, so the page
 * holding this component is destroyed whenever the path changes, which would
 * tear down the iframe. To keep a single page instance across `basePath` and
 * `basePath/*`, the host app must expose them through ONE route record, e.g. by
 * adding a catch-all child page:
 *
 *   pages/ssio.vue      -> renders <RemoteApp base-path="/ssio" />
 *   pages/ssio/_.vue    -> empty placeholder, makes /ssio/* resolve to the same
 *                          record so Nuxt's routerViewKey stays '/ssio'
 */
const REMOTE_MESSENGER_KEY = 'remote-messenger'

/**
 * penpal reads the `crypto` global at module scope
 * (`crypto.randomUUID?.bind(crypto)`), and Nuxt 2 evaluates the server bundle in a vm
 * sandbox that does not expose it. A static import here would throw
 * `ReferenceError: crypto is not defined` during SSR for any page that imports this
 * component — including pages that only want `createRemoteMessenger`.
 *
 * Loading the bridge on first use keeps this module server-safe: the only caller is
 * createConnection(), reached from mounted(), which never runs on the server.
 */
let cachedConnectToRemote = null

function getConnectToRemote() {
  if (!cachedConnectToRemote) {
    const bridge = require('./core-bridge')
    cachedConnectToRemote = bridge.connectToRemote || (bridge.default && bridge.default.connectToRemote)
  }
  return cachedConnectToRemote
}

/** How long after a (re)connection route reports are still considered "initial" */
const INITIAL_SYNC_WINDOW_MS = 500
/** Max time we wait for the remote to answer a navigation before falling back to a src change */
const NAVIGATE_TIMEOUT_MS = 300

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_resolve, reject) => {
      setTimeout(() => reject(new Error('timeout')), ms)
    }),
  ])
}

export default {
  name: 'RemoteApp',

  inject: {
    messenger: { from: REMOTE_MESSENGER_KEY, default: null },
  },

  props: {
    src: { type: String, required: true },
    title: { type: String, required: true },
    basePath: { type: String, default: '' },
    timeout: { type: Number, default: 10000 },
    allowedOrigins: { type: Array, default: () => ['*'] },
    fullHeight: { type: Boolean, default: false },
  },

  data() {
    return {
      initialSrc: '',
      remoteHeight: 0,
      // Reactive mirror of the messenger status, fed by messenger.onStatusChange
      connectionStatus: 'loading',
      // False when the injected messenger exposes no onStatusChange, in which case
      // we must not gate visibility on a status we can never receive
      statusTracked: false,
    }
  },

  computed: {
    iframeStyle() {
      const style = { width: '100%', border: 'none' }
      if (this.remoteHeight > 0) {
        style.height = this.remoteHeight + 'px'
      }
      if (this.fullHeight) {
        style.minHeight = '100%'
      }
      return style
    },

    isVisible() {
      if (!this.messenger || !this.statusTracked) return true
      return this.connectionStatus === 'connected' || this.connectionStatus === 'no-plugin'
    },

    /**
     * Path the remote should be on, derived from the shell route.
     * Vue Router 3 exposes catch-all segments as `params.pathMatch`;
     * `params.path` is supported too for hand-written routes.
     */
    remotePath() {
      if (!this.basePath) return ''
      const params = this.$route.params || {}
      const raw = params.pathMatch !== undefined ? params.pathMatch : params.path
      if (!raw || (Array.isArray(raw) && raw.length === 0)) return ''
      const joined = Array.isArray(raw) ? raw.join('/') : raw
      if (!joined) return ''
      return joined.charAt(0) === '/' ? joined : '/' + joined
    },
  },

  watch: {
    remotePath(newPath) {
      this.syncRemoteToShellRoute(newPath)
    },
  },

  created() {
    // Non-reactive instance state
    this.penpalConnection = null
    this.timeoutId = null
    this.ignoreNextRouteChange = false
    this.isFirstRouteSync = true
    this.isMpaReload = false
    this.connectionTime = 0
    this.isPopstateNavigation = false
    this.baseContainerHeight = 0
    this.isInitialIframeLoad = true
  },

  mounted() {
    // Track back/forward navigation so we never push/replace on top of it
    this.onPopstate = () => {
      this.isPopstateNavigation = true
      setTimeout(() => {
        this.isPopstateNavigation = false
      }, 0)
    }
    window.addEventListener('popstate', this.onPopstate)

    this.initialSrc = this.basePath ? this.src + (this.remotePath || '') : this.src

    const iframe = this.$refs.iframeRef
    if (!iframe) return

    if (this.fullHeight && iframe.parentElement) {
      this.baseContainerHeight = iframe.parentElement.clientHeight
    }

    this.createConnection()

    // Mounting during a popstate means the URL is already correct — don't replace it
    if (this.isPopstateNavigation) {
      this.isFirstRouteSync = false
    }

    // Reconnect when the iframe reloads (MPA remotes do full page loads)
    this.onIframeLoad = () => {
      if (this.isInitialIframeLoad) {
        this.isInitialIframeLoad = false
        return
      }
      this.isMpaReload = true
      this.ignoreNextRouteChange = false
      this.createConnection()
    }
    iframe.addEventListener('load', this.onIframeLoad)

    if (this.messenger) {
      this.trackConnectionStatus()
    }
  },

  beforeDestroy() {
    if (this.timeoutId) clearTimeout(this.timeoutId)
    if (this.penpalConnection) this.penpalConnection.destroy()
    if (this.onPopstate) window.removeEventListener('popstate', this.onPopstate)
    const iframe = this.$refs.iframeRef
    if (iframe && this.onIframeLoad) {
      iframe.removeEventListener('load', this.onIframeLoad)
    }
  },

  methods: {
    createConnection() {
      const iframe = this.$refs.iframeRef
      if (!iframe) return null

      if (this.penpalConnection) this.penpalConnection.destroy()
      this.connectionTime = Date.now()
      this.isFirstRouteSync = true

      const self = this
      const connectToRemote = getConnectToRemote()

      this.penpalConnection = connectToRemote({
        iframe,
        allowedOrigins: this.allowedOrigins,
        timeout: this.timeout,
        methods: {
          onRemoteMessage(payload) {
            if (self.messenger) self.messenger.handleRemoteMessage(payload)
          },
          onRemoteRouteChange(path) {
            self.applyRemoteRoute(path)
            if (self.messenger) self.messenger.handleRouteChange(path)
            if (self.fullHeight) self.requestRemoteHeight()
          },
          onRemoteHeight(height) {
            // In fullHeight mode the height is driven by requestRemoteHeight()
            if (self.fullHeight) return
            const h = Number(height)
            if (!isNaN(h) && h > 0) self.remoteHeight = h
          },
        },
      })

      return this.penpalConnection
    },

    /** Remote → shell: mirror the remote's route onto the shell URL */
    applyRemoteRoute(path) {
      if (!this.basePath) return

      const shellPath = this.shellPathFor(path)
      if (this.$route.path === shellPath) {
        this.isFirstRouteSync = false
        return
      }

      // The browser already moved the history pointer — don't fight it
      if (this.isPopstateNavigation) return

      this.ignoreNextRouteChange = true

      // Replace (no new history entry) while the connection is still settling
      // or after an MPA reload; push for genuine in-remote navigation.
      const isInitialPeriod = Date.now() - this.connectionTime < INITIAL_SYNC_WINDOW_MS
      const shouldReplace = this.isFirstRouteSync || this.isMpaReload || isInitialPeriod

      this.isFirstRouteSync = false
      this.isMpaReload = false

      const navigation = shouldReplace
        ? this.$router.replace(shellPath)
        : this.$router.push(shellPath)

      // Vue Router 3 rejects on duplicated/aborted navigation
      if (navigation && typeof navigation.catch === 'function') {
        navigation.catch(() => {})
      }
    },

    /** Shell → remote: tell the remote to navigate, falling back to a src change for MPAs */
    async syncRemoteToShellRoute(newPath) {
      if (!this.basePath) return
      if (this.ignoreNextRouteChange) {
        this.ignoreNextRouteChange = false
        return
      }
      if (!this.penpalConnection) return

      const iframe = this.$refs.iframeRef
      if (!iframe) return

      const targetPath = newPath || '/'

      if (this.fullHeight) this.remoteHeight = 0

      let navigated = false
      try {
        const remote = await withTimeout(this.penpalConnection.promise, NAVIGATE_TIMEOUT_MS)
        if (remote && typeof remote.onShellNavigate === 'function') {
          await withTimeout(remote.onShellNavigate(targetPath), NAVIGATE_TIMEOUT_MS)
          navigated = true
        }
      } catch (e) {
        // fall through to the MPA fallback
      }

      if (!navigated) {
        const newSrc = this.src + (targetPath === '/' ? '' : targetPath)
        if (iframe.src !== newSrc) iframe.src = newSrc
      }
    },

    /** Joins basePath with a remote path, avoiding a trailing slash for the root */
    shellPathFor(path) {
      if (!path || path === '/') return this.basePath
      return this.basePath + (path.charAt(0) === '/' ? path : '/' + path)
    },

    /**
     * Ask the remote for its effective height given the container height.
     * Forces the iframe to container height, waits for layout, then measures.
     */
    async requestRemoteHeight() {
      if (!this.penpalConnection || !this.fullHeight || this.baseContainerHeight <= 0) return

      const iframe = this.$refs.iframeRef
      if (!iframe) return

      this.remoteHeight = 0
      iframe.style.height = this.baseContainerHeight + 'px'

      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      })

      try {
        const remote = await this.penpalConnection.promise
        const effectiveHeight = await remote.onShellContainerHeight(this.baseContainerHeight)
        if (effectiveHeight > this.baseContainerHeight) {
          this.remoteHeight = effectiveHeight
          iframe.style.height = effectiveHeight + 'px'
        } else {
          iframe.style.height = ''
        }
      } catch (e) {
        iframe.style.height = ''
      }
    },

    async checkServerReachable(url) {
      try {
        await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: AbortSignal.timeout(this.timeout),
        })
        return true
      } catch (e) {
        return false
      }
    },

    async trackConnectionStatus() {
      // Subscribe first so no transition is missed while checking reachability.
      // The messenger owns the status rule; this component only mirrors it.
      if (typeof this.messenger.onStatusChange === 'function') {
        this.statusTracked = true
        this.connectionStatus = this.messenger.status || 'loading'
        this.messenger.onStatusChange((status) => {
          this.connectionStatus = status
        })
      }

      const serverReachable = await this.checkServerReachable(this.src)
      if (serverReachable) this.messenger.setIframeLoaded()

      const timeoutPromise = new Promise((_resolve, reject) => {
        this.timeoutId = setTimeout(
          () => reject(new Error('Connection timeout')),
          this.timeout,
        )
      })

      this.messenger.setConnection(
        Promise.race([this.penpalConnection.promise, timeoutPromise]),
      )
    },
  },
}
</script>
