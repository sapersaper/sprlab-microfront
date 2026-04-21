<template>
  <RemoteApp
    :src="remoteUrl"
    title="Vue2 FullHeight Example"
    basePath="/vue2-fullheight"
    fullHeight
  />
</template>

<script setup lang="ts">
import { RemoteApp } from '@sprlab/microfront/vue/shell'

const remoteUrl = import.meta.env.VITE_REMOTE_VUE2_FULLHEIGHT_URL
</script>
