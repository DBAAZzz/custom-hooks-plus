import { createProxy } from "../core"

interface GlobalData {
  token: string
  userInfo: {
    name: string
  }
}

export const globalData = createProxy({
  token: '',
  userInfo: {
    name: ''
  }
})

export function set<K extends keyof GlobalData>(key: K, val: GlobalData[K]) {
  globalData[key] = val
}

export function get<K extends keyof GlobalData>(key: K): GlobalData[K] {
  return globalData[key]
}
