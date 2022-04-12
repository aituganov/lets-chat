<template>
  <v-list-item>
    <v-list-item-avatar>
      <v-img :src="item.avatar"></v-img>
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title>
        {{item.addressCutted}}
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  name: 'UserPreview',
  props: {
    item: {
      required: true,
      type: Object
    }
  }
}
</script>

<style scoped>

</style>
