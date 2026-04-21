import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useRemote, RemoteStatus } from '../useRemote'

function createTestComponent(setup: () => unknown) {
  return defineComponent({
    setup,
    template: '<div />',
  })
}

describe('useRemote', () => {
  it('should return all expected properties', () => {
    const wrapper = mount(createTestComponent(() => {
      const result = useRemote()
      return { result }
    }))

    const result = (wrapper.vm as any).result
    expect(result).toHaveProperty('sendMessage')
    expect(result).toHaveProperty('onMessage')
    expect(result).toHaveProperty('onRouteChange')
    expect(result).toHaveProperty('isLoading')
    expect(result).toHaveProperty('isConnected')
    expect(result).toHaveProperty('isError')
    expect(result).toHaveProperty('isNoPlugin')
  })

  it('should start in loading state', () => {
    const wrapper = mount(createTestComponent(() => {
      const { isLoading, isConnected, isError, isNoPlugin } = useRemote()
      return { isLoading, isConnected, isError, isNoPlugin }
    }))

    const vm = wrapper.vm as any
    expect(vm.isLoading).toBe(true)
    expect(vm.isConnected).toBe(false)
    expect(vm.isError).toBe(false)
    expect(vm.isNoPlugin).toBe(false)
  })

  it('should register message handlers', () => {
    const handler = vi.fn()

    mount(createTestComponent(() => {
      const { onMessage } = useRemote()
      onMessage(handler)
    }))

    expect(handler).not.toHaveBeenCalled()
  })

  it('should register route change handlers', () => {
    const handler = vi.fn()

    mount(createTestComponent(() => {
      const { onRouteChange } = useRemote()
      onRouteChange(handler)
    }))

    expect(handler).not.toHaveBeenCalled()
  })

  it('should warn when sendMessage is called before connection', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(createTestComponent(() => {
      const { sendMessage } = useRemote()
      return { sendMessage }
    }))

    await (wrapper.vm as any).sendMessage({ test: true })
    expect(warnSpy).toHaveBeenCalledWith(
      '[@sprlab/microfront] sendMessage called before connection was established'
    )

    warnSpy.mockRestore()
  })

  it('should share messenger between parent and child via provide/inject', () => {
    const child = defineComponent({
      setup() {
        const { isLoading } = useRemote()
        return { isLoading }
      },
      template: '<div />',
    })

    const parent = defineComponent({
      components: { child },
      setup() {
        const { isLoading } = useRemote()
        return { isLoading }
      },
      template: '<child />',
    })

    const wrapper = mount(parent)
    const parentVm = wrapper.vm as any
    const childVm = wrapper.findComponent(child).vm as any

    // Both should share the same loading state
    expect(parentVm.isLoading).toBe(true)
    expect(childVm.isLoading).toBe(true)
  })
})
