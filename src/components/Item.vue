<template>
  <div id='Item'>
    <div v-if="id === undefined">
      <div class="content">
        <div v-if="selectedUser === undefined && favoriteByUserId === undefined">
          <h3>Поиск предметов</h3>
          <br>
          <b-form-input v-model="maxPrice" @ placeholder="Максимальная цена"></b-form-input>
          <b-form-input v-model="minPrice" @ placeholder="Минимальная цена"></b-form-input>
          <b-form-select v-model="searchItemsCategory" :options="categories"></b-form-select>
          <b-button v-on:click="searchItems">Искать</b-button>
        </div>
        <h3 v-if="selectedUser !== undefined">Предметы пользователя {{ selectedUser.name }}:</h3>
        <h3 v-if="favoriteByUserId !== undefined">Избранные предметы:</h3>
        <div class="column" v-for="item in items" v-bind:key="item.id">
          <b-card>
            <b-card-img v-if="item.photos.length !== 0"
                        v-bind:src="'data:image/gif;base64,' + item.photos[0].photo"></b-card-img>
            <b-list-group>
              <b-list-group-item>{{ item.title }}</b-list-group-item>
              <b-list-group-item>Категория: {{ item.category.name }}</b-list-group-item>
              <b-list-group-item>{{ countPriceOfItem(item) === null ? "?" : countPriceOfItem(item) }} ₽
              </b-list-group-item>
            </b-list-group>
            <b-button v-on:click="viewItem(item)">Обзор</b-button>
          </b-card>
        </div>
      </div>
    </div>
    <div v-else>
      <h3>Предмет:</h3>
      <div class="content">
        <b-card>
          <b-button v-on:click="closeItem">Назад к предметам</b-button>
          <div v-if="!this.isModifyItem">
            <b-card-img v-for="photo in curItem.photos" v-bind:key="photo.id"
                        v-bind:src="'data:image/gif;base64,' + photo.photo"></b-card-img>
          </div>
          <b-list-group v-if="!this.isModifyItem">
            <b-list-group-item>{{ curItem.title }}</b-list-group-item>
            <b-list-group-item>Категория: {{ curItem.category.name }}</b-list-group-item>
            <b-list-group-item>{{ countPriceOfItem(curItem) === null ? "?" : countPriceOfItem(curItem) }} ₽
            </b-list-group-item>
            <b-list-group-item>{{ curItem.description }}</b-list-group-item>
            <b-list-group-item>{{
                curItem.status === "ACTIVE" ? "Объявление активно" : curItem.status === "HIDDEN" ? "Объявление скрыто" : "Объявление закрыто"
              }}
            </b-list-group-item>
            <User :is-short-view=true :selected-user="curItem.user"></User>
          </b-list-group>
          <div v-else>
            <div v-for="photo in curItem.photos" v-bind:key="photo.id">
              <div v-if="!isPhotoForDeletion(photo.id)">
                <b-card-img v-bind:src="'data:image/gif;base64,' + photo.photo"></b-card-img>
                <br>
                <b-button v-on:click="markPhotoForDeletion(photo.id)">Удалить</b-button>
              </div>
            </div>
            <UploadImages @changed="this.handleImages" uploadMsg="Добавьте изображения"/>
            <b-form-input v-model="modifyItemTitle"></b-form-input>
            <b-form-select v-model="modifyItemCategory" :options="categories"></b-form-select>
            <br>
            <textarea v-model="modifyItemDescription"></textarea>
            <br>
            <b-button v-on:click="this.modifyItem">Отправить</b-button>
          </div>
          <div v-if="curItem.user.id === this.user.id">
            <b-button v-if="curItem.status !== 'COMPLETED'" v-on:click="this.deleteItem">Удалить объявление</b-button>
            <b-button v-if="curItem.status === 'HIDDEN'" v-on:click="this.activateItem">Активировать объявление
            </b-button>
            <b-button v-if="curItem.status === 'ACTIVE'" v-on:click="this.hideItem">Скрыть объявление</b-button>
            <b-button v-if="curItem.status !== 'COMPLETED'" v-on:click="this.completeItem">Закрыть объявление</b-button>
            <b-button v-if="!this.isModifyItem && curItem.status !== 'COMPLETED'" v-on:click="this.selectModifyItem">
              Изменить предмет
            </b-button>
          </div>
          <div v-if="this.user.id !== curItem.user.id">
            <b-button v-if="!this.isInFavorite()" v-on:click="this.addToFavorite">В избранное</b-button>
            <b-button v-if="this.isInFavorite()" v-on:click="this.removeFromFavorite">Убрать из избранного</b-button>
          </div>
          <ItemBid :bids="curItem.bids" :user="this.user" :cur-item="curItem"></ItemBid>
          <ItemFeedback :feedbacks=curItem.feedbacks :user=this.user :cur-item="curItem"></ItemFeedback>
          <br>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
import * as Utils from '../js/utils.js'
import ItemFeedback from "./ItemFeedback";
import ItemBid from "./ItemBid";
import UploadImages from "vue-upload-drop-images"
import User from './User.vue'

export default {
  name: "Item",
  components: {
    ItemFeedback,
    ItemBid,
    User,
    UploadImages
  },
  data() {
    return {
      id: undefined,
      maxPrice: undefined,
      minPrice: undefined,
      searchItemsCategory: undefined,
      city: undefined,
      items: [],
      curItem: undefined,
      login: undefined,
      user: undefined,
      isModifyItem: false,
      modifyItemTitle: undefined,
      modifyItemDescription: undefined,
      modifyItemCategory: undefined,
      isAddItem: false,
      selectedUserId: undefined,
      selectedUser: undefined,
      favoriteByUserId: undefined,
      locationBeforeView: undefined,
      categories: [],
      photos: [],
      photosForDeletion: []
    }
  },
  methods: {
    viewItem: function (item) {
      this.id = item.id
      this.curItem = item
      this.locationBeforeView = location.hash
      window.location.replace("#/item/" + item.id)
    },
    searchItems: function () {
      Utils.getItems(this, undefined)
    },
    closeItem: function () {
      this.id = undefined
      window.location.replace(this.locationBeforeView)
      this.locationBeforeView = undefined
    },
    selectModifyItem: function () {
      this.modifyItemTitle = this.curItem.title
      this.modifyItemDescription = this.curItem.description
      this.modifyItemCategory = this.curItem.category.id
      this.isModifyItem = true
    },
    modifyItem: function () {
      Utils.modifyItem(this)
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
    deleteItem: function () {
      Utils.deleteItem(this)
      this.closeItem()
    },
    activateItem: function () {
      Utils.activateItem(this)
    },
    hideItem: function () {
      Utils.hideItem(this)
    },
    completeItem: function () {
      Utils.completeItem(this)
    },
    countPriceOfItem: function (item) {
      let bids = item.bids
      if (bids.length === 0) {
        return null
      }
      bids.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      return bids[0].price
    },
    addToFavorite: function () {
      Utils.addItemToFavorite(this)
    },
    removeFromFavorite: function () {
      Utils.removeItemFromFavorite(this)
    },
    isInFavorite: function () {
      for (const user of this.curItem.favoriteOf) {
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
      Utils.getItems(this, this.id)
    } else {
      this.user = undefined
    }
    Utils.getAllCategories(this)
  },
}
</script>