<template>
  <v-list>
    <v-subheader>Online users</v-subheader>

    <div v-if="onlineResolved">
      <user-preview v-for="item of online" :key="item.id" :item="userMap[item.idUser]"></user-preview>
    </div>

    <div v-else>
      <v-skeleton-loader
        v-for="i in 3"
        :key="i"
        type="list-item-avatar"
      ></v-skeleton-loader>
    </div>

  </v-list>
</template>

<script>
export default {
  name: 'UsersOnline',
  computed: {
    online() {
      return this.$store.getters['chat/online']
    },
    onlineResolved() {
      return this.$store.getters['chat/onlineResolved']
    },
    userMap() {
      return this.$store.getters['chat/onlineUserMap']
    }
  },
  data() {
    return {
      intervalId: null
    }
  },
  props: {
    syncInterval: {
      default: 5000,
      type: Number
    }
  },
  mounted() {
    this.$store.dispatch('chat/getOnline')
    this.intervalId = setInterval(() => this.$store.dispatch('chat/getOnline'), this.syncInterval)
  },
  beforeDestroy() {
    if (!this.intervalId) {
      return
    }
    clearInterval(this.intervalId)
  }
}
</script>

<style scoped>

</style>
