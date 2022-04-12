<template>
  <v-footer
    app
    color="transparent"
    inset
  >
    <v-row>
      <v-col>
        <v-textarea
          v-model="message"
          auto-grow
          class="textarea"
          dense
          flat
          hide-details
          outlined
          placeholder="Type text here..."
          rounded
          rows="1"
          solo
          :disabled="sendProcess"
          @keydown.enter.exact.prevent
          @keyup.enter.exact="messageSend"
        ></v-textarea>
      </v-col>
      <v-col cols="auto" align-self="end">
        <v-progress-circular v-if="sendProcess"
                             color="primary"
                             indeterminate
                             size="36">
        </v-progress-circular>
        <v-btn
          v-else
          color="primary"
          icon
          :disabled="sendDisabled"
          @click="messageSend"
        >
          <v-icon>
            mdi-send
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script>
export default {
  name: 'MessageEditor',
  computed: {
    sendDisabled() {
      return !this.message || this.sendProcess
    }
  },
  data () {
    return {
      message: '',
      sendProcess: false
    }
  },
  methods: {
    async messageSend (event) {
      event.preventDefault()
      event.stopPropagation()
      if (this.sendDisabled) {
        return
      }
      this.sendProcess = true
      try {
        await this.$store.dispatch('messages/send', this.message)
        this.message = null
      } catch (err) {}
      this.sendProcess = false
    }
  }
}
</script>

<style scoped>
.textarea {
  max-height: 120px;
  overflow-y: auto;
}
</style>
