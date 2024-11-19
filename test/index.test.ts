import { beforeEach, describe, expect, it, test } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
// @ts-ignore
import Index from '../example/index.vue'

describe('use customHooks', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('pinia的token发生变化，执行mounted', async () => {
    const wrapper = mount(Index)
    await wrapper.vm.$nextTick()

    setTimeout(() => {
      expect(wrapper.vm.customMountedLogin).toBe(true)
    }, 0);
  })

  it('pinia的name发生变化，执行mounted', async () => {
    const wrapper = mount(Index)
    await wrapper.vm.$nextTick()

    setTimeout(() => {
      const { customMountedLoginName } = wrapper.vm
      expect(customMountedLoginName).toBe(false)
    }, 0);
  })

  it('pinia的name和token都发生变化，执行mounted', async () => {
    const wrapper = mount(Index)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.customMountedLoginName).toBe(false)

    await wrapper.find('#button').trigger('click')
    setTimeout(() => {
      expect(wrapper.vm.customMountedLoginName).toBe(true)
    }, 0);
  })

  it('global的token发生变化，执行mounted', async () => {
    const wrapper = mount(Index)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.customMountedGlobalLogin).toBe(false)
    await wrapper.find('#button2').trigger('click')
    setTimeout(() => {
      expect(wrapper.vm.customMountedGlobalLogin).toBe(true)
    }, 0);
  })

  it('global的user对象发生变化，执行mounted', async () => {
    const wrapper = mount(Index)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.customMountedGlobalUserInfo).toBe(false)
    await wrapper.find('#button3').trigger('click')
    setTimeout(() => {
      expect(wrapper.vm.customMountedGlobalUserInfo).toBe(true)
    }, 0);
  })

  it('global的user对象的key值发生变化，执行mounted', async () => {
    const wrapper = mount(Index)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.customMountedGlobalUserInfo).toBe(false)
    await wrapper.find('#button3').trigger('click')

    setTimeout(async () => {
      expect(wrapper.vm.customMountedGlobalUserInfoA).toBe(false)
      await wrapper.find('#button4').trigger('click')
      setTimeout(() => {
        expect(wrapper.vm.customMountedGlobalUserInfoA).toBe(true)
      }, 0);
    }, 0);
  })
})

