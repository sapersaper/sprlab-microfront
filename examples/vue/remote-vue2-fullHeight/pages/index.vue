<template>
  <div>
    <p>Redirecting...</p>
  </div>
</template>

<script>
export default {
  middleware({ redirect }) {
    redirect('/small')
  },
}
</script>
