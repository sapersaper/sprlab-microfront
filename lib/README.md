# @sprlab/microfront

A framework-agnostic library for building micro frontend architectures using iframes. It handles iframe resizing, bidirectional messaging, and route synchronization between a shell (host) application and remote (child) applications.

Supports Vue 3, Vue 2 / Nuxt 2, and React remotes.

## Features

- Automatic iframe resizing based on content height (ResizeObserver + penpal)
- Full-height mode: iframe fills container, expands for tall content
- Bidirectional messaging between shell and remotes via penpal
- Route synchronization between shell and remote routers
- Connection status tracking (loading, connected, error, no-plugin detection)
- Framework-agnostic core with Vue and React adapters
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
| `@sprlab/microfront/react/remote` | React remote (initReactRemote, createReactRouterAdapter) |

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
  transpile: ['@sprlab/microfront', 'penpal']
}
```

## API Reference

### RemoteApp component (`@sprlab/microfront/vue/shell`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | required | URL of the remote application |
| `title` | `string` | required | Iframe title for accessibility |
| `basePath` | `string` | `''` | Shell route prefix for route sync |
| `timeout` | `number` | `10000` | Connection timeout in ms |
| `allowedOrigins` | `string[]` | `['*']` | Allowed origins for postMessage |
| `fullHeight` | `boolean` | `false` | Iframe fills container, expands for tall content |

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
│  │  │ Vue 3 / Nuxt 2 / React   │  │    │
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

- [penpal](https://github.com/Aaronius/penpal) — Promise-based iframe messaging

## License

MIT
