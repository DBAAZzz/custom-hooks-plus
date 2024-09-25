import { CustomHook, HookFunction, PromiseStatus } from './types'
import { generateUUIDv4, getSharedKey } from '../utils'
import { keyPromise, promiseMap, watchObj } from './init'
import { _onLaunch, _onLoad, _onShow, _onReady, _onMounted, _onCreated } from './rewrite'

const shared: AnyObject = {}

function getWatchKey(watchKey: string | string[], method: string): string[] {
  const keys = Array.isArray(watchKey) ? watchKey : [watchKey];
  return keys.filter(key => {
    if (key in watchObj) return true;
    console.error(`Method: ${method}, Key: ${key}, Error: "监听的值未注册，该key值不生效，请检查init方法"`);
    return false;
  });
}

function resetCallback(watchKey: string[] | string, uuid: string) {
  const key = getSharedKey(watchKey, uuid)
  const customPromise = shared[key]
  if (customPromise) {
    customPromise.reject()
    delete shared[key]
  }
}

function getHookPromise(watchKey: string[] | string, uuid: string, method: string) {
  // 通过 watchKey + uuid 生成唯一 key
  const sharedKey = getSharedKey(watchKey, uuid)
  shared[sharedKey] = {}
  shared[sharedKey].promise = new Promise((_, reject) => {
    shared[sharedKey].reject = reject
  })

  const _watchKey = getWatchKey(watchKey, method)
  // 根据 key 生成 promise iterable
  const iterable = _watchKey.map((i) => {
    const promiseKey = watchObj[i].key
    return promiseMap[promiseKey].status == PromiseStatus.FULFILLED
      ? Promise.resolve
      : keyPromise[promiseKey]
  })

  const promise = Promise.race([Promise.all(iterable), shared[sharedKey].promise])
  return promise
}

function createCustomHook(
  hookFn: HookFunction,
  cb: (options?: any) => void,
  watchKey: string[] | string,
  methodName: string
) {
  const uuid = generateUUIDv4()
  hookFn(
    () => { },
    async (options) => {
      try {
        await getHookPromise(watchKey, uuid, methodName)
        cb(options)
      } catch (e) { }
    },
    () => {
      resetCallback(watchKey, uuid)
    }
  )
}

const createNamedHook = (hookFn: HookFunction, methodName: string): CustomHook =>
  (cb, watchKey) => createCustomHook(hookFn, cb, watchKey, methodName);

export const onCustomLaunch = createNamedHook(_onLaunch, 'onCustomLaunch');
export const onCustomLoad = createNamedHook(_onLoad, 'onCustomLoad');
export const onCustomShow = createNamedHook(_onShow, 'onCustomShow');
export const onCustomCreated = createNamedHook(_onCreated, 'onCustomCreated');
export const onCustomMounted = createNamedHook(_onMounted, 'onCustomMounted');
export const onCustomReady = createNamedHook(_onReady, 'onCustomReady');
