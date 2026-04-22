<template>
  <RemoteApp
    :src="remoteUrl"
    title="Angular Route Example"
    basePath="/angular-route"
  />
</template>

<script setup lang="ts">
import { RemoteApp } from '@sprlab/microfront/vue/shell'

const remoteUrl = import.meta.env.VITE_REMOTE_ANGULAR_ROUTE_URL
</script>
