<template>
  <RemoteApp
    :src="remoteUrl"
    title="FullHeight Example"
    basePath="/fullheight"
    fullHeight
  />
</template>

<script setup lang="ts">
import { RemoteApp } from '@sprlab/microfront/vue/shell'

const remoteUrl = import.meta.env.VITE_REMOTE_FULLHEIGHT_URL
</script>
