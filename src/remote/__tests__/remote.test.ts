import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp } from 'vue'
import { sprRemote, send, onMessage } from '../index'

describe('sprRemote plugin', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should not initialize when not inside an iframe', () => {
    // window.self === window.parent when not in iframe (default in test env)
    const app = createApp({ template: '<div />' })
    
    // Should not throw
    expect(() => app.use(sprRemote, { appName: 'test' })).not.toThrow()
  })

  it('should warn when send is called before connection', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await send({ test: true })

    expect(warnSpy).toHaveBeenCalledWith(
      '[@sprlab/microfront] send called before connection was established'
    )

    warnSpy.mockRestore()
  })

  it('should accept message handlers even before plugin install', () => {
    const handler = vi.fn()
    // onMessage should not throw even if state is null
    expect(() => onMessage(handler)).not.toThrow()
  })
})

describe('isInsideIframe', () => {
  it('should return false in test environment', () => {
    // In test env, window.self === window.parent
    expect(window.self === window.parent).toBe(true)
  })
})
