# @sprlab/microfront — Monorepo

Micro frontend library using iframes with automatic resizing, bidirectional messaging, and route synchronization.

Supports Vue 3, Vue 2 / Nuxt 2, React, and Angular remotes from a single Vue 3 shell.

For the library documentation, see [lib/README.md](lib/README.md).

## Project Structure

```
├── lib/                          — Library source (@sprlab/microfront)
│   ├── src/core/                 — Framework-agnostic core
│   ├── src/vue/                  — Vue 3 wrappers
│   ├── src/react/                — React adapter
│   ├── src/angular/              — Angular adapter
│   └── dist/                     — Built output (published to npm)
├── examples/
│   ├── vue/
│   │   ├── shell/                — Vue 3 host app (port 4000)
│   │   ├── remote-vue-connection/      (4001)
│   │   ├── remote-vue-route/           (4002)
│   │   ├── remote-vue-fullHeight/      (4004)
│   │   ├── remote-vue2-connection/     (4005)
│   │   ├── remote-vue2-route/          (4006)
│   │   └── remote-vue2-fullHeight/     (4007)
│   ├── react/
│   │   ├── remote-react-connection/    (4010)
│   │   ├── remote-react-route/         (4011)
│   │   └── remote-react-fullHeight/    (4012)
│   └── angular/
│       ├── remote-angular-connection/  (4020)
│       ├── remote-angular-route/       (4021)
│       └── remote-angular-fullHeight/  (4022)
├── mpa-generic/
│   ├── shared/server.js                — shared HTTP server
│   ├── remote-mpag-connection/         (4030)
│   ├── remote-mpag-route/              (4031)
│   └── remote-mpag-fullHeight/         (4032)
└── scripts/                      — Dev tooling
```

## Quick Start

```bash
# Install everything
yarn install:all

# Run Vue 3 examples
yarn dev

# Run Nuxt 2 examples
yarn dev:vue2

# Run React examples
yarn dev:react

# Run Angular examples
yarn dev:angular

# Run MPA Generic examples
yarn dev:mpag

# Run all examples
yarn dev:all
```

## Development

```bash
# Build the library
yarn build

# Run unit tests
yarn test

# Switch examples to local lib (for development)
yarn use:local
yarn install:all

# Switch examples to npm (for testing published version)
yarn use:npm
yarn install:all

# Kill all dev server ports
yarn kill-ports
```

## Publishing

```bash
cd lib
# Update version in package.json
yarn build
npm publish --access public
```

## npm

[npmjs.com/package/@sprlab/microfront](https://www.npmjs.com/package/@sprlab/microfront)
