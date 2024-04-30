# custom-hooks-plus

- [custom-hooks-plus](#custom-hooks-plus)
  - [custom-hooks-plus 的作用](#custom-hooks-plus-的作用)
  - [下载和使用](#下载和使用)
    - [proxyData 的作用](#proxydata-的作用)
    - [init 的作用](#init-的作用)
  - [可用的自定义钩子](#可用的自定义钩子)

## custom-hooks-plus 的作用

`custom-hooks-plus` 提供了一系列自定义钩子（Hooks）来帮助开发者在**特定的时刻**执行代码。

这个特定的时刻为 `vue3 或 uniapp 中的生命周期 hooks` + `自定义的变量或者状态的变化`来执行代码

如下面这个自定义钩子的触发时机为 `Username 的值不为空` + `uniapp 的 onShow 生命周期`。

```ts
onCustomShow(() => {
  console.log('onShow+username');
}, 'Username');
```

这使得开发者能够创建更灵活的响应式逻辑，尤其是在需要根据应用状态的变化来执行特定操作时。

`custom-hooks-plus` 主要导出了以下几种方法：

- proxyData
- init
- 一系列自定义钩子

## 下载和使用

###　下载

```bash
npm i custom-hooks-plus
```

### proxyData 的作用

proxyData 的作用就是监听传入对象的变化。

```js
// global.ts 文件
import { proxyData } from 'custom-hooks-plus'

interface GlobalData {
  token: string
  userInfo: number
}

export const globalData = proxyData({
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
```

### init 的作用

init 方法的定义为：

```ts
export declare function init(
  watchObject: {
    [key: string]: {
      key: string; // 需要监听的key，需要在proxyData中传入对象里定义，否则会不生效
      type?: 'pinia' | 'default'; // 默认为 default，如果target传入了pinia的store实例，需要监听store的key，则type类型传 pinia
      onUpdate?: (val: any) => boolean; // 更新条件
    };
  },
  target?: object // 传入 pinia 的 store 实例
): void;
```

具体方法为：

```js
// App.vue 中使用
import { init } from 'custom-hooks-plus';
import { useCounterStore } from '@/store/index';

init(
  {
    Login: {
      key: 'token', // 监听global文件中globalData的token的变化
      onUpdate: (val) => {
        return !!val;
      },
    },
    UserInfo: {
      key: 'userInfo', // 监听global文件中globalData的userinfo的变化
    },
    Name: {
      key: 'userInfo.name', // 监听global文件中globalData的userinfo.name的变化
    },
    Count: {
      key: 'counter', // 监听 useCounterStore 中 state 的 counter的变化
      type: 'pinia',
      onUpdate: (val) => {
        return val === 2;
      }, // 更新条件为 val 等于 2
    },
  },
  useCounterStore()
);
```

使用自定义生命周期钩子

```ts
// 页面中使用
<script setup lang="ts">
import { onCustomLoad, onCustomShow } from 'custom-hooks-plus';

onCustomLoad((options) => {
  console.log('LoginUserInfo钩子执行-onCustomLoad1', options);
  console.log('globalData的token和userInfo都被修改了才会触发');
}, ['Login', 'UserInfo']);

onCustomShow(() => {
  console.log('LoginUserInfo钩子执行-onCustomShow2');
  console.log('globalData的token和userInfo都被修改了才会触发');
}, ['Login', 'UserInfo']);

onCustomShow(() => {
  console.log('UserInfoLogin钩子执行-onCustomShow3');
  console.log('globalData的token被修改了才会触发');
}, ['Login']);

</script>
```

## 可用的自定义钩子

| 支持的自定义钩子 | 执行时机                   |
| ---------------- | -------------------------- |
| onCustomLaunch   | 对应 uniapp 的 onLaunch    |
| onCustomLoad     | 对应 uniapp 的 onLoad      |
| onCustomCreated  | 渲染时机为 Vue2 的 created |
| onCustomShow     | 对应 uniapp 的 onShow      |
| onCustomMounted  | 对应 uniapp 的 onMounted   |
| onCustomReady    | 对应 uniapp 的 onReady     |
