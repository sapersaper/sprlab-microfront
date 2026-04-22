<template>
  <RemoteApp
    :src="remoteUrl"
    title="MPA FullHeight Example"
    basePath="/mpag-fullheight"
    fullHeight
  />
</template>

<script setup lang="ts">
import { RemoteApp } from '@sprlab/microfront/vue/shell'

const remoteUrl = import.meta.env.VITE_REMOTE_MPAG_FULLHEIGHT_URL
</script>
