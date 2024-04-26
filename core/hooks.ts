import { PromiseStatus } from './types'
import { keyPromise, promiseMap, watchObj } from './init'
import { _onLaunch, _onLoad, _onShow, _onReady, _onMounted, _onCreated } from './rewrite'

const shared: AnyObject = {}

function generateUUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getWatchKey(watchKey: Array<string> | string, methods: string): Array<string> {
  let _watchKey: Array<string> = []
  if (!Array.isArray(watchKey)) {
    watchKey = [watchKey]
  }
  ; (watchKey || []).forEach((e) => {
    if (e in watchObj) {
      _watchKey.push(e)
    } else {
      console.error({
        methods,
        key: e,
        error: `监听的值未注册，请检查init方法`
      })
    }
  })
  return _watchKey
}

function getSharedKey(watchKey: Array<string> | string, uuid: string): string {
  if (!Array.isArray(watchKey)) {
    watchKey = [watchKey]
  }
  return watchKey.join('-') + `-${uuid}`
}

function resetCallback(watchKey: Array<string> | string, uuid: string) {
  let customPromise = shared[getSharedKey(watchKey, uuid)]
  if (customPromise) {
    customPromise.reject()
    delete shared[getSharedKey(watchKey, uuid)]
  }
}

function getHookPromise(watchKey: Array<string> | string, uuid: string, methods: string) {
  // 通过 watchKey + uuid 生成唯一 key
  let sharedKey = getSharedKey(watchKey, uuid)
  shared[sharedKey] = {}
  shared[sharedKey].promise = new Promise((_, reject) => {
    shared[sharedKey].reject = reject
  })

  let _watchKey = getWatchKey(watchKey, methods)
  // 根据 key 生成 promise iterable
  let iterable = _watchKey.map((i) => {
    let promiseKey = watchObj[i].key
    return promiseMap[promiseKey].status == PromiseStatus.FULFILLED
      ? Promise.resolve
      : keyPromise[promiseKey]
  })

  let promise = Promise.race([Promise.all(iterable), shared[sharedKey].promise])
  return promise
}

export const onCustomLaunch = function (cb: (options?: App.LaunchShowOption) => void, watchKey: Array<string> | string) {
  let uuid = generateUUIDv4()
  _onLaunch(
    (options?: AnyObject) => { },
    async (options?: App.LaunchShowOption) => {
      try {
        await getHookPromise(watchKey, uuid, 'onCustomLaunch')
        cb(options)
      } catch (e) { }
    },
    () => {
      resetCallback(watchKey, uuid)
    }
  )
}

export const onCustomLoad = function (cb: (options?: AnyObject) => void, watchKey: Array<string> | string) {
  let uuid = generateUUIDv4()

  _onLoad(
    (options?: AnyObject) => { },
    async (options: AnyObject) => {
      try {
        await getHookPromise(watchKey, uuid, 'onCustomLoad')
        cb(options)
      } catch (e) { }
    },
    () => {
      resetCallback(watchKey, uuid)
    }
  )
}

export const onCustomShow = function (cb: () => void, watchKey: Array<string> | string) {
  let uuid = generateUUIDv4()

  _onShow(
    (options?: AnyObject) => { },
    async () => {
      try {
        await getHookPromise(watchKey, uuid, 'onCustomShow')
        cb()
      } catch (e) { }
    },
    () => {
      resetCallback(watchKey, uuid)
    }
  )
}

export const onCustomCreated = function (cb: () => void, watchKey: Array<string> | string) {
  let uuid = generateUUIDv4()

  _onCreated(
    (options?: AnyObject) => { },
    async () => {
      try {
        await getHookPromise(watchKey, uuid, 'onCustomCreated')
        cb()
      } catch (e) { }
    },
    () => {
      resetCallback(watchKey, uuid)
    }
  )
}

export const onCustomMounted = function (cb: () => void, watchKey: Array<string> | string) {
  let uuid = generateUUIDv4()
  _onMounted(
    (options?: AnyObject) => { },
    async () => {
      try {
        await getHookPromise(watchKey, uuid, 'onCustomMounted')
        cb()
      } catch (e) { }
    },
    () => {
      resetCallback(watchKey, uuid)
    }
  )
}

export const onCustomReady = function (cb: () => void, watchKey: Array<string> | string) {
  let uuid = generateUUIDv4()
  _onShow(
    (options?: AnyObject) => { },
    async () => {
      try {
        await getHookPromise(watchKey, uuid, 'onCustomReady')
        cb()
      } catch (e) { }
    },
    () => {
      resetCallback(watchKey, uuid)
    }
  )
}
