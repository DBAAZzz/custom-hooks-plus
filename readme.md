# custom-hooks-plus

## 下载

```bash
npm i custom-hooks-plus
```

## 使用

```js
// global.ts 文件
import { proxyData } from 'custom-hooks-plus'

interface GlobalData {
  token: string
  userInfo: number
}

export const globalData = proxyData({
  token: '',
  userInfo: ''
})

export function set<K extends keyof GlobalData>(key: K, val: GlobalData[K]) {
  globalData[key] = val
}

export function get<K extends keyof GlobalData>(key: K): GlobalData[K] {
  return globalData[key]
}
```

```js
// App.vue 文件中使用
import { init } from 'custom-hooks-plus';
import { globalData } from 'global.ts';

// 通过init方法监听globalData中值的变化，key值必须要在globalData定义过才会生效
init(
  {
    Login: {
      key: 'token',
      onUpdate: (val) => {
        return !!val;
      },
    },
    UserInfo: {
      key: 'userInfo',
    },
  },
  globalData
);
```

```ts
// 页面中使用
<script setup lang="ts">
import { onCustomLoad, onCustomShow } from 'custom-hooks-plus';

onCustomLoad((options) => {
  console.log('LoginUserInfo钩子执行-onCustomLoad1', options);
  console.log('Login和UserInfo同时被修改了才会生效');
}, ['Login', 'UserInfo']);

onCustomShow(() => {
  console.log('LoginUserInfo钩子执行-onCustomShow2');
  console.log('Login和UserInfo同时被修改了才会生效');
}, ['Login', 'UserInfo']);

onCustomShow(() => {
  console.log('UserInfoLogin钩子执行-onCustomShow3');
  console.log('Login被修改了才会生效');
}, ['Login']);

</script>
```

## 可用的自定义钩子

| 支持的自定义钩子 | 说明                       |
| ---------------- | -------------------------- |
| onCustomLaunch   | 对应 uniapp 的 onLaunch    |
| onCustomLoad     | 对应 uniapp 的 onLoad      |
| onCustomCreated  | 渲染时机为 Vue2 的 created |
| onCustomShow     | 对应 uniapp 的 onShow      |
| onCustomMounted  | 对应 uniapp 的 onMounted   |
| onCustomReady    | 对应 uniapp 的 onReady     |
