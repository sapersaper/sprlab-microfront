<template>
  <RemoteApp
    :src="remoteUrl"
    title="React Route Example"
    basePath="/react-route"
  />
</template>

<script setup lang="ts">
import { RemoteApp } from '@sprlab/microfront/vue/shell'

const remoteUrl = import.meta.env.VITE_REMOTE_REACT_ROUTE_URL
</script>
