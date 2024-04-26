import { onLaunch, onLoad, onShow, onReady, onHide, onUnload } from '@dcloudio/uni-app'
import { onMounted, onUnmounted } from 'vue'

export const _onLaunch = function (
  callback: (options?: App.LaunchShowOption) => void,
  customCallback?: Function,
  resetCallback?: () => void
) {
  const _onLoadHook = onLaunch
  resetCallback && onHide(resetCallback)
  _onLoadHook((options) => {
    callback(options)
    customCallback?.(options)
  })
}

export const _onLoad = function (
  callback: (options?: AnyObject) => void,
  customCallback?: Function,
  resetCallback?: () => void
) {
  const _onLoadHook = onLoad
  resetCallback && onUnload(resetCallback)
  _onLoadHook((options) => {
    callback(options)
    customCallback?.(options)
  })
}

export const _onShow = function (
  callback: () => void,
  customCallback?: () => any,
  resetCallback?: () => void
) {
  const _onShowHook = onShow
  resetCallback && onHide(resetCallback)
  resetCallback && onUnload(resetCallback)
  _onShowHook(() => {
    callback()
    customCallback?.()
  })
}

export const _onCreated = function (
  callback: () => void,
  customCallback?: () => any,
  resetCallback?: () => void
) {
  callback()
  customCallback?.()
  resetCallback && onUnmounted(resetCallback)
  resetCallback && onUnload(resetCallback)
}

export const _onMounted = function (
  callback: () => void,
  customCallback?: () => any,
  resetCallback?: () => void
) {
  const _onMountedHook = onMounted
  resetCallback && onUnmounted(resetCallback)
  _onMountedHook(() => {
    callback()
    customCallback?.()
  })
}

export const _onReady = function (
  callback: () => void,
  customCallback?: () => void,
  resetCallback?: () => void
) {
  const _onReadyHook = onReady
  resetCallback && onUnload(resetCallback)
  _onReadyHook(() => {
    callback()
    customCallback?.()
  })
}

