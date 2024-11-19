import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      token: '',
      name: '',
    }
  },
  actions: {
    setToken(token: string) {
      this.token = token
    },
    setName(name: string) {
      this.name = name
    }
  },
})
