<template>
  <RemoteApp
    :src="remoteUrl"
    title="Angular FullHeight Example"
    basePath="/angular-fullheight"
    fullHeight
  />
</template>

<script setup lang="ts">
import { RemoteApp } from '@sprlab/microfront/vue/shell'

const remoteUrl = import.meta.env.VITE_REMOTE_ANGULAR_FULLHEIGHT_URL
</script>
