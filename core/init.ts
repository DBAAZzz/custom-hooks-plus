import { PromiseMap, PromiseStatus, WatchConfig, WatchConfigCollection } from '../types'
import { generatePiniaKey } from '../utils'

class CustomHooks {
  private watchConfigs: WatchConfigCollection = {}
  private promiseCache: { [key: string]: Promise<any> } = {}
  private promiseMap: PromiseMap = {}

  private createPendingPromise(watch: WatchConfig) {
    return new Promise((resolve, reject) => {
      this.promiseMap[watch.key] = {
        status: PromiseStatus.PENDING,
        resolve,
        onUpdate: watch.onUpdate,
      }
    })
  }

  updateWatchedValue(key: string, value: any, parentTaget?: object) {
    let truthKey = parentTaget ? `${parentTaget}.${key}` : key
    let execPromise = [truthKey]

    if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach((k) => {
        execPromise.push(`${truthKey}.${k}`)
      })
    }

    execPromise.forEach((i) => {
      if (!this.promiseMap[i]) return
      if (this.promiseMap[i].onUpdate) {
        let result = this.promiseMap[i].onUpdate?.(value)
        if (result && this.promiseMap[i].status == PromiseStatus.PENDING) {
          // 满足条件使指定key的promise为fulfilled
          this.promiseMap[i].status = PromiseStatus.FULFILLED
          this.promiseMap[i].resolve(value)
        } else if (!result && this.promiseMap[i].status == PromiseStatus.FULFILLED) {
          // 不满足条件重置promise的状态为pedding
          this.promiseCache[i] = this.createPendingPromise({
            key: i,
            onUpdate: this.promiseMap[i].onUpdate
          })
        }
      } else if (value && this.promiseMap[i].status == PromiseStatus.PENDING) {
        // 满足条件使指定key的promise为fulfilled
        this.promiseMap[i].status = PromiseStatus.FULFILLED
        this.promiseMap[i].resolve(value)
      } else if (!value && this.promiseMap[i].status == PromiseStatus.FULFILLED) {
        // 不满足条件重置promise的状态为pedding
        this.promiseCache[i] = this.createPendingPromise({
          key: i,
          onUpdate: this.promiseMap[i].onUpdate
        })
      }
    })
  }

  createProxy<T extends AnyObject>(target: T): T {
    let proxy = new Proxy(target, {
      get: (obj, prop: string, receiver) => {
        const value = Reflect.get(target, prop, receiver)
        // 深度检测
        if (typeof value === 'object' && value !== null) {
          return this.createProxy({
            _parentTarget: prop,
            ...value
          })
        }
        this.updateWatchedValue(prop, value, obj._parentTarget ? obj._parentTarget : null)
        return value
      },
      set: (obj, prop: string, value) => {
        // @ts-ignore
        obj[prop] = value
        this.updateWatchedValue(prop, value, obj._parentTarget ? obj._parentTarget : null)
        return true
      }
    })
    return proxy
  }

  init(watchObject: WatchConfigCollection): void {
    this.watchConfigs = Object.assign({}, watchObject)
    const watchItems = Object.values(this.watchConfigs)
    watchItems.forEach(w => {
      if (w.type === 'pinia') {
        const key = generatePiniaKey(w.key, w.store)
        w.key = key
        // @ts-ignore
        w.store.$subscribe((store) => {
          const { newValue } = store.events
          this.updateWatchedValue(key, newValue)
        })
      }
      const { key, onUpdate } = w;
      if (key) {
        this.promiseCache[key] = this.createPendingPromise({ key, onUpdate })
      } else {
        console.error('init 方法无效的监听配置：缺少 key 属性')
      }
    });
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
