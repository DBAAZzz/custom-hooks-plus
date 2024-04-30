import { PromiseStatus, Watch } from './types/index'

type WatchType = {
  [key: string]: Watch
}

type PromiseMap = {
  [key: string]: {
    status: PromiseStatus
    resolve: Function,
    type?: 'pinia' | 'default'
    onUpdate?: (val: any) => boolean
  }
}

export let watchObj: WatchType = {}
export let keyPromise: {
  [key: string]: Promise<any>
} = {}
export let promiseMap: PromiseMap = {}

function pendingPromise(watch: Watch) {
  return new Promise((resolve, reject) => {
    promiseMap[watch.key] = {
      status: PromiseStatus.PEDDING,
      resolve,
      onUpdate: watch.onUpdate,
    }
  })
}

function watch(key: string, value: any, parentTaget?: object) {
  let truthKey = parentTaget ? `${parentTaget}.${key}` : key
  let execPromise = [truthKey]

  if (typeof value === 'object' && value !== null) {
    Object.keys(value).forEach((k) => {
      execPromise.push(`${truthKey}.${k}`)
    })
  }

  execPromise.forEach((i) => {
    if (!promiseMap[i]) return
    if (promiseMap[i].onUpdate) {
      let result = promiseMap[i].onUpdate?.(value)
      if (result && promiseMap[i].status == PromiseStatus.PEDDING) {
        // 满足条件使指定key的promise为fulfilled
        promiseMap[i].status = PromiseStatus.FULFILLED
        promiseMap[i].resolve(value)
      } else if (!result && promiseMap[i].status == PromiseStatus.FULFILLED) {
        // 不满足条件重置promise的状态为pedding
        keyPromise[i] = pendingPromise({
          key: i,
          onUpdate: promiseMap[i].onUpdate
        })
      }
    } else if (value && promiseMap[i].status == PromiseStatus.PEDDING) {
      // 满足条件使指定key的promise为fulfilled
      promiseMap[i].status = PromiseStatus.FULFILLED
      promiseMap[i].resolve(value)
    } else if (!value && promiseMap[i].status == PromiseStatus.FULFILLED) {
      // 不满足条件重置promise的状态为pedding
      keyPromise[i] = pendingPromise({
        key: i,
        onUpdate: promiseMap[i].onUpdate
      })
    }
  })
}

export const proxyData = (target: AnyObject): InstanceType<ProxyConstructor> => {
  let proxy = new Proxy(target, {
    get: (obj, prop: string, receiver) => {
      const value = Reflect.get(target, prop, receiver)
      // 深度检测
      if (typeof value === 'object' && value !== null) {
        return proxyData({
          _parentTarget: prop,
          ...value
        })
      }
      watch(prop, value, obj._parentTarget ? obj._parentTarget : null)
      return value
    },
    set: (obj, prop: string, value) => {
      obj[prop] = value
      watch(prop, value, obj._parentTarget ? obj._parentTarget : null)
      return true
    }
  })
  return proxy
}

/**
 *
 * @param watch 监听的键
 * @param target 传入的store
 */
export function init(watchObject: WatchType, target?: object) {
  watchObj = Object.assign({}, watchObject)
  let watchItem = Object.keys(watchObject).map((i) => {
    return watchObject[i]
  })

  for (let w of watchItem) {
    w.key = w.type == 'pinia' ? `pinia-${w.key}` : w.key
    keyPromise[w.key] = pendingPromise(w)
  }

  if (target) {
    // todo 可以传入多个 store，通过 storeId 判断属于哪个 store
    // @ts-ignore
    target.$subscribe((store) => {
      let key = store.events.key,
        value = store.events.newValue
      watch(`pinia-${key}`, value)
    })
  }
}