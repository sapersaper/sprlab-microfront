<template>
  <!--
    Intentionally empty.

    Registers /route/* as a CHILD of pages/route.vue. Two effects, both required for
    the iframe to survive navigation:

    1. /route and /route/<anything> resolve to the same top-level route record, so
       Vue Router reuses the pages/route.vue component instance.
    2. Nuxt 2 keys <NuxtChild> by $route.path unless the route has children, in which
       case it uses compile($route.matched[0].path) — '/route' for every sub-path. A
       stable key means Nuxt does not destroy and re-create the page.
  -->
  <div />
</template>

<script>
export default {
  name: 'RouteCatchAll',
}
</script>
