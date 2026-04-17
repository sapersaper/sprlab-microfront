<template>
  <!-- <div> -->
    <article v-if="isLoading" aria-busy="true">Conectando con Remote 3...</article>
    <article v-else-if="isError">Error al conectar con Remote 3</article>
    <article v-else-if="isNoPlugin">
      ⚠️ Remote 3 cargó pero no tiene @spr/microfront instalado
    </article>
    <RemoteApp
      :src="remoteUrl"
      title="Remote 3"
      basePath="/remote3"
      fullHeight
    />
  <!-- </div> -->
</template>

<script setup lang="ts">
import { RemoteApp, useRemote } from '@sprlab/microfront/shell'

const remoteUrl = import.meta.env.VITE_REMOTE3_URL
const { isLoading, isError, isNoPlugin } = useRemote()
</script>
