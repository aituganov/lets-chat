import axios from 'axios'

export class API {
  $http

  constructor (onErrorCB) {
    this.$http = axios.create({
      baseURL: '/api'
    })

    this.$http.interceptors.response.use(
      response => {
        const data = response.data && typeof response.data !== 'string' ? response.data : {}
        data.rqId = response.data && response.data.rqId
        return Promise.resolve(data)
      },
      error => {
        let err = error
        if (error.response && error.response.data) {
          err = Object.assign({}, error.response.data)
          err.code = error.response.data.code
        } else if (error.response) {
          err = {
            message: 'Во время запроса произошла ошибка',
            additionalInfo: error.response.data,
            code: error.response.status
          }
        }
        if (err.code === 401) {
          err.silent = true
        }
        if (onErrorCB) {
          onErrorCB(err)
        }
        return Promise.reject(err)
      }
    )
  }

  async chatOnlineList() {
    return await this.$http.get('/chat/online')
  }

  async messagesList(limit, toMessageTS) {
    return await this.$http.get('/messages', {params: {limit, toMessageTS}})
  }

  async messagesSend(text) {
    return await this.$http.put('/messages/create', {text})
  }

  async messagesSynchronize(from) {
    return await this.$http.get('/messages/synchronize', {params: {from}})
  }

  async signByMetaMask(address) {
    try {
      const res = await this.$http.put('/sign/in/metaMask', {address})
      return res.nonce
    } catch (err) {
      console.error(err)
    }
  }

  async signByMetaMaskCheck(address, signature) {
    try {
      return await this.$http.post('/sign/in/metaMask/check', {address, signature})
    } catch (err) {
      console.error(err)
    }
  }

  async signOut() {
    return await this.$http.delete('sign')
  }

  async userGet() {
    return await this.$http.get('/user')
  }
}
