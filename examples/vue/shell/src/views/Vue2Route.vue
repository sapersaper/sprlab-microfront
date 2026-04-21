<template>
  <RemoteApp
    :src="remoteUrl"
    title="Vue2 Route Example"
    basePath="/vue2-route"
  />
</template>

<script setup lang="ts">
import { RemoteApp } from '@sprlab/microfront/vue/shell'

const remoteUrl = import.meta.env.VITE_REMOTE_VUE2_ROUTE_URL
</script>
