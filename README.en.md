# when-hooks

[简体中文](README.md) | **English**

> The page fired `onShow`, but the token has not been restored and the user profile has not arrived yet — the callback should not run now.
> `when-hooks` moves that waiting into the hook itself.

[![npm](https://img.shields.io/npm/v/@when-hooks/uni.svg)](https://www.npmjs.com/package/@when-hooks/uni)
![license](https://img.shields.io/npm/l/@when-hooks/uni.svg)

**Conditional lifecycle hooks**: run code only when a lifecycle hook has fired **and** your custom state conditions are ready.

Built for uni-app + Vue 3 pages where business logic depends on both page lifecycle and async state readiness: login state, user profile, permissions, route params, Pinia store data, local refs, or API results.

## Why

Lifecycle timing does not mean your preconditions are ready. These bugs are familiar:

- `onShow` fires before the login token is restored from storage → the request 401s.
- `onLoad` runs before user info or permissions are loaded → the page renders empty data.
- A component is mounted before the API result comes back → you read `undefined`.

So the code turns into this — repeated in every page, and easy to get wrong when the page leaves early:

```ts
// ❌ Without when-hooks: flags, watch, manual cleanup, once per page
onShow(() => {
  if (globalData.token) {
    refreshPageData()
  } else {
    // Token is not ready, so you watch it yourself — and must remember to stop
    const stop = watch(
      () => globalData.token,
      (token) => {
        if (!token) return
        stop()
        refreshPageData()
      }
    )
    onHide(stop) // Forget this line and the callback still fires after the page hides
  }
})
```

With when-hooks it is one line:

```ts
// ✅ Conditions live on the hook; waiting, deduping and cancellation are handled for you
onShowWhen(['Login'], () => {
  refreshPageData()
})
```

The whole model is one rule:

```text
lifecycle window is open + all conditions are true => run callback
```

Which gives you:

- **No polling, no `setTimeout`** — built on Vue reactivity, it runs the moment conditions become true.
- **Automatic cancellation** — hiding or unloading the page voids the current wait, so a stale callback never fires after you navigate back.
- **Reusable conditions** — register `Login`, `UserInfo` once in `init` and reference them by name everywhere, instead of copying `if (token && userInfo)` around.
- **One round at a time** — each window opening starts a fresh wait and the callback runs once per round (local hooks can opt into `triggerOnChange` to re-run on change).

## Install

```bash
npm i @when-hooks/uni
```

## Quick Start

### 1. Create reactive global state

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

`createProxy` uses Vue `reactive()` internally, so nested changes can be observed.

### 2. Register named conditions

```ts
// App.vue or app bootstrap
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

Each condition maps a readable name, such as `Login`, to a global or Pinia state path.

### 3. Use lifecycle conditions in pages

```vue
<script setup lang="ts">
import { onLoadWhen, onShowWhen } from '@when-hooks/uni'

onLoadWhen(['Login', 'UserInfo'], (options) => {
  // Runs when onLoad has fired and both Login + UserInfo are ready.
  console.log('page loaded with user context', options)
})

onShowWhen(['Login'], () => {
  // Each onShow starts a new wait; runs once when Login is satisfied.
  refreshPageData()
})
</script>
```

If the page hides or unloads before the conditions are satisfied, the current wait is canceled. The next lifecycle opening starts a fresh wait.

## Common Use Cases

| Scenario | Example |
| --- | --- |
| Login gate | Run `onShow` logic only after token restoration. |
| User context | Wait for `Login + UserInfo` before initializing a page. |
| Permission gate | Wait for permissions before rendering or requesting protected data. |
| Pinia state coordination | Trigger side effects when store state reaches a business condition. |
| Local component readiness | Wait for a local `ref`, computed value, or API result after mount/show. |

## API Overview

### Global / Pinia Conditions

Global hooks use conditions registered with `init`.

```ts
onShowWhen(keys, callback)
```

| Hook | Lifecycle Window |
| --- | --- |
| `onLaunchWhen` | `onLaunch` opens, `onHide` closes |
| `onLoadWhen` | `onLoad` opens, `onUnload` closes |
| `onShowWhen` | `onShow` opens, `onHide` / `onUnload` closes |
| `onCreatedWhen` | setup-time open, unmount closes |
| `onMountedWhen` | `onMounted` opens, `onUnmounted` closes |
| `onReadyWhen` | `onReady` opens, `onUnload` closes |

### Local Conditions

Local hooks do not need `init`. They watch component-local `ref`, `reactive`, `computed`, or getter values.

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
    // Runs after mounted and elementReady is true.
  },
)
```

Available local hooks:

- `onLoadWhenLocal`
- `onShowWhenLocal`
- `onMountedWhenLocal`
- `onReadyWhenLocal`

Local hook options:

| Option | Type | Description |
| --- | --- | --- |
| `watchSource` | `WatchSource \| WatchSource[]` | Local value, getter, computed, or array of sources. |
| `condition` | `(value: any) => boolean` | Custom condition. Defaults to truthy check. |
| `triggerOnChange` | `boolean` | Re-run when the watched value changes while the lifecycle window is active. |
| `immediate` | `boolean` | Allow the first ready value to trigger immediately before the lifecycle opens. |

## Packages

This repository is a pnpm workspace monorepo.

| Package | Description |
| --- | --- |
| `@when-hooks/core` | Framework-agnostic core: condition sources, lifecycle windows, `whenAll`, and cancellation semantics. |
| `@when-hooks/uni` | uni-app / Vue 3 adapter built on Vue reactivity and uni-app lifecycle hooks. |

The core model is intentionally small:

```text
ConditionSource[] + LifecycleWindow => callback
```

Adapters translate framework state and lifecycle hooks into this model.

## Migration from custom-hooks-plus

The old callback-first APIs are still exported as deprecated aliases. Prefer the new condition-first names:

| Deprecated | Use Instead |
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

`proxyData` is deprecated. Use `createProxy`.

## Development

```bash
pnpm install
pnpm build
pnpm test:run
pnpm typecheck
pnpm check-publish
```

## License

ISC
