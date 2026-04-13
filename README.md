# @sprlab/microfront

A Vue 3 library for building micro frontend architectures using iframes. It handles iframe resizing, bidirectional messaging, and route synchronization between a shell (host) application and remote (child) applications.

## Features

- Automatic iframe resizing based on content height
- Bidirectional messaging between shell and remotes via penpal
- Route synchronization between shell and remote routers
- Connection status tracking (loading, connected, error, no-plugin detection)
- Vue plugin for remotes with automatic iframe detection
- Configurable connection timeout and allowed origins

## Installation

```bash
yarn add @sprlab/microfront
```

Peer dependencies:

```bash
yarn add vue
yarn add vue-router  # optional, only if using route synchronization
```

## Usage

### Shell (host application)

#### Basic setup with RemoteApp component

```vue
<template>
  <RemoteApp
    src="http://localhost:4001"
    title="Remote 1"
  />
</template>

<script setup lang="ts">
import { RemoteApp } from '@sprlab/microfront/shell'
</script>
```

#### Messaging with useRemote composable

```vue
<template>
  <div>
    <article v-if="isLoading" aria-busy="true">Connecting...</article>
    <article v-else-if="isError">Connection error</article>
    <article v-else-if="isNoPlugin">Remote loaded but missing @sprlab/microfront plugin</article>
    <template v-if="isConnected">
      <button @click="sendToRemote">Send</button>
    </template>
    <RemoteApp src="http://localhost:4001" title="Remote 1" />
  </div>
</template>

<script setup lang="ts">
import { RemoteApp, useRemote } from '@sprlab/microfront/shell'

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

<script setup lang="ts">
import { RemoteApp } from '@sprlab/microfront/shell'
</script>
```

The shell router needs a catch-all route for the remote:

```ts
{ path: '/remote2/:path(.*)*', component: Remote2View }
```

When `basePath` is provided, RemoteApp automatically:
- Reads the sub-path from the shell URL and passes it to the iframe
- Updates the shell URL when the remote navigates internally
- Preserves the route on page refresh


### Remote (child application)

#### Basic setup with Vue plugin

```ts
import { createApp } from 'vue'
import { sprRemote } from '@sprlab/microfront/remote'
import App from './App.vue'

createApp(App)
  .use(sprRemote, { appName: 'remote1' })
  .mount('#app')
```

#### With router synchronization

```ts
import { createApp } from 'vue'
import { sprRemote } from '@sprlab/microfront/remote'
import App from './App.vue'
import router from './router'

createApp(App)
  .use(sprRemote, { appName: 'remote2', router })
  .use(router)
  .mount('#app')
```

#### Sending and receiving messages

```vue
<script setup lang="ts">
import { send, onMessage } from '@sprlab/microfront/remote'

onMessage((payload) => {
  console.log('Received from shell:', payload)
})

function sendToShell() {
  send({ greeting: 'hello from remote' })
}
</script>
```

The plugin automatically detects if the app is running inside an iframe. When running standalone, the plugin does nothing — the app works independently without errors.

## API Reference

### Shell exports (`@sprlab/microfront/shell`)

#### `RemoteApp` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | required | URL of the remote application |
| `title` | `string` | required | Iframe title for accessibility |
| `basePath` | `string` | `''` | Shell route prefix for route synchronization |
| `timeout` | `number` | `10000` | Connection timeout in milliseconds |
| `allowedOrigins` | `string[]` | `['*']` | Allowed origins for postMessage security |

#### `useRemote()` composable

Returns:

| Property | Type | Description |
|----------|------|-------------|
| `sendMessage` | `(payload: unknown) => Promise<void>` | Send a message to the remote |
| `onMessage` | `(handler) => void` | Register a handler for messages from the remote |
| `onRouteChange` | `(handler) => void` | Register a handler for route changes from the remote |
| `isLoading` | `ComputedRef<boolean>` | True while connecting |
| `isConnected` | `ComputedRef<boolean>` | True when connected |
| `isError` | `ComputedRef<boolean>` | True when server is unreachable |
| `isNoPlugin` | `ComputedRef<boolean>` | True when server responds but plugin is missing |

### Remote exports (`@sprlab/microfront/remote`)

#### `sprRemote` plugin

Options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appName` | `string` | `'unknown'` | Identifier sent as metadata with messages |
| `router` | `Router` | `undefined` | Vue Router instance for route synchronization |
| `allowedOrigins` | `string[]` | `['*']` | Allowed origins for postMessage security |

#### `send(payload: unknown)`

Send a message to the shell. Includes `appName` as metadata automatically.

#### `onMessage(handler: (payload: unknown) => void)`

Register a handler for messages received from the shell.

## Architecture

```
┌─────────────────────────────────────────┐
│ Shell (host)          localhost:4000     │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ RemoteApp (iframe)              │    │
│  │   src="localhost:4001"          │    │
│  │                                 │    │
│  │  ┌───────────────────────────┐  │    │
│  │  │ Remote 1    localhost:4001│  │    │
│  │  │                           │  │    │
│  │  │ .use(sprRemote)           │  │    │
│  │  └───────────────────────────┘  │    │
│  │                                 │    │
│  │  penpal ←→ messaging            │    │
│  │  open-iframe-resizer ←→ resize  │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

## Dependencies

- [penpal](https://github.com/Aaronius/penpal) — Promise-based iframe messaging
- [open-iframe-resizer](https://github.com/Lemick/open-iframe-resizer) — Automatic iframe resizing (MIT)

## License

MIT
