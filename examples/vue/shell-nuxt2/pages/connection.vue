<template>
  <div class="page">
    <h1>Connection</h1>

    <p v-if="isLoading" data-test-id="status">Connecting to Remote...</p>
    <p v-else-if="isError" data-test-id="status">Connection error — remote unreachable</p>
    <p v-else-if="isNoPlugin" data-test-id="status">
      Remote responded but the sprRemote plugin is missing
    </p>
    <template v-else>
      <p data-test-id="status">Connected</p>
      <p>Shell counter: {{ shellCounter }}</p>
      <button data-test-id="send" @click="sendToRemote">
        Send to Remote: {{ shellCounter }}
      </button>
      <p data-test-id="received">Received from Remote: {{ remoteCounter }}</p>
    </template>

    <hr>

    <client-only>
      <RemoteApp :src="remoteUrl" title="Connection Example" />
    </client-only>
  </div>
</template>

<script>
import { createRemoteMessenger } from '@sprlab/microfront/nuxt2/shell'

export default {
  name: 'ConnectionPage',

  // RemoteApp injects this key to report status and relay messages
  provide() {
    return { 'remote-messenger': this.messenger }
  },

  data() {
    return {
      // Must live in data(): that is what makes `status` reactive in Vue 2
      messenger: createRemoteMessenger(),
      shellCounter: 0,
      remoteCounter: 0,
    }
  },

  computed: {
    remoteUrl() {
      return process.env.remoteConnectionUrl
    },
    isLoading() {
      return this.messenger.status === 'loading'
    },
    isError() {
      return this.messenger.status === 'error'
    },
    isNoPlugin() {
      return this.messenger.status === 'no-plugin'
    },
  },

  mounted() {
    this.messenger.onMessage((payload, metadata) => {
      console.log(`Message from: ${metadata.appName}`)
      this.remoteCounter = payload.counter
    })
  },

  methods: {
    sendToRemote() {
      this.shellCounter++
      this.messenger.send({ counter: this.shellCounter })
    },
  },
}
</script>
