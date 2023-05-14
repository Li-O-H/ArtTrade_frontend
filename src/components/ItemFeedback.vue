<template>
  <div id="ItemFeedback">
    <h4 v-if="selectedUser === undefined">Отзывы на предмет:</h4>
    <h4 v-else>Отзывы пользователя {{ selectedUser.name }} на предметы</h4>
    <b-button v-if="curItem !== undefined && this.user.id !== curItem.user.id && !this.isAddFeedback"
              v-on:click="this.selectAddFeedback">Добавить отзыв
    </b-button>
    <div v-if="isAddFeedback">
      <b-form-select v-model="ratingSelected" :options="feedbacksRating"></b-form-select>
      <b-form-input v-model="feedbackText" placeholder="Отзыв"></b-form-input>
      <b-button v-on:click="this.addFeedback">Отправить</b-button>
    </div>
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
    user: undefined,
    curItem: undefined
  },
  data() {
    return {
      isAddFeedback: false,
      selectedUser: undefined,
      selectedUserId: undefined,
      feedbackText: undefined,
      ratingSelected: null,
      feedbacksRating: [
        {value: 1, text: 1},
        {value: 2, text: 2},
        {value: 3, text: 3},
        {value: 4, text: 4},
        {value: 5, text: 5}
      ]
    }
  },
  components: {
    User
  },
  methods: {
    selectAddFeedback: function () {
      this.isAddFeedback = true
    },
    addFeedback: function () {
      if (this.feedbackText !== undefined && this.ratingSelected !== undefined) {
        Utils.postItemFeedback(this)
      }
    },
    deleteItemFeedback: function (id) {
      Utils.deleteItemFeedback(this, id)
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