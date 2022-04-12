<template>
  <div>
    <v-row>
      <v-col class="scrollable"
             ref="zone"
             :style="{ height: `calc(100vh - ${heightOffset}px)` }" @scroll.self="onScroll">

        <div v-if="!messagesResolved" class="text-center">
          <v-progress-circular color="primary"
                               indeterminate>
          </v-progress-circular>
        </div>

        <v-list>
          <message-list-item v-for="m of messages"
                             :id="m.id"
                             :item="m"
                             :key="m.id"
                             :user-map="messagesUserMap">
          </message-list-item>
        </v-list>
        <div ref="end"></div>
      </v-col>

      <v-col sm="3" class="scrollable" :style="{ height: `calc(100vh - ${heightOffset}px)` }">
        <users-online></users-online>
      </v-col>
    </v-row>
    <message-editor class="resizable"></message-editor>
  </div>
</template>

<script>
let resizeObserver

export default {
  name: 'MessageList',
  computed: {
    messages() {
      return this.$store.getters['messages/list']
    },
    messagesResolved() {
      return this.$store.getters['messages/listResolved']
    },
    messagesCount() {
      return this.messages.length
    },
    messagesUserMap() {
      return this.$store.getters['messages/userMap']
    },
    userAddress() {
      return this.$store.getters['users/address']
    }
  },
  data () {
    return {
      endPosition: null,
      heightOffset: 0,
      intervalId: null,
      lastMessageId: null,
      programmaticallyScroll: false
    }
  },
  methods: {
    async askMessagePortion() {
      await this.$store.dispatch('messages/askPortion')
    },
    async scrollContainerToBottom(force) {
      if (!this.$refs.end || (!force && this.endPosition && Math.abs(this.endPosition - this.$refs.end.getBoundingClientRect().y) > 100)) {
        return
      }
      setTimeout(async () => {
        this.programmaticallyScroll = true
        await this.$vuetify.goTo(this.$refs.end, {container: this.$refs.zone})
        this.endPosition = this.$refs.end.getBoundingClientRect().y
        this.programmaticallyScroll = false
      }, 0)
    },
    async onScroll(e) {
      if (this.programmaticallyScroll) {
        return
      }
      if (e.target.scrollTop === 0) {
        const firstId = this.messages[0] && this.messages[0].id
        await this.askMessagePortion()
        if (firstId) {
          await this.$vuetify.goTo(document.getElementById(firstId), {container: this.$refs.zone, duration: 0})
        }
      }
    }
  },
  props: {
    syncInterval: {
      default: 2000,
      type: Number
    }
  },
  watch: {
    messagesCount(newVal, oldVal) {
      if (newVal === oldVal) {
        return
      }
      const lastMessage = this.messages.lastItem || {}
      this.scrollContainerToBottom(this.lastMessageId !== lastMessage.id && lastMessage.idAuthor === this.userAddress)
      this.lastMessageId = lastMessage.id
    }
  },
  async mounted() {
    const elms = document.querySelectorAll('.resizable')
    resizeObserver = new ResizeObserver(() => {
      this.heightOffset = this.$vuetify.application.top
      for (const e of elms) {
        this.heightOffset += e.offsetHeight
      }
    })
    for (const e of elms) {
      resizeObserver.observe(e)
    }
    await this.askMessagePortion()
    this.intervalId = setInterval(() => this.$store.dispatch('messages/synchronize'), this.syncInterval)
  },
  beforeDestroy() {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }
}
</script>

<style scoped>
.scrollable {
  overflow-y: scroll;
}
</style>
