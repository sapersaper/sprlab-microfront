<template>
  <nav class="container">
    <ul>
      <li><strong>Micro Frontend - iframe</strong></li>
    </ul>
    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li>
        <details class="dropdown">
          <summary>Connection</summary>
          <ul>
            <li><router-link to="/connection">Vue 3</router-link></li>
            <li><router-link to="/vue2-connection">Nuxt 2</router-link></li>
            <li><router-link to="/react-connection">React</router-link></li>
            <li><router-link to="/angular-connection">Angular</router-link></li>
          </ul>
        </details>
      </li>
      <li>
        <details class="dropdown">
          <summary>Route</summary>
          <ul>
            <li><router-link to="/route">Vue 3</router-link></li>
            <li><router-link to="/vue2-route">Nuxt 2</router-link></li>
            <li><router-link to="/react-route">React</router-link></li>
            <li><router-link to="/angular-route">Angular</router-link></li>
          </ul>
        </details>
      </li>
      <li>
        <details class="dropdown">
          <summary>FullHeight</summary>
          <ul>
            <li><router-link to="/fullheight">Vue 3</router-link></li>
            <li><router-link to="/vue2-fullheight">Nuxt 2</router-link></li>
            <li><router-link to="/react-fullheight">React</router-link></li>
            <li><router-link to="/angular-fullheight">Angular</router-link></li>
          </ul>
        </details>
      </li>
    </ul>
  </nav>
</template>
