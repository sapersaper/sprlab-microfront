# Requirements Document

## Introduction

The `@sprlab/microfront` library provides a micro frontend architecture using iframes with automatic resizing, bidirectional messaging, and route synchronization. The library is structured as a framework-agnostic core with framework-specific adapters for Vue 3, Vue 2/Nuxt 2, React, and Angular. The project includes example applications for each framework to validate functionality.

## Glossary

- **Core_Module**: The framework-agnostic JavaScript module exported as `@sprlab/microfront/core`, containing pure logic for penpal connection, ResizeObserver-based iframe resizing, bidirectional messaging, iframe detection, and history patching.
- **Vue_Module**: The Vue-specific wrapper module exported as `@sprlab/microfront/vue/shell` and `@sprlab/microfront/vue/remote`, containing RemoteApp component, useRemote composable, sprRemote plugin, and sprRemoteLegacy initializer.
- **React_Module**: The React-specific adapter exported as `@sprlab/microfront/react/remote`, containing `initReactRemote` and `createReactRouterAdapter`.
- **Angular_Module**: The Angular-specific adapter exported as `@sprlab/microfront/angular/remote`, containing `initAngularRemote` and `createAngularRouterAdapter`.
- **Shell**: The host application (Vue 3) that embeds remote micro frontends via iframes.
- **Remote**: A child application embedded inside an iframe within the Shell. Can be Vue 3, Vue 2/Nuxt 2, React, or Angular.
- **Penpal_Connection**: A bidirectional RPC channel between Shell and Remote established via the penpal library over postMessage.
- **Build_System**: The Vite-based build pipeline that produces distributable ES module bundles and TypeScript declarations for the library.
- **Example_Apps**: The set of demonstration applications organized by framework (Vue 3, Nuxt 2, React, Angular) used to validate library functionality.
- **Package_Exports**: The `exports` field in package.json that maps subpath imports to their corresponding bundle files and type declarations.
- **RouterAdapter**: A framework-neutral interface for route synchronization, implemented by each framework adapter.

## Requirements

### Requirement 1: Framework-Agnostic Core Module

**User Story:** As a library maintainer, I want all framework-agnostic logic in a standalone Core_Module, so that it can be reused by wrappers for any UI framework.

#### Acceptance Criteria

1. THE Core_Module SHALL export `connectToRemote()` for shell-side penpal connections.
2. THE Core_Module SHALL export `observeContentHeight()` using ResizeObserver to track document height changes.
3. THE Core_Module SHALL export `patchHistoryPushState()` to prevent duplicate history entries in iframes.
4. THE Core_Module SHALL export `isInsideIframe()` to detect iframe context.
5. THE Core_Module SHALL export `initRemote()` for remote-side initialization with optional RouterAdapter.
6. THE Core_Module SHALL export `createMessenger()` for standalone messaging state management.
7. THE Core_Module SHALL export type definitions for all public interfaces including `RouterAdapter`, `RemoteConnection`, `ConnectionStatus`, etc.
8. THE Core_Module SHALL have zero dependencies on Vue, React, or any UI framework.
9. THE Core_Module SHALL use `penpal` as its only external dependency (no `@open-iframe-resizer/core`).

### Requirement 2: Vue-Specific Wrapper Module

**User Story:** As a Vue developer, I want Vue-specific APIs that wrap the Core_Module, so I can use familiar patterns (components, composables, plugins).

#### Acceptance Criteria

1. THE Vue_Module SHALL export a `RemoteApp` component with props: `src`, `title`, `basePath`, `timeout`, `allowedOrigins`, and `fullHeight`.
2. THE `fullHeight` prop SHALL make the iframe take at least 100% of its container height, expanding for tall content and shrinking back on navigation.
3. THE Vue_Module SHALL export a `useRemote` composable with reactive connection status and messaging functions.
4. THE Vue_Module SHALL export `sprRemote` (Vue 3 plugin) and `sprRemoteLegacy` (Vue 2/Nuxt 2 initializer).
5. THE Vue_Module SHALL be importable from `@sprlab/microfront/vue/shell` and `@sprlab/microfront/vue/remote`.
6. THE old paths `@sprlab/microfront/shell` and `@sprlab/microfront/remote` SHALL remain as backward-compatible aliases.

### Requirement 3: React Adapter Module

**User Story:** As a React developer, I want a React-specific adapter so I can use the library without Vue dependencies.

#### Acceptance Criteria

1. THE React_Module SHALL export `initReactRemote()` that accepts `appName`, `router` (React Router instance), and `allowedOrigins`.
2. THE React_Module SHALL export `createReactRouterAdapter()` that creates a `RouterAdapter` from a React Router `createBrowserRouter` instance.
3. THE React_Module SHALL be importable from `@sprlab/microfront/react/remote`.
4. THE React_Module SHALL return a `RemoteConnection` (or null if not in iframe) with `send()` and `onMessage()`.
5. THE React_Module SHALL work with React Router v6+ and v7.

### Requirement 4: Angular Adapter Module

**User Story:** As an Angular developer, I want an Angular-specific adapter so I can use the library with Angular Router.

#### Acceptance Criteria

1. THE Angular_Module SHALL export `initAngularRemote()` that accepts `appName`, `router` (Angular Router instance), and `allowedOrigins`.
2. THE Angular_Module SHALL export `createAngularRouterAdapter()` that creates a `RouterAdapter` from an Angular Router instance.
3. THE Angular_Module SHALL be importable from `@sprlab/microfront/angular/remote`.
4. THE Angular_Module SHALL return a `RemoteConnection` (or null if not in iframe) with `send()` and `onMessage()`.
5. THE Angular_Module SHALL detect `NavigationEnd` events for route synchronization.

### Requirement 5: Package Exports Configuration

**User Story:** As a consumer, I want to import only the code relevant to my framework via subpath imports.

#### Acceptance Criteria

1. THE Package_Exports SHALL include: `./core`, `./vue`, `./vue/shell`, `./vue/remote`, `./shell` (alias), `./remote` (alias), `./react/remote`, `./angular/remote`.
2. Each export SHALL have `types` and `default` fields.
3. `vue` and `vue-router` SHALL be optional peer dependencies.
4. THE Build_System SHALL produce separate ES module bundles for core, vue, shell, remote, react-remote, and angular-remote.

### Requirement 5: Project Structure

**User Story:** As a developer, I want a clean project structure with the library in `lib/` and examples organized by framework.

#### Acceptance Criteria

1. THE library source SHALL reside in `lib/src/` with `lib/package.json` for npm publishing.
2. Vue 3 examples SHALL reside in `examples/vue/` (shell, remote-vue-connection, remote-vue-route, remote-vue-fullHeight).
3. Nuxt 2 examples SHALL reside in `examples/vue/` (remote-vue2-connection, remote-vue2-route, remote-vue2-fullHeight).
4. React examples SHALL reside in `examples/react/` (remote-react-connection, remote-react-route, remote-react-fullHeight).
5. Angular examples SHALL reside in `examples/angular/` (remote-angular-connection, remote-angular-route, remote-angular-fullHeight).
6. Vue 3 and React examples SHALL use `link:../../../lib` for local development.
7. Nuxt 2 examples SHALL use `file:../../../lib` for local development (copies only `dist/` via `"files"` field).
8. Angular examples SHALL use `link:../../../lib` for local development.
9. THE root `package.json` SHALL provide `yarn use:local` and `yarn use:npm` scripts to switch between local and npm dependencies.
10. THE root `package.json` SHALL provide `yarn kill-ports` and `yarn dev` / `yarn dev:vue2` / `yarn dev:react` / `yarn dev:angular` / `yarn dev:all` scripts.

### Requirement 6: FullHeight Iframe Behavior

**User Story:** As a shell developer, I want an iframe that fills its container by default and expands for tall content.

#### Acceptance Criteria

1. WHEN `fullHeight` is true, THE iframe SHALL have `min-height: 100%` to fill its container.
2. WHEN the remote content is taller than the container, THE iframe SHALL expand to fit the content.
3. WHEN navigating from tall to small content, THE iframe SHALL shrink back to container height.
4. THE height measurement SHALL use penpal communication (`onShellContainerHeight`) with double `requestAnimationFrame` for accurate layout measurement.
5. WHEN `fullHeight` is active, automatic `onRemoteHeight` reports SHALL be ignored (height managed via `requestRemoteHeight()`).

### Requirement 7: Router Adapter Abstraction

**User Story:** As a library maintainer, I want a framework-neutral router interface so route sync works with any framework.

#### Acceptance Criteria

1. THE `RouterAdapter` interface SHALL define `getCurrentPath()`, `replace(path)`, and `afterEach(callback)`.
2. THE Vue_Module SHALL provide `createVueRouterAdapter()` compatible with Vue Router v3, v4, and v5.
3. THE React_Module SHALL provide `createReactRouterAdapter()` compatible with React Router v6+ and v7.
4. THE Angular_Module SHALL provide `createAngularRouterAdapter()` compatible with Angular Router v15+.
5. WHEN no router is provided, route synchronization SHALL be skipped without errors.

### Requirement 8: Nuxt 2 Compatibility

**User Story:** As a Nuxt 2 developer, I want to use the library with webpack 4 and Vue 2.

#### Acceptance Criteria

1. Nuxt 2 remotes SHALL use `sprRemoteLegacy` from `@sprlab/microfront/dist/remote.js`.
2. Nuxt 2 `nuxt.config.js` SHALL transpile `@sprlab/microfront` and `penpal`.
3. Nuxt 2 `nuxt.config.js` SHALL include a webpack alias for `penpal` pointing to `node_modules/penpal/dist/penpal.mjs` (webpack 4 doesn't support `exports` field).
4. Nuxt 2 examples SHALL use `mode: 'spa'` to avoid SSR issues with client-only plugins.
