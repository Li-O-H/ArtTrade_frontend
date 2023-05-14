<template>
  <div id="OrderBid">
    <h4 v-if="selectedUser === undefined">Ставки на заказ:</h4>
    <h4 v-else>Ставки пользователя {{ selectedUser.name }} на заказы</h4>
    <b-button v-if="curOrder !== undefined && curOrder.status !== 'COMPLETED' && !this.isAddBid" v-on:click="this.selectAddBid">Предложить цену</b-button>
    <div v-if="isAddBid">
      <b-form-input v-model="bidSize" placeholder="Цена"></b-form-input>
      <b-button v-on:click="this.addBid">Отправить</b-button>
    </div>
    <div v-for="bid in bids" v-bind:key="bid.id">
      <b-list-group v-if="selectedUserId === bid.user.id || user.id === bid.user.id || curOrder.user.id === user.id">
        <User :is-short-view=true :selected-user="bid.user"></User>
        <b-list-group-item>Размер: {{ bid.price }}</b-list-group-item>
        <b-list-group-item>Когда: {{ new Date(bid.created).toLocaleString() }}</b-list-group-item>
        <b-button v-if="bid.user.id === user.id" v-on:click="deleteOrderBid(bid.id)">Удалить</b-button>
      </b-list-group>
      <br>
    </div>
  </div>
</template>

<script>
import * as Utils from "../js/utils.js";
import User from "./User.vue"

export default {
  name: "OrderBid",
  props: {
    bids: Array,
    user: undefined,
    curOrder: undefined
  },
  data() {
    return {
      isAddBid: false,
      bidSize: undefined,
      selectedUser: undefined,
      selectedUserId: undefined
    }
  },
  components: {
    User
  },
  methods: {
    deleteOrderBid: function (id) {
      Utils.deleteOrderBid(this, id)
    },
    selectAddBid: function () {
      this.isAddBid = true
    },
    addBid: function () {
      if (this.bidSize !== undefined && Number(this.bidSize)) {
        Utils.postOrderBid(this)
      } else {
        alert("Некорректная цена!")
      }
    }
  },
  created() {
    if (this.user === undefined) {
      Utils.getUserByToken(this)
    }
    this.selectedUserId = this.$route.query.userId
    if (this.selectedUserId !== undefined) {
      Utils.getSelectedUser(this)
      Utils.getOrderBidsByUser(this, this.selectedUserId)
    }
  }
}
</script>