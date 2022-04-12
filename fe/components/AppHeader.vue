<template>
  <v-app-bar
    app
  >
    <v-toolbar-title>
      Let's Chat
    </v-toolbar-title>

    <v-spacer />

    <div v-if="isAuthorizedUser">
      <v-avatar>
        <img
          :src="userAvatar"
          alt="John"
        >
      </v-avatar>
      <v-menu
        bottom
        left
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-menu-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-subheader>{{userAddress}}</v-subheader>
          <v-divider></v-divider>

          <v-list-item @click="logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

  </v-app-bar>
</template>

<script>
export default {
  name: 'AppHeader',
  computed: {
    isUserResolved() {
      return this.$store.getters['users/isResolved']
    },
    isAuthorizedUser() {
      return this.isUserResolved && this.$store.getters['users/isAuthorized']
    },
    userAvatar() {
      return this.$store.getters['users/avatar']
    },
    userAddress() {
      return this.$store.getters['users/addressCutted']
    }
  },
  methods: {
    async login() {
      try {
        await this.$store.dispatch('users/login')
      } catch (err) {
        if (err.silent) {
          return
        }
        this.$store.commit('app/setError', err)
        this.fetchUserError = err
      }
    },
    async logout() {
      await this.$store.dispatch('users/logout')
    }
  }
}
</script>

<style scoped>

</style>
