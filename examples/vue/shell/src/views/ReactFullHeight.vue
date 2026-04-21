<template>
  <RemoteApp
    :src="remoteUrl"
    title="React FullHeight Example"
    basePath="/react-fullheight"
    fullHeight
  />
</template>

<script setup lang="ts">
import { RemoteApp } from '@sprlab/microfront/vue/shell'

const remoteUrl = import.meta.env.VITE_REMOTE_REACT_FULLHEIGHT_URL
</script>
