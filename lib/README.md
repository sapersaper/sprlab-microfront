# @sprlab/microfront

A framework-agnostic library for building micro frontend architectures using iframes. It handles iframe resizing, bidirectional messaging, and route synchronization between a shell (host) application and remote (child) applications.

Supports Vue 3, Vue 2 / Nuxt 2, React, and Angular remotes.

## Features

- Automatic iframe resizing based on content height (ResizeObserver + penpal)
- Full-height mode: iframe fills container, expands for tall content
- Bidirectional messaging between shell and remotes via penpal
- Route synchronization between shell and remote routers
- Connection status tracking (loading, connected, error, no-plugin detection)
- Framework-agnostic core with Vue, React, and Angular adapters
- Configurable connection timeout and allowed origins

## Installation

```bash
yarn add @sprlab/microfront
```

## Import paths

| Path | Description |
|------|-------------|
| `@sprlab/microfront/core` | Framework-agnostic core (types, initRemote, utilities) |
| `@sprlab/microfront/vue/shell` | Vue 3 shell (RemoteApp component, useRemote composable) |
| `@sprlab/microfront/vue/remote` | Vue 3 remote (sprRemote plugin, send, onMessage) |
| `@sprlab/microfront/nuxt2/shell` | Vue 2 / Nuxt 2 shell (RemoteApp component, createRemoteMessenger) |
| `@sprlab/microfront/react/remote` | React remote (initReactRemote, createReactRouterAdapter) |
| `@sprlab/microfront/angular/remote` | Angular remote (initAngularRemote, createAngularRouterAdapter) |
| `@sprlab/microfront/mpa/remote` | MPA standalone remote (initMpaRemote), single self-contained file |

Legacy aliases (backward compatible):
| `@sprlab/microfront/shell` | Same as `./vue/shell` |
| `@sprlab/microfront/remote` | Same as `./vue/remote` |

## Usage

### Shell (Vue 3 host application)

#### Basic setup

```vue
<template>
  <RemoteApp
    src="http://localhost:4001"
    title="Remote 1"
  />
</template>

<script setup lang="ts">
import { RemoteApp } from '@sprlab/microfront/vue/shell'
</script>
```

#### Messaging with useRemote

```vue
<template>
  <div>
    <article v-if="isLoading" aria-busy="true">Connecting...</article>
    <article v-else-if="isError">Connection error</article>
    <template v-if="isConnected">
      <button @click="sendToRemote">Send</button>
    </template>
    <RemoteApp src="http://localhost:4001" title="Remote 1" />
  </div>
</template>

<script setup lang="ts">
import { RemoteApp, useRemote } from '@sprlab/microfront/vue/shell'

const { sendMessage, onMessage, isLoading, isConnected, isError, isNoPlugin } = useRemote()

function sendToRemote() {
  sendMessage({ greeting: 'hello from shell' })
}

onMessage((payload, metadata) => {
  console.log(`Message from: ${metadata.appName}`, payload)
})
</script>
```

#### Route synchronization

```vue
<template>
  <RemoteApp
    src="http://localhost:4002"
    title="Remote 2"
    basePath="/remote2"
  />
</template>
```

The shell router needs a catch-all route:

```ts
{ path: '/remote2/:path(.*)*', component: Remote2View }
```

#### Full-height mode

```vue
<RemoteApp
  src="http://localhost:4004"
  title="FullHeight Remote"
  basePath="/fullheight"
  fullHeight
/>
```

When `fullHeight` is enabled, the iframe takes at least 100% of its container height. If the remote content is taller, the iframe expands. On navigation, it resets and re-measures.

### Shell (Vue 2 / Nuxt 2 host application)

Same component, same props as the Vue 3 shell — Options API instead of Composition API.

```js
// plugins/microfront.client.js
import Vue from 'vue'
import { RemoteApp } from '@sprlab/microfront/nuxt2/shell'

Vue.component('RemoteApp', RemoteApp)
```

```js
// nuxt.config.js
plugins: ['~/plugins/microfront.client'],
build: {
  // RemoteApp ships as an uncompiled Vue 2 SFC — your vue-loader compiles it
  transpile: ['@sprlab/microfront']
}
```

Wrap `<RemoteApp>` in `<client-only>`: an iframe has nothing to server-render, and the
component is registered on the client only.

```vue
<!-- pages/ssio.vue -->
<template>
  <div style="height: calc(100vh - 60px)">
    <client-only>
      <RemoteApp
        src="http://localhost:4444"
        title="SSIO"
        base-path="/ssio"
        full-height
      />
    </client-only>
  </div>
</template>
```

#### Route synchronization in Nuxt 2 — required setup

> **This is the one thing that will break if you skip it.** Read it before debugging
> "the iframe reloads when I navigate".

Nuxt 2 puts a `:key` on `<NuxtChild>` and that key defaults to `$route.path`
(see `.nuxt/components/nuxt.js` → `routerViewKey`). So a plain
`$router.push('/ssio/activations')` gives the page a new key, Nuxt destroys and
re-creates it, the iframe is torn down and the remote reloads from scratch.

Vue 3 shells don't have this problem: `<router-view>` in vue-router 4 has no key,
so the same route record reuses the component instance.

The fix is to make `/<basePath>` and `/<basePath>/*` produce a **stable key**. In
Nuxt 2 you get that for free from file-based routing, by adding an empty catch-all
child page next to the host page:

```
pages/ssio.vue      → renders <RemoteApp base-path="/ssio" />
pages/ssio/_.vue    → empty, <div /> is enough
```

That generates one parent route with a catch-all child:

```js
{ path: '/ssio', component: SsioPage, children: [{ path: '*', component: SsioCatchAll }] }
```

and the key resolves to `/ssio` for every path under it:

| URL | `$route.matched.length` | Key Nuxt computes |
|-----|-------------------------|-------------------|
| `/ssio` | 1 | `$route.path` → `/ssio` |
| `/ssio/activations` | 2 | `compile(matched[0].path)(params)` → `/ssio` |
| `/ssio/a/b` | 2 | `/ssio` |

Same key on every path ⇒ the page instance, the iframe and the penpal connection
all survive navigation.

Notes:
- `pages/ssio.vue` must **not** render `<nuxt-child>`. The remote content lives in
  the iframe; the catch-all page exists only to shape the route table.
- Don't use `extendRoutes` with a `/ssio/*` sibling route. A sibling is a *different*
  route record, so the component is swapped and you're back to a destroyed iframe.
- Don't sync the URL with `history.replaceState`. It dodges the re-mount but takes
  the URL out of Vue Router's hands, which breaks active-link state, back/forward
  and any middleware or guard that reads the route.
- Vue Router 3 exposes catch-all segments as `params.pathMatch`; `RemoteApp` reads it
  for you.

#### createRemoteMessenger (status + messaging)

The Vue 2 counterpart of `useRemote()`. Provide it under the `'remote-messenger'` key and
`RemoteApp` will pick it up via `inject`.

```vue
<template>
  <div>
    <p v-if="isLoading">Connecting…</p>
    <p v-else-if="isError">SSIO is unreachable</p>
    <p v-else-if="isNoPlugin">SSIO is missing the sprRemote plugin</p>
    <button v-if="isConnected" @click="ping">Send</button>

    <client-only>
      <RemoteApp :src="src" title="SSIO" base-path="/ssio" full-height />
    </client-only>
  </div>
</template>

<script>
import { createRemoteMessenger } from '@sprlab/microfront/nuxt2/shell'

export default {
  provide() {
    return { 'remote-messenger': this.remoteMessenger }
  },
  data() {
    // Must be in data(): that's what makes it reactive in Vue 2
    return { remoteMessenger: createRemoteMessenger() }
  },
  computed: {
    isLoading() { return this.remoteMessenger.status === 'loading' },
    isConnected() { return this.remoteMessenger.status === 'connected' },
    isError() { return this.remoteMessenger.status === 'error' },
    isNoPlugin() { return this.remoteMessenger.status === 'no-plugin' }
  },
  methods: {
    ping() { this.remoteMessenger.send({ hello: 'from shell' }) }
  }
}
</script>
```

**Put the messenger in `data()`.** `status` and `iframeLoaded` are deliberately plain
properties rather than getters, because Vue 2 makes a property reactive by installing its
own accessor pair over it — something it cannot do to a getter backed by a closure. Held
anywhere other than `data()`, the object is inert and your template never updates.

Prefer `status` over `iframeLoaded`; the latter only exists to tell `error` (server
unreachable) apart from `no-plugin` (server answered, plugin missing).

| Method | Description |
|--------|-------------|
| `send(payload)` | Send a message to the remote |
| `onMessage(handler)` | Messages from the remote — `(payload, metadata)` |
| `onRouteChange(handler)` | Route changes reported by the remote |
| `onStatusChange(handler)` | Connection status transitions |

### Remote — Vue 3

```ts
import { createApp } from 'vue'
import { sprRemote } from '@sprlab/microfront/vue/remote'
import App from './App.vue'
import router from './router'

createApp(App)
  .use(sprRemote, { appName: 'my-app', router })
  .use(router)
  .mount('#app')
```

Sending and receiving messages:

```ts
import { send, onMessage } from '@sprlab/microfront/vue/remote'

onMessage((payload) => console.log('From shell:', payload))
send({ greeting: 'hello from remote' })
```

The plugin detects if the app is inside an iframe. When standalone, it does nothing.

### Remote — React

```tsx
import { initReactRemote } from '@sprlab/microfront/react/remote'
import { createBrowserRouter } from 'react-router-dom'

const router = createBrowserRouter([...])

// With router (route sync + messaging)
const connection = initReactRemote({ appName: 'my-react-app', router })

// Without router (messaging only)
const connection = initReactRemote({ appName: 'my-react-app' })

// Send/receive messages
connection?.send({ greeting: 'hello' })
connection?.onMessage((payload) => console.log(payload))
```

Returns `null` if not inside an iframe.

### Remote — Angular

```ts
// app.config.ts
import { ApplicationConfig, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { initAngularRemote } from '@sprlab/microfront/angular/remote';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const router = inject(Router);
        return () => initAngularRemote({ appName: 'my-angular-app', router });
      },
    },
  ],
};
```

Without router (messaging only):

```ts
import { initAngularRemote } from '@sprlab/microfront/angular/remote';

const connection = initAngularRemote({ appName: 'my-angular-app' });
connection?.send({ greeting: 'hello' });
connection?.onMessage((payload) => console.log(payload));
```

### Remote — MPA (Multi-Page Apps / SSR)

For server-rendered apps (PHP, ASP, static HTML, etc.) that do full page reloads. This entry point is a single self-contained file — no import map, no bundler, no dependencies — so it can be dropped in with a plain `<script type="module">`:

```html
<script type="module">
  import { initMpaRemote } from '/path/to/mpa-remote.js'
  initMpaRemote({ appName: 'my-mpa-app' })
</script>
```

Or via npm with a bundler:

```ts
import { initMpaRemote } from '@sprlab/microfront/mpa/remote'
initMpaRemote({ appName: 'my-mpa-app' })
```

Features:
- Messaging works on each page while connected
- Height reporting works (ResizeObserver)
- Route sync works — shell URL updates after each page load
- Back and forward navigation works within the MPA remote
- Back to other shell pages works correctly
- Known limitation: forward navigation after leaving the MPA remote (e.g., back to Home then forward) only reaches the first MPA page. This is inherent to iframes in SPAs — the iframe is destroyed when the shell component unmounts and recreated without its history when remounted.

The shell automatically reconnects penpal after each iframe reload.

### Remote — Vue 2 / Nuxt 2

```js
// plugins/microfront.client.js
import { sprRemoteLegacy } from '@sprlab/microfront/dist/remote.js'

export default ({ app }) => {
  sprRemoteLegacy.init({
    appName: 'my-nuxt2-app',
    router: app.router,
  })
}
```

```js
// nuxt.config.js
plugins: [
  { src: '~/plugins/microfront.client.js', mode: 'client' }
],
build: {
  transpile: ['@sprlab/microfront']
}
```

## API Reference

### RemoteApp component

Same props for `@sprlab/microfront/vue/shell` (Vue 3) and `@sprlab/microfront/nuxt2/shell` (Vue 2 / Nuxt 2).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | required | URL of the remote application |
| `title` | `string` | required | Iframe title for accessibility |
| `basePath` | `string` | `''` | Shell route prefix for route sync |
| `timeout` | `number` | `10000` | Connection timeout in ms |
| `allowedOrigins` | `string[]` | `['*']` | Allowed origins for postMessage |
| `fullHeight` | `boolean` | `false` | Iframe fills container, expands for tall content |

Nuxt 2 route sync has a mandatory routing setup — see
[Route synchronization in Nuxt 2](#route-synchronization-in-nuxt-2--required-setup).

### useRemote() composable (`@sprlab/microfront/vue/shell`)

| Property | Type | Description |
|----------|------|-------------|
| `sendMessage` | `(payload) => Promise<void>` | Send message to remote |
| `onMessage` | `(handler) => void` | Listen for messages from remote |
| `onRouteChange` | `(handler) => void` | Listen for route changes from remote |
| `isLoading` | `ComputedRef<boolean>` | Connecting |
| `isConnected` | `ComputedRef<boolean>` | Connected |
| `isError` | `ComputedRef<boolean>` | Server unreachable |
| `isNoPlugin` | `ComputedRef<boolean>` | Server responds but plugin missing |

### initReactRemote (`@sprlab/microfront/react/remote`)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appName` | `string` | `'unknown'` | Identifier for messages |
| `router` | `Router` | `undefined` | React Router instance (createBrowserRouter) |
| `allowedOrigins` | `string[]` | `['*']` | Allowed origins for postMessage |

Returns `RemoteConnection | null` (null if not in iframe).

### initAngularRemote (`@sprlab/microfront/angular/remote`)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appName` | `string` | `'unknown'` | Identifier for messages |
| `router` | `Router` | `undefined` | Angular Router instance (@angular/router) |
| `allowedOrigins` | `string[]` | `['*']` | Allowed origins for postMessage |

Returns `RemoteConnection | null` (null if not in iframe).

## Architecture

```
┌─────────────────────────────────────────┐
│ Shell (Vue 3)         localhost:4000    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ RemoteApp (iframe)              │    │
│  │                                 │    │
│  │  ┌───────────────────────────┐  │    │
│  │  │ Remote (any framework)    │  │    │
│  │  │ Vue 3 / Nuxt 2 / React  │  │    │
│  │  │ / Angular               │  │    │
│  │  └───────────────────────────┘  │    │
│  │                                 │    │
│  │  penpal ←→ messaging            │    │
│  │  ResizeObserver ←→ resize       │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

## Migration from 0.1.x

### New import paths (recommended)

```diff
- import { RemoteApp, useRemote } from '@sprlab/microfront/shell'
+ import { RemoteApp, useRemote } from '@sprlab/microfront/vue/shell'

- import { sprRemote, send, onMessage } from '@sprlab/microfront/remote'
+ import { sprRemote, send, onMessage } from '@sprlab/microfront/vue/remote'
```

The old paths (`/shell`, `/remote`) still work as aliases.

### Removed dependency

`@open-iframe-resizer/core` has been removed. Height management is now handled internally via ResizeObserver + penpal communication. No action needed — this is transparent to consumers.

## Dependencies

**None.** Installing this package pulls in nothing else.

[penpal](https://github.com/Aaronius/penpal) (promise-based iframe messaging) is used
internally and **bundled into every build output**, so you never install, import or
resolve it yourself.

That's deliberate: penpal ships as an exports-only package with no `main` field, which
webpack 4 (Nuxt 2) cannot resolve. Leaving it external forced every consumer to add
penpal as a dependency plus a resolver alias. Bundling keeps it an implementation
detail. It costs ~13 kB (~4.5 kB gzipped) in one shared chunk, not per entry point.

`vue` and `vue-router` are the only external imports, and both are optional peers.

## License

MIT
