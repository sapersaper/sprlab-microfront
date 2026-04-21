<template>
  <RemoteApp
    :src="remoteUrl"
    title="Route Example"
    basePath="/route"
    fullHeight
  />
</template>

<script setup lang="ts">
import { RemoteApp } from '@sprlab/microfront/vue/shell'

const remoteUrl = import.meta.env.VITE_REMOTE_ROUTE_URL
</script>
