export const state = () => ({
  address: null,
  avatar: null,
  metaMaskAuthorized: false,
  metaMaskInitialized: false,
  resolved: false
})

export const getters = {
  address: state => state.address,
  addressCutted: state => state.addressCutted,
  avatar: state => state.avatar,
  isAuthorized: state => !!state.address,
  isMetaMaskReady: state => state.metaMaskAuthorized && state.metaMaskInitialized,
  isMetaMaskAuthorized: state => state.metaMaskAuthorized,
  isMetaMaskInitialized: state => state.metaMaskInitialized,
  isResolved: state => state.resolved
}

export const actions = {
  async initialize({ commit, dispatch }) {
    try {
      const address = await this.$mm.initialize(async (address) => {
        commit('setMetaMaskAuthorized', !!address)
        await dispatch('logout')
      })
      commit('setMetaMaskInitialized', true)
      commit('setMetaMaskAuthorized', !!address)
      const user = await this.$api.userGet()
      if (user.id === address) {
        commit('setUserData', user)
      } else {
        dispatch('logout')
      }
    } catch (err) {
      commit('clearUserData')
      throw err
    }
  },
  async login({ commit }) {
    commit('setResolved', false)
    try {
      const address = await this.$mm.connectAddress()
      const nonce = await this.$api.signByMetaMask(address)
      const sign = await this.$mm.getSign(nonce)
      const rs = await this.$api.signByMetaMaskCheck(address, sign)
      commit('setUserData', rs.user)
    } catch (err) {
      commit('setResolved', true)
    }
  },
  async logout({ commit, state }) {
    commit('setResolved', false)
    try {
      await this.$api.signOut()
    } catch (err) {}
    commit('clearUserData')
  }
}

export const mutations = {
  async clearUserData(state) {
    state.address = null
    state.addressCutted = null
    state.avatar = null
    state.resolved = true
    await this.$router.push('/')
  },
  setMetaMaskAuthorized(state, value) {
    state.metaMaskAuthorized = value
  },
  setMetaMaskInitialized(state, value) {
    state.metaMaskInitialized = value
  },
  async setUserData(state, data) {
    state.address = data.id
    state.addressCutted = data.addressCutted
    state.avatar = data.avatar
    state.resolved = true
    await this.$router.push('/chat')
  },
  setResolved(state, resolved) {
    state.resolved = resolved
  }
}

