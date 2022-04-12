export const state = () => ({
  messages: [],
  size: -1,
  userMap: {},
  messagesResolved: true,
  syncFrom: new Date().toISOString()
})

export const getters = {
  list: state => state.messages,
  listResolved: state => state.messagesResolved,
  userMap: state => state.userMap
}

export const actions = {
  async askPortion({ commit, state }) {
    if (state.size === state.messages.length) {
      return
    }
    commit('setMessagesResolved', false)
    const messagesRs = await this.$api.messagesList(
      20, state.messages.length > 0 ? state.messages[0].tsCreated : null
    )
    commit('fillMessagesData', messagesRs)
  },
  async send({ commit }, text) {
    const rs = await this.$api.messagesSend(text)
    const users = {}
    users[rs.user.id] = rs.user

    commit('appendMessagesData', {
      items: [rs.message],
      map: {
        users
      }
    })
  },
  async synchronize({ commit, state }) {
    const rs = await this.$api.messagesSynchronize(state.messages.lastItem ? state.messages.lastItem.tsCreated : state.syncFrom)
    if (!rs.size) {
      return
    }
    commit('appendMessagesData', rs)
  }
}

export const mutations = {
  appendMessagesData(state, data) {
    data.items.forEach(item => {
      if (state.messages.findIndex(m => m.id === item.id) < 0) {
        state.messages.push(item)
        state.size += 1
      }
    })
    state.userMap = {...state.userMap, ...data.map.users}
  },
  fillMessagesData(state, data) {
    state.messages = data.items.concat(state.messages)
    state.size = data.size
    state.userMap = {...state.userMap, ...data.map.users}
    state.messagesResolved = true
  },
  setMessagesResolved(state, val) {
    state.messagesResolved = val
  }
}


