<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <div class="text-center my-10">
        <v-icon color="primary" size="88">mdi-forum-outline</v-icon>
      </div>
      <div v-if="isMetaMaskInitialized">
        <div v-if="isMetaMaskAuthorized && isUnAuthorized" class="subtitle-1 text-center">
          <v-btn class="btn-connect"
                 color="primary"
                 :disabled="connectProcess"
                 @click="connect">
            <v-progress-circular v-if="connectProcess"
                                 class="mx-2"
                                 indeterminate
                                 size="20">
            </v-progress-circular>
            {{connectProcess ? 'Connecting...' : 'Connect MetaMask account!'}}
          </v-btn>
        </div>
        <p v-else class="subtitle-1">
          Log in inside MetaMask plugin for chatting
        </p>
      </div>
      <div v-else>
        <p class="subtitle-1">
          Complete steps below for chatting:
        </p>
        <ul>
          <li><a href="https://metamask.io/download/" target="_blank">install</a> MetaMask plugin for browser;</li>
          <li>log in inside plugin;</li>
          <li>reload this page;</li>
          <li>connect MetaMask account to Let's Chat and Let's Chat! = )</li>
        </ul>
      </div>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'IndexPage',
  computed: {
    isMetaMaskAuthorized() {
      return this.$store.getters['users/isMetaMaskAuthorized']
    },
    isMetaMaskInitialized() {
      return this.$store.getters['users/isMetaMaskInitialized']
    },
    isUnAuthorized() {
      return !this.$store.getters['users/isAuthorized']
    }
  },
  data() {
    return {
      connectProcess: false
    };
  },
  methods: {
    async connect() {
      this.connectProcess = true
      await this.$store.dispatch('users/login')
      this.connectProcess = false
    }
  }
}
</script>

<style scoped>
.btn-connect {
  width: 290px;
}
</style>
