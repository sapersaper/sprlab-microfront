<template>
  <div>
    <article v-if="isLoading" aria-busy="true">Connecting to Remote...</article>
    <article v-else-if="isError">Connection error</article>
    <template v-else>
      <p>Shell counter: {{ shellCounter }}</p>
      <button @click="sendToRemote">Send to Remote: {{ shellCounter }}</button>
      <p>Received from Remote: {{ remoteCounter }}</p>
    </template>
    <hr />
    <RemoteApp
      :src="remoteUrl"
      title="MPA Connection Example"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RemoteApp, useRemote } from '@sprlab/microfront/vue/shell'

const remoteUrl = import.meta.env.VITE_REMOTE_MPAG_CONNECTION_URL
const { sendMessage, onMessage, isLoading, isError } = useRemote()

const shellCounter = ref(0)
const remoteCounter = ref(0)

function sendToRemote() {
  shellCounter.value++
  sendMessage({ counter: shellCounter.value })
}

onMessage((payload: any, metadata) => {
  console.log(`Message from: ${metadata.appName}`)
  remoteCounter.value = payload.counter
})
</script>
