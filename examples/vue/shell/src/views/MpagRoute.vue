<template>
  <RemoteApp
    :src="remoteUrl"
    title="MPA Route Example"
    basePath="/mpag-route"
  />
</template>

<script setup lang="ts">
import { RemoteApp } from '@sprlab/microfront/vue/shell'

const remoteUrl = import.meta.env.VITE_REMOTE_MPAG_ROUTE_URL
</script>
