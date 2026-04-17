<template>
  <RemoteApp
    :src="remoteUrl"
    title="Remote 2"
    basePath="/remote2"
    fullHeight
  />
</template>

<script setup lang="ts">
import { RemoteApp } from '@sprlab/microfront/shell'

const remoteUrl = import.meta.env.VITE_REMOTE2_URL
</script>
