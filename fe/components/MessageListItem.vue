<template>
  <div>
    <v-list-item>
      <v-list-item-avatar>
        <v-img :src="user.avatar"></v-img>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title>
          {{user.addressCutted}} <span class="created grey--text">{{item.tsCreated | formatDate}}</span>
        </v-list-item-title>
        <v-list-item-subtitle v-html="item.text" class="text-wrap"></v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-divider inset></v-divider>
  </div>
</template>

<script>
export default {
  name: 'MessageListItem',
  computed: {
    user () {
      return this.userMap[this.item.idAuthor]
    }
  },
  props: {
    item: {
      required: true,
      type: Object
    },
    userMap: {
      required: true,
      type: Object
    }
  }
}
</script>

<style scoped>
.created {
  font-size: 12px;
}
</style>
