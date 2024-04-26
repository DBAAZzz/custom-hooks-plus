import { PromiseStatus, Watch } from './types/index'

type WatchType = {
  [key: string]: Watch
}

type PromiseMap = {
  [key: string]: {
    status: PromiseStatus
    resolve: Function,
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

export const proxyData = (target: AnyObject) => {
  let proxy = new Proxy(target, {
    get: (obj, prop: string) => {
      return prop in obj ? obj[prop] : undefined
    },
    set: (obj, prop: string, value) => {
      obj[prop] = value
      if (promiseMap[prop] && promiseMap[prop].status == PromiseStatus.PEDDING) {
        if (promiseMap[prop].onUpdate) {
          // 更新函数的结果为 true 才更新状态
          const result = promiseMap[prop].onUpdate?.(value)
          if (result) {
            promiseMap[prop].status = PromiseStatus.FULFILLED
            promiseMap[prop].resolve(value)
          }
        } else {
          promiseMap[prop].status = PromiseStatus.FULFILLED
          promiseMap[prop].resolve(value)
        }
      }
      return true
    }
  })
  return proxy
}

/**
 *
 * @param watch 监听的键
 * @param target 监听的目标对象
 */
export function init(watch: WatchType, target: object) {
  watchObj = Object.assign({}, watch)
  let watchItem = Object.keys(watch).map((i) => {
    return watch[i]
  })

  for (let watch of watchItem) {
    keyPromise[watch.key] = pendingPromise(watch)
  }
}