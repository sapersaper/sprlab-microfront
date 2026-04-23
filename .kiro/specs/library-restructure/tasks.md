# Implementation Plan: Library Architecture

## Overview

Full implementation status of `@sprlab/microfront` — framework-agnostic core with Vue 3, Vue 2/Nuxt 2, React, Angular, and MPA (generic) support.

## Tasks

- [x] 1. Core Module — framework-agnostic logic
  - [x] 1.1 `src/core/types.ts` — shared types, interfaces, enums (RouterAdapter, ConnectionStatus, etc.)
  - [x] 1.2 `src/core/iframe.ts` — `isInsideIframe()`
  - [x] 1.3 `src/core/history.ts` — `patchHistoryPushState()`
  - [x] 1.4 `src/core/height.ts` — `observeContentHeight()` with ResizeObserver
  - [x] 1.5 `src/core/messenger.ts` — `createMessenger()` state machine
  - [x] 1.6 `src/core/connection.ts` — `connectToRemote()`, `initRemote()`, `onShellContainerHeight`
  - [x] 1.7 `src/core/index.ts` — barrel export, zero framework deps

- [x] 2. Vue Module — Vue 3 wrappers
  - [x] 2.1 `src/vue/routerAdapter.ts` — `createVueRouterAdapter()` (Vue Router v3/v4/v5)
  - [x] 2.2 `src/vue/messaging.ts` — `send()`, `onMessage()` wrappers
  - [x] 2.3 `src/vue/sprRemote.ts` — Vue 3 plugin delegating to `core.initRemote()`
  - [x] 2.4 `src/vue/sprRemoteLegacy.ts` — Vue 2/Nuxt 2 initializer
  - [x] 2.5 `src/vue/useRemote.ts` — composable with reactive status
  - [x] 2.6 `src/vue/RemoteApp.vue` — shell component with `fullHeight` prop
  - [x] 2.7 `src/vue/index.ts` — barrel export

- [x] 3. React Module — React adapter
  - [x] 3.1 `src/react/routerAdapter.ts` — `createReactRouterAdapter()` (React Router v6+/v7)
  - [x] 3.2 `src/react/remote.ts` — `initReactRemote()` with auto router adapter

- [x] 4. Angular Module — Angular adapter
  - [x] 4.1 `src/angular/routerAdapter.ts` — `createAngularRouterAdapter()` (Angular Router v15+)
  - [x] 4.2 `src/angular/remote.ts` — `initAngularRemote()` with auto router adapter

- [x] 5. Backward-compatible aliases
  - [x] 5.1 `src/shell/index.ts` — re-exports from `vue/`
  - [x] 5.2 `src/remote/index.ts` — re-exports from `vue/` (direct imports to avoid pulling vue-router)

- [x] 6. Build configuration
  - [x] 6.1 `vite.config.ts` — 6 entry points (core, vue, shell, remote, react-remote, angular-remote)
  - [x] 6.2 `package.json` exports — `./core`, `./vue`, `./vue/shell`, `./vue/remote`, `./shell`, `./remote`, `./react/remote`, `./angular/remote`
  - [x] 6.3 Removed `@open-iframe-resizer/core` dependency
  - [x] 6.4 `vue` and `vue-router` as optional peer dependencies

- [x] 7. FullHeight feature
  - [x] 7.1 `fullHeight` prop on RemoteApp — `min-height: 100%`
  - [x] 7.2 `requestRemoteHeight()` — forces iframe to container height via DOM, double rAF, penpal measurement
  - [x] 7.3 `onShellContainerHeight()` in remote — double rAF before measuring scrollHeight
  - [x] 7.4 Tall→Small transition working correctly

- [x] 8. Project structure
  - [x] 8.1 Library moved to `lib/` subfolder
  - [x] 8.2 Examples organized: `examples/vue/`, `examples/react/`, `examples/angular/`
  - [x] 8.3 Root `package.json` as workspace with dev scripts

- [x] 9. Vue 3 examples
  - [x] 9.1 `examples/vue/shell/` — Vue 3 host with dropdown nav (Vue 3 / Nuxt 2 / React / Angular)
  - [x] 9.2 `examples/vue/remote-vue-connection/` — messaging (port 4001)
  - [x] 9.3 `examples/vue/remote-vue-route/` — route sync (port 4002)
  - [x] 9.4 `examples/vue/remote-vue-fullHeight/` — fullHeight with 3 pages (port 4004)

- [x] 10. Nuxt 2 examples
  - [x] 10.1 `examples/vue/remote-vue2-connection/` — messaging (port 4005)
  - [x] 10.2 `examples/vue/remote-vue2-route/` — route sync (port 4006)
  - [x] 10.3 `examples/vue/remote-vue2-fullHeight/` — fullHeight (port 4007)
  - [x] 10.4 Nuxt 2 config: `mode: 'spa'`, transpile, penpal webpack alias

- [x] 11. React examples
  - [x] 11.1 `examples/react/remote-react-connection/` — messaging (port 4010)
  - [x] 11.2 `examples/react/remote-react-route/` — route sync (port 4011)
  - [x] 11.3 `examples/react/remote-react-fullHeight/` — fullHeight (port 4012)

- [x] 12. Angular examples
  - [x] 12.1 `examples/angular/remote-angular-connection/` — messaging (port 4020)
  - [x] 12.2 `examples/angular/remote-angular-route/` — route sync (port 4021)
  - [x] 12.3 `examples/angular/remote-angular-fullHeight/` — fullHeight (port 4022)
  - [x] 12.4 Angular-specific: `ViewEncapsulation.None` for fullHeight, `router-outlet { display: none }` for grid layout

- [x] 13. MPA Generic examples
  - [x] 13.1 `examples/mpa-generic/shared/server.js` — shared HTTP server
  - [x] 13.2 `examples/mpa-generic/remote-mpag-connection/` — messaging (port 4030)
  - [x] 13.3 `examples/mpa-generic/remote-mpag-route/` — route sync with full page reloads (port 4031)
  - [x] 13.4 `examples/mpa-generic/remote-mpag-fullHeight/` — fullHeight (port 4032)
  - [x] 13.5 Import maps for penpal resolution in browser
  - [x] 13.6 Shell reconnects penpal on iframe load (MPA support in RemoteApp.vue)
  - [x] 13.7 `initRemote()` sends `window.location.pathname` on connect (even without router)
  - [x] 13.8 MPA back navigation uses `replace()` to avoid double-back
  - [ ] 13.9 Known limitation: MPA forward navigation after leaving the remote doesn't work (component remounts with default page)

- [x] 14. Back/Forward navigation fix
  - [x] 14.1 connectionTime grace period (500ms) — use replace for initial sync to avoid duplicate history entries
  - [x] 14.2 popstate detection — skip push/replace during back/forward to preserve history stack
  - [x] 14.3 Fixed for Vue 3, Nuxt 2, React, Angular
  - [x] 14.4 MPA back works correctly
  - [ ] 14.5 MPA forward after leaving remote — known limitation

- [x] 14. Developer tooling
  - [x] 14.1 `scripts/use-lib.js` — switch between `link:/file:` (local) and npm
  - [x] 14.2 `scripts/kill-ports.sh` — kill dev server ports before starting
  - [x] 14.3 Root scripts: `yarn dev`, `yarn dev:vue2`, `yarn dev:react`, `yarn dev:angular`, `yarn dev:mpag`, `yarn dev:all`
  - [x] 14.4 `yarn use:local` / `yarn use:npm` / `yarn install:all`

- [x] 15. Published versions
  - [x] 15.1 v0.1.2 — initial restructure (core/vue separation)
  - [x] 15.2 v0.1.3 — removed @open-iframe-resizer/core, added fullHeight
  - [x] 15.3 v0.2.0 — React support, new import paths (vue/shell, vue/remote, react/remote)
  - [x] 15.4 v0.3.0 — Angular support (angular/remote)
  - [x] 15.5 v0.4.0 — MPA support (iframe load reconnection, route sync without router)
  - [x] 15.6 v0.4.1 — Fixed back/forward for all SPA frameworks (connectionTime grace period), MPA back works, MPA forward is known limitation
  - [x] 15.7 v0.4.2 — MPA standalone bundle (mpa-remote.js with penpal bundled, no import map needed)

- [ ]* 16. Optional: Property-based tests
  - [ ]* 16.1 History patch prevents history growth
  - [ ]* 16.2 Message broadcast to all handlers
  - [ ]* 16.3 Backward-compatible re-exports equivalence
  - [ ]* 16.4 RouterAdapter route synchronization
  - [ ]* 16.5 React RouterAdapter delegation
  - [ ]* 16.6 Angular RouterAdapter delegation

## Notes

- Tasks marked with `*` are optional
- All Vue 3, Nuxt 2, React, Angular, and MPA examples tested end-to-end via Playwright
- Nuxt 2 uses `file:` (copies dist only), Vue 3, React, and Angular use `link:` (symlink)
- MPA examples use plain HTML served by a Node HTTP server, no npm dependencies
- `penpal` is the only runtime dependency
- Known limitation: MPA forward navigation after leaving the remote doesn't work (component remounts)
