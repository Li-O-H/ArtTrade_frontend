<template>
  <div id='Order'>
    <div v-if="id === undefined">
      <div class="content">
        <div v-if="selectedUser === undefined && favoriteByUserId === undefined">
          <h3>Поиск заказов</h3>
          <br>
          <b-form-input v-model="maxPrice" @ placeholder="Максимальная цена"></b-form-input>
          <b-form-input v-model="minPrice" @ placeholder="Минимальная цена"></b-form-input>
          <b-form-select v-model="searchOrdersCategory" :options="categories"></b-form-select>
          <b-button v-on:click="searchOrders">Искать</b-button>
        </div>
        <h3 v-if="selectedUser !== undefined">Заказы пользователя {{ selectedUser.name }}:</h3>
        <h3 v-if="favoriteByUserId !== undefined">Избранные заказы:</h3>
        <div class="column" v-for="order in orders" v-bind:key="order.id">
          <b-card>
            <b-card-img v-if="order.photos.length !== 0"
                        v-bind:src="'data:image/gif;base64,' + order.photos[0].photo"></b-card-img>
            <b-list-group>
              <b-list-group-item>{{ order.title }}</b-list-group-item>
              <b-list-group-item>Категория: {{ order.category.name }}</b-list-group-item>
              <b-list-group-item>{{ countPriceOfOrder(order) === null ? "?" : countPriceOfOrder(order) }} ₽
              </b-list-group-item>
            </b-list-group>
            <b-button v-on:click="viewOrder(order.id)">Обзор</b-button>
          </b-card>
        </div>
      </div>
    </div>
    <div v-else>
      <h3>Заказ:</h3>
      <div class="content">
        <b-card>
          <div v-if="!this.isModifyOrder">
            <b-card-img v-for="photo in curOrder.photos" v-bind:key="photo.id"
                        v-bind:src="'data:image/gif;base64,' + photo.photo"></b-card-img>
          </div>
          <b-list-group v-if="!this.isModifyOrder">
            <b-list-group-item>{{ curOrder.title }}</b-list-group-item>
            <b-list-group-item>Категория: {{ curOrder.category.name }}</b-list-group-item>
            <b-list-group-item>{{ countPriceOfOrder(curOrder) === null ? "?" : countPriceOfOrder(curOrder) }} ₽
            </b-list-group-item>
            <b-list-group-item>Дедлайн: {{ curOrder.deadline !== null ? new Date(curOrder.deadline).toLocaleDateString() : '-' }}</b-list-group-item>
            <b-list-group-item>{{ curOrder.description }}</b-list-group-item>
            <b-list-group-item>{{
                curOrder.status === "ACTIVE" ? "Объявление активно" : curOrder.status === "HIDDEN" ? "Объявление скрыто" : "Объявление закрыто"
              }}
            </b-list-group-item>
            <User :is-short-view=true :selected-user="curOrder.user"></User>
            <div v-if="curOrder.doneBy !== null">
              <h5>Выполнил:</h5>
              <User :is-short-view=true :selected-user="curOrder.doneBy"></User>
            </div>
          </b-list-group>
          <div v-else>
            <div v-for="photo in curOrder.photos" v-bind:key="photo.id">
              <div v-if="!isPhotoForDeletion(photo.id)">
                <b-card-img v-bind:src="'data:image/gif;base64,' + photo.photo"></b-card-img>
                <br>
                <b-button v-on:click="markPhotoForDeletion(photo.id)">Удалить</b-button>
              </div>
            </div>
            <UploadImages @changed="this.handleImages" uploadMsg="Добавьте изображения"/>
            <b-form-input v-model="modifyOrderTitle"></b-form-input>
            <b-form-select v-model="modifyOrderCategory" :options="categories"></b-form-select>
            <b-form-input v-model="modifyOrderDeadline" type="date"></b-form-input>
            <br>
            <textarea v-model="modifyOrderDescription"></textarea>
            <br>
            <b-button v-on:click="this.modifyOrder">Отправить</b-button>
          </div>
          <div v-if="curOrder.user.id === this.user.id">
            <b-button v-if="curOrder.status !== 'COMPLETED'" v-on:click="this.deleteOrder">Удалить объявление</b-button>
            <b-button v-if="curOrder.status === 'HIDDEN'" v-on:click="this.activateOrder">Активировать объявление
            </b-button>
            <b-button v-if="curOrder.status === 'ACTIVE'" v-on:click="this.hideOrder">Скрыть объявление</b-button>
            <b-button v-if="curOrder.status !== 'COMPLETED'" v-on:click="this.selectCompleteOrder">Закрыть объявление</b-button>
            <b-button v-if="!this.isModifyOrder && curOrder.status !== 'COMPLETED'" v-on:click="this.selectModifyOrder">
              Изменить заказ
            </b-button>
          </div>
          <div v-if="isCompleteOrder">
            <b-form-input v-model="completeOrderEmail" placeholder="Email исполнителя"></b-form-input>
            <b-button v-on:click="this.completeOrder">Отправить</b-button>
          </div>
          <b-button v-if="curOrder.status !== 'COMPLETED' && !this.isAddBid" v-on:click="this.selectAddBid">Предложить
            цену
          </b-button>
          <div v-if="isAddBid">
            <b-form-input v-model="bidSize" placeholder="Цена"></b-form-input>
            <b-button v-on:click="this.addBid">Отправить</b-button>
          </div>
          <div v-if="this.user.id !== curOrder.user.id">
            <b-button v-if="!this.isAddFeedback" v-on:click="this.selectAddFeedback">Добавить отзыв</b-button>
            <b-button v-if="!this.isInFavorite()" v-on:click="this.addToFavorite">В избранное</b-button>
            <b-button v-if="this.isInFavorite()" v-on:click="this.removeFromFavorite">Убрать из избранного</b-button>
          </div>
          <div v-if="isAddFeedback">
            <b-form-select v-model="ratingSelected" :options="feedbacksRating"></b-form-select>
            <b-form-input v-model="feedbackText" placeholder="Отзыв"></b-form-input>
            <b-button v-on:click="this.addFeedback">Отправить</b-button>
          </div>
          <OrderBid :bids="curOrder.bids" :user="this.user" :cur-order="curOrder"></OrderBid>
          <OrderFeedback :feedbacks=curOrder.feedbacks :user=this.user></OrderFeedback>
          <br>
          <b-button v-on:click="closeOrder">Назад к заказам</b-button>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
import * as Utils from '../js/utils.js'
import OrderFeedback from "./OrderFeedback";
import OrderBid from "./OrderBid";
import UploadImages from "vue-upload-drop-images"
import User from './User.vue'

export default {
  name: "Order",
  components: {
    OrderFeedback,
    OrderBid,
    User,
    UploadImages
  },
  props: {
    id: undefined
  },
  data() {
    return {
      maxPrice: undefined,
      minPrice: undefined,
      searchOrdersCategory: undefined,
      city: undefined,
      orders: [],
      curOrder: undefined,
      login: undefined,
      user: undefined,
      isAddFeedback: false,
      isAddBid: false,
      isModifyOrder: false,
      isCompleteOrder: false,
      modifyOrderTitle: undefined,
      modifyOrderDescription: undefined,
      modifyOrderCategory: undefined,
      modifyOrderDeadline: undefined,
      completeOrderEmail: undefined,
      feedbackText: undefined,
      ratingSelected: null,
      bidSize: undefined,
      isAddOrder: false,
      selectedUserId: undefined,
      selectedUser: undefined,
      favoriteByUserId: undefined,
      doneByUserId: undefined,
      categories: [],
      photos: [],
      photosForDeletion: [],
      feedbacksRating: [
        {value: 1, text: 1},
        {value: 2, text: 2},
        {value: 3, text: 3},
        {value: 4, text: 4},
        {value: 5, text: 5}
      ]
    }
  },
  methods: {
    viewOrder: function (id) {
      window.location.replace("/order/" + id)
    },
    searchOrders: function () {
      Utils.getOrders(this, undefined)
    },
    closeOrder: function () {
      window.location.replace("/order/")
    },
    selectModifyOrder: function () {
      this.modifyOrderTitle = this.curOrder.title
      this.modifyOrderDescription = this.curOrder.description
      this.modifyOrderCategory = this.curOrder.category.id
      const deadline = new Date(this.curOrder.deadline)
      const offset = deadline.getTimezoneOffset()
      this.modifyOrderDeadline = new Date(deadline.getTime() - (offset*60*1000)).toISOString().split('T')[0]
      this.isModifyOrder = true
    },
    selectCompleteOrder: function () {
      this.isCompleteOrder = true
    },
    modifyOrder: function () {
      Utils.modifyOrder(this)
      location.reload()
    },
    isPhotoForDeletion: function (id) {
      return this.photosForDeletion.includes(id)
    },
    markPhotoForDeletion: function (id) {
      this.photosForDeletion.push(id)
    },
    handleImages: async function (files) {
      this.photos = files
    },
    deleteOrder: function () {
      Utils.deleteOrder(this)
      window.history.back()
    },
    activateOrder: function () {
      Utils.activateOrder(this)
      location.reload()
    },
    hideOrder: function () {
      Utils.hideOrder(this)
      location.reload()
    },
    completeOrder: function () {
      Utils.completeOrder(this)
      location.reload()
    },
    countPriceOfOrder: function (order) {
      let bids = order.bids
      if (bids.length === 0) {
        return null
      }
      bids.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      return bids[0].price
    },
    selectAddFeedback: function () {
      this.isAddFeedback = true
    },
    addFeedback: function () {
      if (this.feedbackText !== undefined && this.ratingSelected !== undefined) {
        Utils.postOrderFeedback(this)
        location.reload()
      }
    },
    selectAddBid: function () {
      this.isAddBid = true
    },
    addBid: function () {
      if (this.bidSize !== undefined && Number(this.bidSize)) {
        Utils.postOrderBid(this)
        location.reload()
      } else {
        alert("Некорректная цена!")
      }
    },
    addToFavorite: function () {
      Utils.addOrderToFavorite(this)
      location.reload()
    },
    removeFromFavorite: function () {
      Utils.removeOrderFromFavorite(this)
      location.reload()
    },
    isInFavorite: function () {
      for (const user of this.curOrder.favoriteOf) {
        if (user.id === this.user.id) {
          return true
        }
      }
      return false
    },
  },
  created() {
    if (localStorage.getItem("token") !== null) {
      Utils.getUserByToken(this)
      if (this.id === undefined && this.$route.params.id !== undefined) {
        this.id = Number(this.$route.params.id)
      }
      this.selectedUserId = this.$route.query.userId
      if (this.selectedUserId !== undefined) {
        Utils.getSelectedUser(this)
      }
      this.favoriteByUserId = this.$route.query.favoriteByUserId
      this.doneByUserId = this.$route.query.doneByUserId
      Utils.getOrders(this, this.id)
    } else {
      this.user = undefined
    }
    Utils.getAllCategories(this)
  },
}
</script>