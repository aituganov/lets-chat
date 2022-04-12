<template>
  <v-snackbar
    v-if="snackbar.show"
    absolute
    tile
    color="red accent-2"
    :timeout="5000"
    :value="true"
    @input="hide"
  >
    {{ snackbar.message }}

    <template v-slot:action="{ attrs }">
      <v-btn
        v-if="snackbar.link"
        text
        v-bind="attrs"
        @click="openLink"
      >
        {{ snackbar.linkTitle || 'Open' }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: 'AppError',
  computed: {
    error() {
      return this.$store.getters['app/error']
    }
  },
  data() {
    return {
      snackbar: {
        link: null,
        linkTitle: null,
        message: null,
        show: false
      }
    }
  },
  methods: {
    hide() {
      this.snackbar.show = false
    },
    openLink() {
      if (!this.snackbar.link) {
        return
      }
      window.open(this.snackbar.link)
    }
  },
  watch: {
    error(newVal) {
      if (!newVal || newVal.silent) {
        return
      }
      this.snackbar.link = newVal.link
      this.snackbar.linkTitle = newVal.linkTitle
      this.snackbar.message = newVal.message
      this.snackbar.show = true
    }
  }
}
</script>

<style scoped>

</style>
