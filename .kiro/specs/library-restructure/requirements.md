# Requirements Document

## Introduction

The `@sprlab/microfront` library currently bundles all its logic — penpal connection management, iframe resizing, messaging, history patching, and route synchronization — tightly coupled to Vue (Vue components, provide/inject, Vue plugins). This restructure separates the library into a framework-agnostic core package (`@sprlab/microfront/core`) and framework-specific wrappers (starting with `@sprlab/microfront/vue`), enabling future support for React, Angular, and other frameworks. The project structure is also reorganized so that example applications live under `examples/vue/` instead of at the root level.

## Glossary

- **Core_Module**: The framework-agnostic JavaScript module exported as `@sprlab/microfront/core`, containing pure logic for penpal connection, ResizeObserver-based iframe resizing, bidirectional messaging, iframe detection, and history patching.
- **Vue_Module**: The Vue-specific wrapper module exported as `@sprlab/microfront/vue`, containing RemoteApp component, useRemote composable, sprRemote plugin, and sprRemoteLegacy initializer.
- **Shell**: The host application that embeds remote micro frontends via iframes.
- **Remote**: A child application embedded inside an iframe within the Shell.
- **Penpal_Connection**: A bidirectional RPC channel between Shell and Remote established via the penpal library over postMessage.
- **Build_System**: The Vite-based build pipeline that produces distributable ES module bundles and TypeScript declarations for the library.
- **Example_Apps**: The set of demonstration applications (shell, remote1, remote2, remote3) used to validate library functionality.
- **Package_Exports**: The `exports` field in package.json that maps subpath imports (e.g., `@sprlab/microfront/core`) to their corresponding bundle files and type declarations.

## Requirements

### Requirement 1: Extract Framework-Agnostic Core Module

**User Story:** As a library maintainer, I want all framework-agnostic logic extracted into a standalone Core_Module, so that it can be reused by wrappers for any UI framework.

#### Acceptance Criteria

1. THE Core_Module SHALL export a function that establishes a Penpal_Connection given an iframe element reference, allowed origins, a timeout value, and a set of method handlers.
2. THE Core_Module SHALL export a function that observes content height changes on `document.documentElement` using ResizeObserver and invokes a provided callback with the current `scrollHeight`.
3. THE Core_Module SHALL export a function that patches `window.history.pushState` to call `replaceState` instead, preventing duplicate history entries inside iframes.
4. THE Core_Module SHALL export a function that returns whether the current window is inside an iframe by comparing `window.self` to `window.parent`.
5. THE Core_Module SHALL export a function that initializes the remote side of a Penpal_Connection given allowed origins, a set of method handlers, and an optional router adapter, returning a connection promise.
6. THE Core_Module SHALL export a messaging API consisting of a `send` function and an `onMessage` registration function that operate independently of any UI framework.
7. THE Core_Module SHALL export type definitions for all public interfaces, including connection options, message envelopes, message handlers, remote state, and connection status enums.
8. THE Core_Module SHALL have zero dependencies on Vue, React, Angular, or any other UI framework.

### Requirement 2: Create Vue-Specific Wrapper Module

**User Story:** As a Vue developer, I want a Vue_Module that wraps the Core_Module with Vue-specific APIs, so that I can use the library with familiar Vue patterns (components, composables, plugins).

#### Acceptance Criteria

1. THE Vue_Module SHALL export a `RemoteApp` Vue component that accepts `src`, `title`, `basePath`, `timeout`, `allowedOrigins`, and `fullHeight` props and renders an iframe managed by the Core_Module.
2. THE Vue_Module SHALL export a `useRemote` composable that creates or reuses a messenger instance via Vue's `provide`/`inject` and returns reactive connection status, `sendMessage`, `onMessage`, and `onRouteChange` functions.
3. THE Vue_Module SHALL export a `sprRemote` Vue 3 plugin that accepts `appName`, `router`, and `allowedOrigins` options and delegates initialization to the Core_Module.
4. THE Vue_Module SHALL export a `sprRemoteLegacy` initializer that accepts the same options as `sprRemote` and supports Vue 2 and Nuxt 2 applications.
5. THE Vue_Module SHALL list `vue` as a peer dependency and `vue-router` as an optional peer dependency.
6. THE Vue_Module SHALL delegate all connection management, resizing, messaging, and history patching logic to the Core_Module rather than implementing them directly.

### Requirement 3: Configure Package Exports for Subpath Access

**User Story:** As a consumer of the library, I want to import from `@sprlab/microfront/core` and `@sprlab/microfront/vue`, so that I only pull in the code relevant to my framework.

#### Acceptance Criteria

1. WHEN a consumer imports from `@sprlab/microfront/core`, THE Build_System SHALL resolve to the Core_Module ES bundle and its corresponding TypeScript declaration file.
2. WHEN a consumer imports from `@sprlab/microfront/vue`, THE Build_System SHALL resolve to the Vue_Module ES bundle and its corresponding TypeScript declaration file.
3. THE Package_Exports SHALL maintain backward-compatible subpath entries for `@sprlab/microfront/shell` and `@sprlab/microfront/remote` that re-export from the Vue_Module.
4. THE Build_System SHALL produce separate ES module bundles for the Core_Module and the Vue_Module, with the Vue_Module bundle excluding Core_Module code via external reference.
5. THE Build_System SHALL generate TypeScript declaration files for both the Core_Module and the Vue_Module.

### Requirement 4: Reorganize Example Applications

**User Story:** As a developer working on the project, I want example applications organized under `examples/vue/`, so that the project root is clean and ready for future framework examples.

#### Acceptance Criteria

1. WHEN the restructure is complete, THE Example_Apps (shell, remote1, remote2, remote3) SHALL reside under the `examples/vue/` directory within the repository.
2. WHEN a developer runs `yarn dev` from the root, THE Build_System SHALL start all Example_Apps concurrently, using the same ports as before (shell:4000, remote1:4001, remote2:4002, remote3:3000).
3. WHEN the Example_Apps are moved, THE Example_Apps SHALL reference the library via a relative `file:` dependency path that resolves correctly from `examples/vue/<app>/` to `libs/spr-microfront/`.
4. WHEN the Example_Apps are moved, THE Example_Apps SHALL update their imports from `@sprlab/microfront/shell` and `@sprlab/microfront/remote` to continue working without code changes beyond the dependency path.

### Requirement 5: Preserve Build and Publish Pipeline

**User Story:** As a library maintainer, I want the library to remain publishable to npm after restructuring, so that existing consumers are not disrupted.

#### Acceptance Criteria

1. THE Build_System SHALL produce a `dist/` directory containing ES module bundles for `core`, `vue` (and backward-compatible `shell`, `remote` aliases) when `yarn build` is run inside `libs/spr-microfront/`.
2. THE Build_System SHALL produce TypeScript declaration files in `dist/` for all exported modules.
3. THE package.json `files` field SHALL include only the `dist/` directory for npm publishing.
4. THE package.json `exports` field SHALL map all subpath entries (`./core`, `./vue`, `./shell`, `./remote`) to their respective bundle and type declaration files.
5. IF the `yarn build` command fails, THEN THE Build_System SHALL exit with a non-zero status code and output a descriptive error message.

### Requirement 6: Preserve Existing Test Suite

**User Story:** As a library maintainer, I want all existing unit tests and e2e tests to pass after restructuring, so that I have confidence no functionality was broken.

#### Acceptance Criteria

1. WHEN `yarn test` is run inside `libs/spr-microfront/`, THE Build_System SHALL execute all unit tests and report results.
2. THE unit tests for `useRemote` SHALL validate that the composable returns reactive status, message handlers, and route change handlers using the Vue_Module wrapping the Core_Module.
3. THE unit tests for `sprRemote` SHALL validate that the plugin initializes correctly when not inside an iframe, that `send` warns before connection, and that `onMessage` accepts handlers.
4. WHEN all Example_Apps are running, THE e2e tests SHALL validate iframe loading, resizing, messaging, route synchronization, history patching, and back/forward navigation for all remotes.

### Requirement 7: Preserve Git and NPM Configuration Integrity

**User Story:** As a developer, I want all git repositories and npm configurations preserved during restructuring, so that version history and dependency management remain intact.

#### Acceptance Criteria

1. WHEN files are moved during restructuring, THE restructure process SHALL preserve the `.git` directory in the repository root and the `.git` file (submodule reference) in `libs/spr-microfront/`.
2. WHEN files are moved during restructuring, THE restructure process SHALL preserve all `.gitignore`, `.gitmodules`, `.yarnrc.yml`, and `yarn.lock` files in their correct locations.
3. WHEN files are moved during restructuring, THE restructure process SHALL preserve all `.npmrc` and package.json files with correct relative paths updated as needed.
4. IF a file move would overwrite an existing `.git` directory or file, THEN THE restructure process SHALL abort that operation and report the conflict.

### Requirement 8: Router Adapter Abstraction in Core

**User Story:** As a library maintainer, I want the Core_Module to accept a framework-neutral router adapter interface, so that route synchronization works with any framework's router.

#### Acceptance Criteria

1. THE Core_Module SHALL define a `RouterAdapter` interface with methods for reading the current path, replacing the current route, and registering an after-navigation callback.
2. WHEN a `RouterAdapter` is provided to the remote initialization function, THE Core_Module SHALL use the adapter to synchronize routes between Shell and Remote.
3. WHEN no `RouterAdapter` is provided, THE Core_Module SHALL skip all route synchronization logic without errors.
4. THE Vue_Module SHALL provide a factory function that creates a `RouterAdapter` from a Vue Router instance (compatible with Vue Router v3, v4, and v5).
