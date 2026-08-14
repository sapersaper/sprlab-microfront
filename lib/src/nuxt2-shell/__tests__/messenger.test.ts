import { describe, it, expect } from 'vitest'
import { createRemoteMessenger } from '../messenger'
import { ConnectionStatus } from '../../core/types'

const settle = () => new Promise((r) => setTimeout(r, 0))

describe('createRemoteMessenger', () => {
  /**
   * The reason this messenger exists as a separate wrapper.
   *
   * Vue 2 makes a property reactive by replacing it with its own accessor pair. It can
   * only do that for a plain, configurable, writable data property. An accessor backed
   * by a closure has no setter for Vue to hook, so mutations happening inside the
   * closure are invisible and templates never re-render.
   *
   * Vue 2 itself isn't installed here (this package builds against Vue 3), so we assert
   * the shape Vue 2 requires rather than driving a Vue 2 instance.
   */
  it('exposes status as a plain writable property, not a getter', () => {
    const messenger = createRemoteMessenger()
    const descriptor = Object.getOwnPropertyDescriptor(messenger, 'status')

    expect(descriptor).toBeDefined()
    expect(descriptor!.get).toBeUndefined()
    expect(descriptor!.writable).toBe(true)
    expect(descriptor!.configurable).toBe(true)
  })

  it('exposes iframeLoaded as a plain writable property, not a getter', () => {
    const messenger = createRemoteMessenger()
    const descriptor = Object.getOwnPropertyDescriptor(messenger, 'iframeLoaded')

    expect(descriptor).toBeDefined()
    expect(descriptor!.get).toBeUndefined()
    expect(descriptor!.writable).toBe(true)
  })

  it('starts out loading and not loaded', () => {
    const messenger = createRemoteMessenger()

    expect(messenger.status).toBe(ConnectionStatus.Loading)
    expect(messenger.iframeLoaded).toBe(false)
  })

  it('mirrors the connected status onto the plain property', async () => {
    const messenger = createRemoteMessenger()

    messenger.setConnection(Promise.resolve({}))
    await settle()

    expect(messenger.status).toBe(ConnectionStatus.Connected)
  })

  it('reports error when the connection fails and the iframe never loaded', async () => {
    const messenger = createRemoteMessenger()

    messenger.setConnection(Promise.reject(new Error('unreachable')))
    await settle()

    expect(messenger.status).toBe(ConnectionStatus.Error)
  })

  it('reports no-plugin when the iframe loaded but the connection failed', async () => {
    const messenger = createRemoteMessenger()

    messenger.setIframeLoaded()
    expect(messenger.iframeLoaded).toBe(true)

    messenger.setConnection(Promise.reject(new Error('no answer')))
    await settle()

    expect(messenger.status).toBe(ConnectionStatus.NoPlugin)
  })

  it('notifies its own onStatusChange subscribers', async () => {
    const messenger = createRemoteMessenger()
    const seen: string[] = []

    messenger.onStatusChange((status) => seen.push(status))
    messenger.setConnection(Promise.resolve({}))
    await settle()

    expect(seen).toEqual([ConnectionStatus.Connected])
  })

  it('propagates a status assignment through a Vue-2-style reactive setter', async () => {
    // Simulates what Vue 2's defineReactive does to a property in data():
    // it swaps the plain property for an accessor pair. The messenger must write
    // through that setter, which is only possible because it assigns to itself.
    const messenger = createRemoteMessenger()
    const notified: string[] = []
    let internal = messenger.status

    Object.defineProperty(messenger, 'status', {
      configurable: true,
      enumerable: true,
      get: () => internal,
      set: (value: string) => {
        internal = value
        notified.push(value)
      },
    })

    messenger.setConnection(Promise.resolve({}))
    await settle()

    expect(notified).toEqual([ConnectionStatus.Connected])
    expect(messenger.status).toBe(ConnectionStatus.Connected)
  })
})
