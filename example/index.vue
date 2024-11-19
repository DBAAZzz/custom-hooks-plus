<template>
  <div>
    <div>测试index页面</div>
    <button id="button" @click="changeName">按钮</button>
    <button id="button2" @click="setToken">修改token</button>
    <button id="button3" @click="setUserInfo">修改用户信息</button>
    <button id="button4" @click="setUserInfoKey">修改用户信息</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { set } from './global'
import { useUserStore } from './stores/user'
import { init, onCustomMounted } from '../core'

init({
  Login: {
    key: 'token',
    type: 'pinia',
    store: useUserStore()
  },
  Name: {
    key: 'name',
    type: 'pinia',
    store: useUserStore()
  },
  GlobalLogin: {
    key: 'token',
  },
  UserInfo: {
    key: 'userInfo'
  },
  UserInfoA: {
    key: 'userInfo.a'
  }
})

const customMountedLogin = ref(false)
const customMountedLoginName = ref(false)
const customMountedGlobalLogin = ref(false)
const customMountedGlobalUserInfo = ref(false)
const customMountedGlobalUserInfoA = ref(false)

useUserStore().setToken('newToken')

onCustomMounted(() => {
  customMountedLogin.value = true
}, ['Login'])

onCustomMounted(() => {
  customMountedGlobalLogin.value = true
}, ['GlobalLogin'])

onCustomMounted(() => {
  customMountedGlobalUserInfo.value = true
}, ['UserInfo'])

onCustomMounted(() => {
  console.log("执行了饿UserInfoA");
  customMountedGlobalUserInfoA.value = true
}, ['UserInfoA'])

onCustomMounted(() => {
  customMountedLoginName.value = true
}, ['Login', 'Name'])

const changeName = () => {
  useUserStore().setName("newName")
}

const setToken = () => {
  set('token', "newToekn")
}

const setUserInfo = () => {
  set('userInfo', {
    b: 2
  })
}

const setUserInfoKey = () => {
  set('userInfo', {
    a: 2
  })
}

</script>
