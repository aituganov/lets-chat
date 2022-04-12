export const state = () => ({
  online: [],
  onlineResolved: false,
  onlineUserMap: {}
})

export const getters = {
  online: state => state.online,
  onlineResolved: state => state.onlineResolved,
  onlineUserMap: state => state.onlineUserMap
}

export const actions = {
  async getOnline ({commit}) {
    const onlineRs = await this.$api.chatOnlineList()
    commit('fillOnlineData', onlineRs)
  }
}

export const mutations = {
  async fillOnlineData (state, data) {
    state.online = data.items
    state.onlineUserMap = data.map.users
    state.onlineResolved = true
  }
}
