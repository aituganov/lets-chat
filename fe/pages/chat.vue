<template>
  <div>
    <message-list v-if="showChat"></message-list>

    <div v-else>
      Chat available for authorized users only
    </div>
  </div>
</template>

<script>
export default {
  name: 'chat',
  computed: {
    showChat() {
      return this.$store.getters['users/isAuthorized']
    }
  }
}
</script>

<style scoped>

</style>
