import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isInsideIframe } from '../iframe'
import { patchHistoryPushState } from '../history'
import { observeContentHeight } from '../height'
import { createMessenger } from '../messenger'
import { ConnectionStatus } from '../types'

describe('isInsideIframe', () => {
  it('should return false when window.self === window.parent', () => {
    expect(isInsideIframe()).toBe(false)
  })
})

describe('patchHistoryPushState', () => {
  let originalPushState: typeof window.history.pushState

  beforeEach(() => {
    originalPushState = window.history.pushState
  })

  afterEach(() => {
    window.history.pushState = originalPushState
  })

  it('should replace pushState with a function that calls replaceState', () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})

    patchHistoryPushState()
    window.history.pushState({ foo: 1 }, '', '/test-url')

    expect(replaceStateSpy).toHaveBeenCalledWith({ foo: 1 }, '', '/test-url')
    replaceStateSpy.mockRestore()
  })
})

describe('observeContentHeight', () => {
  it('should call the callback with initial height immediately', () => {
    const callback = vi.fn()
    const cleanup = observeContentHeight(callback)

    // Should be called at least once with the initial height
    expect(callback).toHaveBeenCalled()
    expect(typeof callback.mock.calls[0][0]).toBe('number')

    cleanup()
  })

  it('should report the initial height even when the document measures 0', () => {
    // Regression guard: seeding lastHeight with 0 instead of a sentinel made the
    // initial report silently vanish for a 0-height document.
    const spy = vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(0)
    const callback = vi.fn()

    const cleanup = observeContentHeight(callback)

    expect(callback).toHaveBeenCalledWith(0)

    cleanup()
    spy.mockRestore()
  })

  it('should not report the same height twice in a row', () => {
    const spy = vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(500)
    const callback = vi.fn()

    const cleanup = observeContentHeight(callback)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(500)

    cleanup()
    spy.mockRestore()
  })

  it('should return a cleanup function', () => {
    const callback = vi.fn()
    const cleanup = observeContentHeight(callback)

    expect(typeof cleanup).toBe('function')
    // Should not throw when called
    expect(() => cleanup()).not.toThrow()
  })
})

describe('createMessenger', () => {
  it('should return an object with the expected API shape', () => {
    const messenger = createMessenger()

    expect(messenger).toHaveProperty('status')
    expect(messenger).toHaveProperty('iframeLoaded')
    expect(typeof messenger.setConnection).toBe('function')
    expect(typeof messenger.setIframeLoaded).toBe('function')
    expect(typeof messenger.send).toBe('function')
    expect(typeof messenger.handleRemoteMessage).toBe('function')
    expect(typeof messenger.handleRouteChange).toBe('function')
    expect(typeof messenger.onMessage).toBe('function')
    expect(typeof messenger.onRouteChange).toBe('function')
  })

  it('should start with loading status', () => {
    const messenger = createMessenger()
    expect(messenger.status).toBe(ConnectionStatus.Loading)
  })

  it('should start with iframeLoaded = false', () => {
    const messenger = createMessenger()
    expect(messenger.iframeLoaded).toBe(false)
  })

  it('should set iframeLoaded to true via setIframeLoaded', () => {
    const messenger = createMessenger()
    messenger.setIframeLoaded()
    expect(messenger.iframeLoaded).toBe(true)
  })

  it('should update status to connected when connection resolves', async () => {
    const messenger = createMessenger()
    messenger.setConnection(Promise.resolve({}))
    // Wait for microtask
    await new Promise((r) => setTimeout(r, 0))
    expect(messenger.status).toBe(ConnectionStatus.Connected)
  })

  it('should update status to error when connection rejects and iframe not loaded', async () => {
    const messenger = createMessenger()
    messenger.setConnection(Promise.reject(new Error('fail')))
    await new Promise((r) => setTimeout(r, 0))
    expect(messenger.status).toBe(ConnectionStatus.Error)
  })

  it('should update status to no-plugin when connection rejects and iframe is loaded', async () => {
    const messenger = createMessenger()
    messenger.setIframeLoaded()
    messenger.setConnection(Promise.reject(new Error('fail')))
    await new Promise((r) => setTimeout(r, 0))
    expect(messenger.status).toBe(ConnectionStatus.NoPlugin)
  })

  it('should warn when send is called before connection', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const messenger = createMessenger()

    await messenger.send({ test: true })

    expect(warnSpy).toHaveBeenCalledWith(
      '[@sprlab/microfront] sendMessage called before connection was established'
    )
    warnSpy.mockRestore()
  })

  it('should broadcast messages to all registered handlers', () => {
    const messenger = createMessenger()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    messenger.onMessage(handler1)
    messenger.onMessage(handler2)

    const envelope = { payload: { data: 'test' }, metadata: { appName: 'app1' } }
    messenger.handleRemoteMessage(envelope)

    expect(handler1).toHaveBeenCalledWith(envelope.payload, envelope.metadata)
    expect(handler2).toHaveBeenCalledWith(envelope.payload, envelope.metadata)
  })

  it('should notify onStatusChange subscribers when the connection resolves', async () => {
    const messenger = createMessenger()
    const handler = vi.fn()

    messenger.onStatusChange(handler)
    messenger.setConnection(Promise.resolve({}))
    await new Promise((r) => setTimeout(r, 0))

    expect(handler).toHaveBeenCalledWith(ConnectionStatus.Connected)
  })

  it('should notify onStatusChange subscribers with no-plugin when the iframe loaded', async () => {
    const messenger = createMessenger()
    const handler = vi.fn()

    messenger.onStatusChange(handler)
    messenger.setIframeLoaded()
    messenger.setConnection(Promise.reject(new Error('fail')))
    await new Promise((r) => setTimeout(r, 0))

    expect(handler).toHaveBeenCalledWith(ConnectionStatus.NoPlugin)
  })

  it('should notify every onStatusChange subscriber', async () => {
    const messenger = createMessenger()
    const first = vi.fn()
    const second = vi.fn()

    messenger.onStatusChange(first)
    messenger.onStatusChange(second)
    messenger.setConnection(Promise.resolve({}))
    await new Promise((r) => setTimeout(r, 0))

    expect(first).toHaveBeenCalledWith(ConnectionStatus.Connected)
    expect(second).toHaveBeenCalledWith(ConnectionStatus.Connected)
  })

  it('should not notify when the status is set to its current value', () => {
    const messenger = createMessenger()
    const handler = vi.fn()

    messenger.onStatusChange(handler)
    messenger.status = ConnectionStatus.Loading

    expect(handler).not.toHaveBeenCalled()
  })

  it('should broadcast route changes to all registered handlers', () => {
    const messenger = createMessenger()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    messenger.onRouteChange(handler1)
    messenger.onRouteChange(handler2)

    messenger.handleRouteChange('/new-path')

    expect(handler1).toHaveBeenCalledWith('/new-path')
    expect(handler2).toHaveBeenCalledWith('/new-path')
  })
})
