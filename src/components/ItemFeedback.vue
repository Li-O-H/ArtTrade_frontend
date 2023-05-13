<template>
  <div id="ItemFeedback">
    <h4 v-if="selectedUser === undefined">Отзывы на предмет:</h4>
    <h4 v-else>Отзывы пользователя {{ selectedUser.name }} на предметы</h4>
    <div v-for="feedback in feedbacks" v-bind:key="feedback.id">
      <b-list-group>
        <User :is-short-view=true :selected-user="feedback.user"></User>
        <b-list-group-item>Отзыв: {{ feedback.text }}</b-list-group-item>
        <b-list-group-item>Рейтинг: {{ feedback.rating }}</b-list-group-item>
        <b-button v-if="feedback.user.id === user.id" v-on:click="deleteItemFeedback(feedback.id)">Удалить</b-button>
      </b-list-group>
      <br>
    </div>
  </div>
</template>

<script>
import * as Utils from "../js/utils.js";
import User from "./User.vue"

export default {
  name: "ItemFeedback",
  props: {
    feedbacks: Array,
    user: undefined
  },
  data() {
    return {
      selectedUser: undefined,
      selectedUserId: undefined
    }
  },
  components: {
    User
  },
  methods: {
    deleteItemFeedback: function (id) {
      Utils.deleteItemFeedback(this, id)
      location.reload()
    },
  },
  created() {
    if (this.user === undefined) {
      Utils.getUserByToken(this)
    }
    this.selectedUserId = this.$route.query.userId
    if (this.selectedUserId !== undefined) {
      Utils.getSelectedUser(this)
      Utils.getItemFeedbacksByUser(this, this.selectedUserId)
    }
  }
}
</script>