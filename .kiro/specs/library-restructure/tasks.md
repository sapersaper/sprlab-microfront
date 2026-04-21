# Implementation Plan: Library Restructure

## Overview

Restructure `@sprlab/microfront` from a Vue-coupled library into a layered architecture with a framework-agnostic Core Module and Vue-specific wrappers. The implementation proceeds bottom-up: extract core logic first, then create Vue wrappers that delegate to core, then wire backward-compatible re-exports, update the build, move example apps, and finally update tests.

## Tasks

- [x] 1. Create Core Module with framework-agnostic logic
  - [x] 1.1 Create `src/core/types.ts` with all shared types, interfaces, and enums
    - Define `ConnectionStatus` enum, `MessageEnvelope`, `MessageHandler`, `RouteChangeHandler`, `RouterAdapter`, `ShellConnectionOptions`, `RemoteInitOptions`, `PenpalHandle`, `RemoteConnection`, and `Messenger` interfaces
    - _Requirements: 1.7, 8.1_

  - [x] 1.2 Create `src/core/iframe.ts` with `isInsideIframe()` function
    - Extract the `window.self !== window.parent` check from `src/remote/index.ts`
    - _Requirements: 1.4_

  - [x] 1.3 Create `src/core/history.ts` with `patchHistoryPushState()` function
    - Extract the `window.history.pushState` override from `src/remote/index.ts` into a standalone function
    - _Requirements: 1.3_

  - [x] 1.4 Create `src/core/height.ts` with `observeContentHeight(onHeight)` function
    - Extract the ResizeObserver logic from `src/remote/index.ts` into a function that accepts a callback and returns a cleanup function
    - _Requirements: 1.2_

  - [x] 1.5 Create `src/core/messenger.ts` with `createMessenger()` function
    - Extract and adapt the messenger creation logic from `src/shell/useRemote.ts` to return a framework-agnostic `Messenger` (no Vue refs, plain values)
    - _Requirements: 1.6_

  - [x] 1.6 Create `src/core/connection.ts` with `connectToRemote()` and `initRemote()` functions
    - `connectToRemote`: wraps penpal `connect()` for shell-side, accepts `ShellConnectionOptions`, returns `PenpalHandle`
    - `initRemote`: orchestrates remote-side setup (iframe check, height observer, history patch, penpal connect, optional RouterAdapter route sync), accepts `RemoteInitOptions`, returns `RemoteConnection`
    - _Requirements: 1.1, 1.5, 8.2, 8.3_

  - [x] 1.7 Create `src/core/index.ts` barrel export
    - Re-export all public functions and types from `types.ts`, `iframe.ts`, `history.ts`, `height.ts`, `messenger.ts`, `connection.ts`
    - Ensure zero Vue/React/Angular imports in the entire `core/` directory
    - _Requirements: 1.8_

- [x] 2. Checkpoint — Verify Core Module compiles
  - Ensure `src/core/index.ts` compiles with `vue-tsc --noEmit` (or `tsc --noEmit`), ask the user if questions arise.

- [x] 3. Create Vue Module wrapping Core
  - [x] 3.1 Create `src/vue/routerAdapter.ts` with `createVueRouterAdapter(router)` factory
    - Return a `RouterAdapter` that delegates `getCurrentPath`, `replace`, and `afterEach` to the Vue Router instance
    - Support Vue Router v3, v4, and v5
    - _Requirements: 8.4_

  - [x] 3.2 Create `src/vue/messaging.ts` with `send()` and `onMessage()` wrappers
    - Thin wrappers around core messaging that maintain module-level remote state (same pattern as current `src/remote/index.ts`)
    - _Requirements: 2.6_

  - [x] 3.3 Create `src/vue/sprRemote.ts` Vue 3 plugin
    - Adapt current `sprRemote` from `src/remote/index.ts` to delegate to `core.initRemote()` with a `createVueRouterAdapter`
    - _Requirements: 2.3, 2.6_

  - [x] 3.4 Create `src/vue/sprRemoteLegacy.ts` Vue 2 / Nuxt 2 initializer
    - Adapt current `sprRemoteLegacy` from `src/remote/index.ts` to delegate to `core.initRemote()` with a `createVueRouterAdapter`
    - _Requirements: 2.4, 2.6_

  - [x] 3.5 Move and adapt `src/shell/useRemote.ts` → `src/vue/useRemote.ts`
    - Refactor to use `core.createMessenger()` internally, wrapping the plain messenger with Vue `ref`/`computed` for reactivity
    - Keep the same public API: `sendMessage`, `onMessage`, `onRouteChange`, `isLoading`, `isConnected`, `isError`, `isNoPlugin`
    - _Requirements: 2.2, 2.6_

  - [x] 3.6 Move and adapt `src/shell/RemoteApp.vue` → `src/vue/RemoteApp.vue`
    - Refactor to use `core.connectToRemote()` instead of directly calling penpal `connect()`
    - Keep the same props and template
    - _Requirements: 2.1, 2.6_

  - [x] 3.7 Create `src/vue/index.ts` barrel export
    - Export all shell-side symbols: `RemoteApp`, `useRemote`, `RemoteStatus`, `RemoteMessenger`, `RemoteMessageEnvelope`
    - Export all remote-side symbols: `sprRemote`, `sprRemoteLegacy`, `send`, `onMessage`, `SprRemoteOptions`
    - Export `createVueRouterAdapter`
    - _Requirements: 2.5_

- [x] 4. Create backward-compatible re-export modules
  - [x] 4.1 Rewrite `src/shell/index.ts` to re-export shell symbols from `../vue/index`
    - Export `RemoteApp`, `useRemote`, `RemoteStatus` and types `RemoteMessenger`, `RemoteMessageEnvelope`
    - _Requirements: 3.3_

  - [x] 4.2 Rewrite `src/remote/index.ts` to re-export remote symbols from `../vue/index`
    - Export `sprRemote`, `sprRemoteLegacy`, `send`, `onMessage` and type `SprRemoteOptions`
    - _Requirements: 3.3_

- [x] 5. Checkpoint — Verify all modules compile
  - Ensure all four entry points (`core`, `vue`, `shell`, `remote`) compile without errors, ask the user if questions arise.

- [x] 6. Update build configuration and package.json
  - [x] 6.1 Update `vite.config.ts` to build four entry points
    - Add `core` and `vue` entries alongside existing `shell` and `remote`
    - Add `penpal` and `@open-iframe-resizer/core` to rollup externals
    - _Requirements: 3.4, 5.1_

  - [x] 6.2 Update `package.json` exports map
    - Add `./core` and `./vue` subpath entries with `import` and `types` fields
    - Keep `./shell` and `./remote` entries unchanged
    - _Requirements: 3.1, 3.2, 5.4_

  - [x] 6.3 Update `tsconfig.json` if needed for declaration generation
    - Ensure `vue-tsc` generates `.d.ts` files for all four entry points into `dist/`
    - _Requirements: 3.5, 5.2_

- [x] 7. Checkpoint — Verify build succeeds
  - Run `yarn build` in `libs/spr-microfront/` and verify `dist/` contains `core.js`, `vue.js`, `shell.js`, `remote.js` and corresponding `.d.ts` files. Ask the user if questions arise.

- [x] 8. Move example apps to `examples/vue/`
  - [x] 8.1 Move `shell/`, `remote1/`, `remote2/`, `remote3/` directories to `examples/vue/`
    - Move each directory preserving all contents including `.gitignore`, `.yarnrc.yml`, `yarn.lock`
    - _Requirements: 4.1, 7.1, 7.2_

  - [x] 8.2 Update `file:` dependency paths in each example app's `package.json`
    - Change the `@sprlab/microfront` dependency path from the old relative location to resolve correctly from `examples/vue/<app>/` to `libs/spr-microfront/`
    - _Requirements: 4.3_

  - [x] 8.3 Update root `package.json` scripts
    - Update all `--cwd` paths from `shell`, `remote1`, etc. to `examples/vue/shell`, `examples/vue/remote1`, etc.
    - Ensure `yarn dev` starts all apps on the same ports (shell:4000, remote1:4001, remote2:4002, remote3:3000)
    - _Requirements: 4.2_

  - [x] 8.4 Update root `.gitmodules` if it references any moved paths
    - _Requirements: 7.2_

  - [x] 8.5 Update `e2e/e2e.test.ts` if it references example app paths
    - _Requirements: 6.4_

- [x] 9. Checkpoint — Verify example apps resolve library correctly
  - Run `yarn install` in one example app to confirm the `file:` dependency resolves. Ask the user if questions arise.

- [x] 10. Update and migrate tests
  - [x] 10.1 Create `src/core/__tests__/core.test.ts` with unit tests for core functions
    - Test `isInsideIframe`, `patchHistoryPushState`, `observeContentHeight`, `createMessenger` API shape
    - _Requirements: 6.1_

  - [x] 10.2 Migrate `src/shell/__tests__/useRemote.test.ts` → `src/vue/__tests__/useRemote.test.ts`
    - Update imports to reference `../useRemote` (now in `vue/`)
    - Verify all existing assertions still pass
    - _Requirements: 6.2_

  - [x] 10.3 Migrate `src/remote/__tests__/remote.test.ts` → `src/vue/__tests__/remote.test.ts`
    - Update imports to reference `../sprRemote`, `../messaging` (now in `vue/`)
    - Verify all existing assertions still pass
    - _Requirements: 6.3_

  - [ ]* 10.4 Write property test: History patch prevents history growth (Property 1)
    - **Property 1: History patch prevents history growth**
    - Use fast-check to generate arbitrary state objects and URL strings, assert `history.length` does not increase after `patchHistoryPushState()`
    - **Validates: Requirements 1.3**

  - [ ]* 10.5 Write property test: Message broadcast to all handlers (Property 2)
    - **Property 2: Message broadcast to all handlers**
    - Use fast-check to generate random handler counts (1–20) and arbitrary payloads, assert every handler is called exactly once
    - **Validates: Requirements 1.6**

  - [ ]* 10.6 Write property test: Backward-compatible re-exports equivalence (Property 3)
    - **Property 3: Backward-compatible re-exports equivalence**
    - Dynamically import `shell/index` and `vue/index`, assert every exported symbol from shell has identical reference in vue; same for remote
    - **Validates: Requirements 3.3**

  - [ ]* 10.7 Write property test: RouterAdapter route synchronization (Property 4)
    - **Property 4: RouterAdapter route synchronization**
    - Use fast-check to generate arbitrary path strings, mock a RouterAdapter, call the shell navigate method, assert `adapter.replace` receives the exact path
    - **Validates: Requirements 8.2**

  - [ ]* 10.8 Write property test: Vue RouterAdapter factory delegation (Property 5)
    - **Property 5: Vue RouterAdapter factory delegation**
    - Use fast-check to generate arbitrary path strings, create a mock Vue Router, call `createVueRouterAdapter(router)`, assert `getCurrentPath()` and `replace()` delegate correctly
    - **Validates: Requirements 8.4**

- [x] 11. Final checkpoint — Run full test suite
  - Run `yarn test` in `libs/spr-microfront/` and ensure all unit and property tests pass. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after each major phase
- Property tests validate universal correctness properties from the design document
- The implementation proceeds bottom-up: core → vue wrappers → re-exports → build → examples → tests
