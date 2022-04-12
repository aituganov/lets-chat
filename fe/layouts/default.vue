<template>
  <v-app>
    <app-header></app-header>

    <v-main>
      <v-container fluid>
        <Nuxt />
      </v-container>
    </v-main>

    <app-error></app-error>

  </v-app>
</template>

<script>

export default {
  name: 'DefaultLayout',
  mounted() {
    this.$store.dispatch('users/initialize')
  }
}
</script>
