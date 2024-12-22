import { PromiseMapValue, PromiseStatus, WatchConfig, WatchConfigCollection } from '../types'
import { findCommonSubset, flattenObject, generatePiniaKey, getValueByPath, restoreKey, watchs, } from '../utils'

class CustomHooks {
  private watchConfigs: WatchConfigCollection = {}
  private promiseCache = new Map<string, Promise<any>>()
  private promiseMap = new Map<string, PromiseMapValue>()
  private proxyTarget: Record<string, any> = {}

  private createPendingPromise(watch: WatchConfig) {
    return new Promise((resolve, reject) => {
      this.promiseMap.set(watch.key, {
        status: PromiseStatus.PENDING,
        resolve,
        type: watch.type,
        onUpdate: watch.onUpdate
      })
    })
  }

  private track(key: string, value: any) {

    let valueType = 'base'
    const initKeys = Array.from(this.promiseMap.keys())
    const flattenKeys = [key]

    if (typeof value === 'object' && value !== null) {
      valueType = 'object'
      // 对传入的对象做扁平化处理
      flattenKeys.push(...flattenObject(value, key))
    }

    const watchedKeys = findCommonSubset(initKeys, flattenKeys)

    watchedKeys.forEach((watchKey) => {
      if (!this.promiseMap.get(watchKey)) return

      const promiseItem = this.promiseMap.get(watchKey)!

      let assignValue = value
      if (valueType == 'object') {
        const pathKey = restoreKey({ ...promiseItem, key: watchKey })
        assignValue = getValueByPath(value, pathKey, value)
      }

      // 处理带有自定义更新条件的情况
      if (promiseItem.onUpdate) {
        const shouldFulfill = promiseItem.onUpdate?.(assignValue)
        if (shouldFulfill && promiseItem.status == PromiseStatus.PENDING) {
          promiseItem.status = PromiseStatus.FULFILLED
          promiseItem.resolve(assignValue)
        } else if (!shouldFulfill && promiseItem.status == PromiseStatus.FULFILLED) {
          this.promiseCache.set(watchKey, this.createPendingPromise({
            key: watchKey,
            onUpdate: promiseItem.onUpdate
          }))
        }
        return
      }

      //  处理简单值判断的情况
      if (assignValue && promiseItem.status == PromiseStatus.PENDING) {
        promiseItem.status = PromiseStatus.FULFILLED
        promiseItem.resolve(assignValue)
      } else if (!assignValue && promiseItem.status == PromiseStatus.FULFILLED) {
        this.promiseCache.set(watchKey, this.createPendingPromise({
          key: watchKey,
          onUpdate: promiseItem.onUpdate
        }))
      }
    })
  }

  createProxy<T extends AnyObject>(target: T): T {
    this.proxyTarget = target

    const proxy = new Proxy(target, {
      get: (obj, prop: string, receiver) => {
        const value = Reflect.get(obj, prop, receiver)
        return value
      },
      set: (obj, prop: string, newValue) => {
        const oldValue = target[prop]
        if (oldValue === newValue) return true
        
        const result = Reflect.set(obj, prop, newValue)
        this.track(prop, newValue)
        return result
      }
    })
    return proxy
  }

  init(watchObject: WatchConfigCollection): void {
    this.watchConfigs = Object.assign({}, watchObject)
    const watchItems = Object.values(this.watchConfigs)
    watchItems.forEach((w) => {
      const originalKey = w.key
      const defaultVal = getValueByPath(w.type == 'pinia' ? w.store.$state : this.proxyTarget, originalKey)

      if (w.type === 'pinia') {
        const key = generatePiniaKey(w.key, w.store)
        w.key = key
        watchs(w.store, originalKey, (newValue: any) => {
          this.track(key, newValue)
        })
      }

      if (w.key) {
        this.promiseCache.set(w.key, this.createPendingPromise(w))
        // init 时执行一次 track
        this.track(w.key, defaultVal)
      } else {
        console.error('init 方法无效的监听配置：缺少 key 属性')
      }
    })
  }

  getPromiseCache() {
    return this.promiseCache
  }

  getPromiseMap() {
    return this.promiseMap
  }

  getWatchConfigs() {
    return this.watchConfigs
  }
}

export const customHooks = new CustomHooks()

/**
 *
 * @param watchObject 监听的键
 * @param target 传入的store
 * @returns
 */
export function init(watchObject: WatchConfigCollection) {
  customHooks.init(watchObject)
}

export const createProxy = <T extends AnyObject>(target: T): T => customHooks.createProxy(target)

/**
 * @deprecated 即将被弃用，请使用`createProxy`方法
 * @see 点击查看createProxy方法 {@link createProxy}
 */
export const proxyData = <T extends AnyObject>(target: T): T => {
  return createProxy(target)
}

