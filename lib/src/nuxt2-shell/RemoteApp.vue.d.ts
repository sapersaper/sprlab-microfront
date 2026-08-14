/**
 * Type shim for the Vue 2 / Nuxt 2 shell RemoteApp component.
 *
 * This file must exist: RemoteApp.vue is a Vue 2 SFC and TypeScript resolves this
 * declaration instead of the SFC, which keeps `vue-tsc` (running with Vue 3 types)
 * from type-checking Vue 2 Options API code.
 *
 * The public, consumer-facing declaration lives in `nuxt2/shell.d.ts`.
 */
declare const RemoteApp: {
  name: string
  props: {
    src: { type: StringConstructor; required: true }
    title: { type: StringConstructor; required: true }
    basePath: { type: StringConstructor; default: string }
    timeout: { type: NumberConstructor; default: number }
    allowedOrigins: { type: ArrayConstructor; default: () => string[] }
    fullHeight: { type: BooleanConstructor; default: boolean }
  }
}
export default RemoteApp
