import { PromiseEntry, PromiseMap, PromiseStatus, Watch, WatchConfigMap } from '../types'

class CustomHooks {
  private watchConfigs: WatchConfigMap = {}
  private promiseCache: { [key: string]: Promise<any> } = {}
  private promiseMap: PromiseMap = {}

  private createPendingPromise(watch: Watch) {
    return new Promise((resolve, reject) => {
      this.promiseMap[watch.key] = {
        status: PromiseStatus.PEDDING,
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
        if (result && this.promiseMap[i].status == PromiseStatus.PEDDING) {
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
      } else if (value && this.promiseMap[i].status == PromiseStatus.PEDDING) {
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

  init(watchObject: WatchConfigMap, target?: object): void {
    this.watchConfigs = Object.assign({}, watchObject)
    let watchItem = Object.keys(watchObject).map((i) => {
      return watchObject[i]
    })

    for (let w of watchItem) {
      w.key = w.type == 'pinia' ? `pinia-${w.key}` : w.key
      this.promiseCache[w.key] = this.createPendingPromise(w)
    }

    if (target) {
      // todo 可以传入多个 store，通过 storeId 判断属于哪个 store
      // @ts-ignore
      target.$subscribe((store) => {
        let key = store.events.key,
          value = store.events.newValue
        this.updateWatchedValue(`pinia-${key}`, value)
      })
    }
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
export function init(watchObject: WatchConfigMap, target?: object) {
  customHooks.init(watchObject, target)
}

export const createProxy = <T extends AnyObject>(target: T): T => customHooks.createProxy(target)

/**
 * @deprecated 即将被弃用，请使用`createProxy`方法
 * @see 点击查看createProxy方法 {@link createProxy}
 */
export const proxyData = <T extends AnyObject>(target: T): T => {
  return createProxy(target)
}