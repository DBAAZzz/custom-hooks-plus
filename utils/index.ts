import { watch } from 'vue'
/**
 * 生成唯一uuid
 * @returns
 */
export function generateUUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getSharedKey(watchKey: string[] | string, uuid: string): string {
  if (!Array.isArray(watchKey)) {
    watchKey = [watchKey]
  }
  return watchKey.join('-') + `-${uuid}`
}

export function generatePiniaKey(key: string, store: any): string {
  return `pinia-${store.$id}-${key}`
}

export function watchs(store: any, key: string, callback: Function) {
  return watch(
    () => store.$state[key],
    (newVal) => {
      callback(newVal)
    },
    { immediate: false }
  )
}
