# when-hooks

**简体中文** | [English](README.en.md)

> 页面 `onShow` 了，但 token 还没恢复、用户信息还没拉回来——回调不该现在跑。
> `when-hooks` 让你把「等条件」这件事交给钩子本身。

[![npm](https://img.shields.io/npm/v/@when-hooks/uni.svg)](https://www.npmjs.com/package/@when-hooks/uni)
![license](https://img.shields.io/npm/l/@when-hooks/uni.svg)

**条件生命周期钩子**：只有当「生命周期已经到达」**并且**「自定义状态条件已经满足」时，才执行你的回调。

适用于 uni-app + Vue 3 页面中那些同时依赖生命周期和异步状态的业务逻辑：登录态、用户信息、权限、路由参数、Pinia store 数据、局部 ref 或接口结果。

## 为什么需要它

生命周期到达，不等于业务前置条件已经就绪。这类 bug 你一定见过：

- `onShow` 已触发，但本地 token 还没从 storage 恢复 → 接口 401。
- `onLoad` 已触发，但用户信息或权限还没加载完成 → 页面渲染出空数据。
- 组件已经 mounted，但接口结果还没回来 → 拿到 `undefined`。

于是代码变成这样——每个页面都要写一遍，还容易漏掉「页面提前退出」的情况：

```ts
// ❌ 没有 when-hooks：flag + watch + 手动清理，每个页面重复一遍
onShow(() => {
  if (globalData.token) {
    refreshPageData()
  } else {
    // token 还没好，只能自己 watch，还得记得停掉
    const stop = watch(
      () => globalData.token,
      (token) => {
        if (!token) return
        stop()
        refreshPageData()
      }
    )
    onHide(stop) // 一旦忘了这行，页面隐藏后回调还会打进来
  }
})
```

用 when-hooks 就是一行：

```ts
// ✅ 条件写在钩子上，等待、去重、取消都由库负责
onShowWhen(['Login'], () => {
  refreshPageData()
})
```

核心语义只有一条规则：

```text
生命周期窗口开启 + 所有条件满足 => 执行回调
```

由此得到的几个特性：

- **不轮询、不 `setTimeout`** —— 基于 Vue 响应式，条件满足的那一刻就执行。
- **自动取消** —— 页面隐藏或卸载时，本轮等待直接作废，不会出现「回到上一页后旧回调又跑了」。
- **条件可复用** —— `Login`、`UserInfo` 这些条件在 `init` 里注册一次，全项目按名字引用，不再到处抄 `if (token && userInfo)`。
- **每轮独立** —— 每次窗口开启都是新的一轮等待，回调在一轮内只执行一次（局部钩子可用 `triggerOnChange` 让值变化时重复触发）。

## 安装

```bash
npm i @when-hooks/uni
```

## 快速开始

### 1. 创建响应式全局状态

```ts
// global.ts
import { createProxy } from '@when-hooks/uni'

interface GlobalData {
  token: string
  userInfo: { name: string } | null
}

export const globalData = createProxy<GlobalData>({
  token: '',
  userInfo: null,
})
```

`createProxy` 底层使用 Vue `reactive()`，所以嵌套属性变化也可以被监听。

### 2. 注册具名条件

```ts
// App.vue 或应用初始化入口
import { init } from '@when-hooks/uni'
import { useUserStore } from '@/stores/user'

init({
  Login: {
    key: 'token',
    onUpdate: (value) => !!value,
  },
  UserInfo: {
    key: 'userInfo',
  },
  UserName: {
    key: 'userInfo.name',
  },
  PiniaLogin: {
    type: 'pinia',
    store: useUserStore(),
    key: 'token',
    onUpdate: (value) => value.length > 0,
  },
})
```

每个条件都会把一个可读名称，例如 `Login`，映射到全局状态或 Pinia store 的某个路径。

### 3. 在页面中使用条件生命周期

```vue
<script setup lang="ts">
import { onLoadWhen, onShowWhen } from '@when-hooks/uni'

onLoadWhen(['Login', 'UserInfo'], (options) => {
  // onLoad 已触发，并且 Login + UserInfo 都准备好后执行。
  console.log('页面已加载，用户上下文已就绪', options)
})

onShowWhen(['Login'], () => {
  // 每次 onShow 后开始等待，Login 满足时执行一次。
  refreshPageData()
})
</script>
```

如果页面在条件满足前隐藏或卸载，本轮等待会被取消。下一次生命周期开启时会重新开始一轮等待。

## 适用场景

| 场景 | 示例 |
| --- | --- |
| 登录态网关 | token 恢复之后才执行 `onShow` 里的业务逻辑。 |
| 用户上下文就绪 | 等待 `Login + UserInfo` 都满足后初始化页面。 |
| 权限网关 | 权限准备好后再渲染或请求受保护数据。 |
| Pinia 状态联动 | store 状态达到某个业务条件时触发副作用。 |
| 局部组件就绪 | mounted/show 后等待局部 `ref`、computed 或接口结果。 |

## API 概览

### 全局 / Pinia 条件

全局钩子依赖 `init` 注册的具名条件。

```ts
onShowWhen(keys, callback)
```

| 钩子 | 生命周期窗口 |
| --- | --- |
| `onLaunchWhen` | `onLaunch` 开启，`onHide` 关闭 |
| `onLoadWhen` | `onLoad` 开启，`onUnload` 关闭 |
| `onShowWhen` | `onShow` 开启，`onHide` / `onUnload` 关闭 |
| `onCreatedWhen` | setup 同步阶段开启，卸载关闭 |
| `onMountedWhen` | `onMounted` 开启，`onUnmounted` 关闭 |
| `onReadyWhen` | `onReady` 开启，`onUnload` 关闭 |

### 局部条件

局部钩子不需要 `init`，可以直接监听组件内的 `ref`、`reactive`、`computed` 或 getter。

```ts
import { ref } from 'vue'
import { onMountedWhenLocal } from '@when-hooks/uni'

const elementReady = ref(false)

onMountedWhenLocal(
  {
    watchSource: elementReady,
    condition: (value) => value === true,
  },
  () => {
    // mounted 后，并且 elementReady 为 true 时执行。
  },
)
```

可用局部钩子：

- `onLoadWhenLocal`
- `onShowWhenLocal`
- `onMountedWhenLocal`
- `onReadyWhenLocal`

局部钩子配置：

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `watchSource` | `WatchSource \| WatchSource[]` | 局部值、getter、computed 或多个监听源。 |
| `condition` | `(value: any) => boolean` | 自定义条件，默认按真值判断。 |
| `triggerOnChange` | `boolean` | 生命周期窗口开启后，值变化时是否再次触发。 |
| `immediate` | `boolean` | 首次就绪时是否允许在生命周期开启前立即触发。 |

## 包结构

本仓库是 pnpm workspace monorepo。

| 包 | 说明 |
| --- | --- |
| `@when-hooks/core` | 框架无关内核：条件源、生命周期窗口、`whenAll` 和取消语义。 |
| `@when-hooks/uni` | uni-app / Vue 3 适配层：基于 Vue 响应式和 uni-app 生命周期实现。 |

核心模型刻意保持很小：

```text
ConditionSource[] + LifecycleWindow => callback
```

适配层负责把具体框架里的状态和生命周期翻译成这个模型。

## 从 custom-hooks-plus 迁移

旧的回调前置 API 仍作为 deprecated 别名导出。建议使用新的条件前置命名：

| 旧 API | 新 API |
| --- | --- |
| `onCustomLaunch(cb, keys)` | `onLaunchWhen(keys, cb)` |
| `onCustomLoad(cb, keys)` | `onLoadWhen(keys, cb)` |
| `onCustomShow(cb, keys)` | `onShowWhen(keys, cb)` |
| `onCustomCreated(cb, keys)` | `onCreatedWhen(keys, cb)` |
| `onCustomMounted(cb, keys)` | `onMountedWhen(keys, cb)` |
| `onCustomReady(cb, keys)` | `onReadyWhen(keys, cb)` |
| `onLocalCustomLoad(cb, options)` | `onLoadWhenLocal(options, cb)` |
| `onLocalCustomShow(cb, options)` | `onShowWhenLocal(options, cb)` |
| `onLocalCustomMounted(cb, options)` | `onMountedWhenLocal(options, cb)` |
| `onLocalCustomReady(cb, options)` | `onReadyWhenLocal(options, cb)` |

`proxyData` 已弃用，请使用 `createProxy`。

## 开发

```bash
pnpm install
pnpm build
pnpm test:run
pnpm typecheck
pnpm check-publish
```

## 许可证

ISC
