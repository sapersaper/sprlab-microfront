<template>
  <h1>Vue 3 Connection Example</h1>
  <p>Shell counter: {{ shellCounter }}</p>
  <button @click="sendToShell">
    Send to Shell: {{ localCounter }}
  </button>
  <br /><br />
  <button @click="showLorem = !showLorem">
    {{ showLorem ? 'Hide' : 'Show' }} Lorem Ipsum
  </button>
  <LoremIpsum v-if="showLorem" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { send, onMessage } from '@sprlab/microfront/vue/remote'
import LoremIpsum from '@/components/LoremIpsum.vue'

const shellCounter = ref(0)
const localCounter = ref(0)
const showLorem = ref(false)

onMessage((payload: any) => {
  shellCounter.value = payload.counter
})

function sendToShell() {
  localCounter.value++
  send({ counter: localCounter.value })
}
</script>
