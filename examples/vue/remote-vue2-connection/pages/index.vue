<template>
  <div>
    <h1>Nuxt 2 Connection Example</h1>
    <p>Shell counter: {{ shellCounter }}</p>
    <button @click="sendToShell">
      Send to Shell: {{ localCounter }}
    </button>
    <br /><br />
    <button @click="showLorem = !showLorem">
      {{ showLorem ? 'Hide' : 'Show' }} Lorem Ipsum
    </button>
    <div v-if="showLorem">
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
      <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
      <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
      <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum.</p>
    </div>
  </div>
</template>

<script>
import { send, onMessage } from '@sprlab/microfront/dist/remote.js'

export default {
  data() {
    return {
      shellCounter: 0,
      localCounter: 0,
      showLorem: false,
    }
  },
  mounted() {
    onMessage((payload) => {
      this.shellCounter = payload.counter
    })
  },
  methods: {
    sendToShell() {
      this.localCounter++
      send({ counter: this.localCounter })
    },
  },
}
</script>
