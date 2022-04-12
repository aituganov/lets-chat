import detectEthereumProvider from '@metamask/detect-provider'

const MM_ERR_CODES = {
  PLUGIN_NOT_FOUND: 404,
  REJECTED_BY_USER: 4001,
  RQ_PERMISSIONS: -32002,
}

export class MM {
  instance = null

  constructor () {}

  async initialize(onAccountChangeCb) {
    this.instance = await detectEthereumProvider()
    this._checkInstance()

    if (onAccountChangeCb) {
      this.instance.on('accountsChanged', accounts => onAccountChangeCb(accounts[0]))
    }
    return this.instance.selectedAddress
  }

  async connectAddress() {
    try {
      this._checkInstance();
      // return this.instance.selectedAddress
      const res = await this.instance.request({ method: 'eth_requestAccounts' })
      return res[0]
    } catch (err) {
      this._initializeError(err.code)
    }
  }

  async getSign(nonce) {
    try {
      return await this.instance.request({
        method: 'personal_sign',
        params: [
          `0x${this._toHex(nonce)}`,
          this.instance.selectedAddress
        ],
      })
    } catch (err) {
      this._initializeError(err.code)
    }
  }

  _checkInstance() {
    if (!this.instance) {
      this._initializeError(MM_ERR_CODES.PLUGIN_NOT_FOUND)
    }
  }

  _initializeError(code) {
    switch (code) {
      case MM_ERR_CODES.PLUGIN_NOT_FOUND:
        throw {
          code,
          message: 'Please install MetaMask browser plugin, authorize inside and reload the page',
          link: 'https://metamask.io/download/',
          linkTitle: 'Download'
        }
      case MM_ERR_CODES.REJECTED_BY_USER:
        throw {code, silent: true}
      case MM_ERR_CODES.RQ_PERMISSIONS:
        throw {code, message: 'Please connect account to site from metamask plugin'}
      default:
        throw {code, message: 'Unsupported error'}
    }
  }

  _toHex(stringToConvert) {
    return stringToConvert
      .split('')
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  }
}
