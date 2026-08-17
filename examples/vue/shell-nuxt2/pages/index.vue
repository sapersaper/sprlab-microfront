<template>
  <div class="page">
    <h1>Nuxt 2 shell</h1>
    <p>
      Hosts the same remotes as the Vue 3 shell, through
      <code>@sprlab/microfront/nuxt2/shell</code>.
    </p>

    <h2>Connection</h2>
    <p>
      Messaging and connection status via <code>createRemoteMessenger()</code>, the
      Vue 2 counterpart of <code>useRemote()</code>.
    </p>

    <h2>Route</h2>
    <p>
      Bidirectional route sync. Nuxt 2 keys <code>&lt;NuxtChild&gt;</code> by
      <code>$route.path</code>, so hosting a remote needs the base path and its
      sub-paths to resolve through one route record. That is what the empty
      <code>pages/route/_.vue</code> is for: it makes <code>/route/*</code> a child of
      <code>/route</code>, which keeps the key at <code>/route</code> and stops Nuxt
      from re-mounting the page — and destroying the iframe — on every navigation.
    </p>
    <p>
      Navigate with the links above, or from inside the iframe, and watch the URL
      follow in both directions without the remote reloading.
    </p>

    <h2>FullHeight</h2>
    <p>The iframe fills its container and grows when the remote content is taller.</p>
  </div>
</template>
