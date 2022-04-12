export const state = () => ({
  error: null,
})

export const getters = {
  error: state => state.error
}

export const mutations = {
  setError(state, err) {
    state.error = err
  }
}
