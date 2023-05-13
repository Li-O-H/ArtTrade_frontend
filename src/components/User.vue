<template>
  <div id="User">
    <b-list-group v-if="isShortView">
          <b-link :href="'/user/?userId=' + this.selectedUser.id">{{ this.selectedUser.name }}</b-link>
          <b-link :href="'mailto: ' + this.selectedUser.email">{{ this.selectedUser.email }}</b-link>
    </b-list-group>
    <div v-else>
      <h3>Профиль</h3>
      <div class="content">
        <b-card>
          <div v-if="!isModifyUser">
            <b-card-img v-for="photo in savedPhotos" v-bind:key="photo.id" v-bind:src="'data:image/gif;base64,' + photo.photo"></b-card-img>
          </div>
          <b-list-group v-if="!isModifyUser">
            <b-list-group-item>Имя: {{selectedUser.name}}</b-list-group-item>
            <b-list-group-item>Почта: {{selectedUser.email}}</b-list-group-item>
            <b-list-group-item>Город: {{selectedUser.city}}</b-list-group-item>
            <b-list-group-item>{{ selectedUser.aboutCreator }}</b-list-group-item>
          </b-list-group>
          <div v-if="selectedUser.id === user.id">
            <div v-if="isModifyUser">
              <div v-for="photo in savedPhotos" v-bind:key="photo.id">
                <div v-if="!isPhotoForDeletion(photo.id)">
                  <b-card-img v-bind:src="'data:image/gif;base64,' + photo.photo"></b-card-img>
                  <br>
                  <b-button v-on:click="markPhotoForDeletion(photo.id)">Удалить</b-button>
                </div>
              </div>
              <UploadImages @changed="this.handleImages" uploadMsg="Добавьте изображения"/>
              <b-form-input v-model="modifyUserName"></b-form-input>
              <b-form-input v-model="modifyUserCity"></b-form-input>
              <br>
              <textarea v-model="modifyUserAboutCreator"></textarea>
              <br>
              <b-button v-on:click="this.modifyUser">Отправить</b-button>
            </div>
            <b-button v-if="!this.isModifyUser" v-on:click="this.selectModifyUser">Изменить профиль</b-button>
            <b-button v-on:click="this.deleteUser">Удалить профиль</b-button>
            <br>
            <b-button v-if="!this.isAddItem" v-on:click="this.selectAddItem">Добавить предмет</b-button>
            <b-button v-if="!this.isAddOrder" v-on:click="this.selectAddOrder">Добавить заказ</b-button>
            <div>
              <b-link :href="'/item?userId=' + selectedUser.id">Мои предметы</b-link>
              <br>
              <b-link :href="'/item?favoriteByUserId=' + selectedUser.id">Избранные предметы</b-link>
              <br>
              <b-link :href="'/itemFeedback?userId=' + selectedUser.id">Мои отзывы на предметы</b-link>
              <br>
              <b-link :href="'/itemBid?userId=' + selectedUser.id">Мои ставки на предметы</b-link>
              <br>
              <b-link :href="'/order?userId=' + selectedUser.id">Мои заказы</b-link>
              <br>
              <b-link :href="'/order?favoriteByUserId=' + selectedUser.id">Избранные заказы</b-link>
              <br>
              <b-link :href="'/orderFeedback?userId=' + selectedUser.id">Мои отзывы на заказы</b-link>
              <br>
              <b-link :href="'/orderBid?userId=' + selectedUser.id">Мои ставки на заказы</b-link>
              <br>
              <b-link :href="'/order?doneByUserId=' + selectedUser.id">Выполненные мной заказы</b-link>
            </div>
            <div v-if="this.isAddItem">
              <UploadImages @changed="this.handleImages" uploadMsg="Добавьте изображения"/>
              <b-form-input v-model="addItemTitle" placeholder="Название"></b-form-input>
              <b-form-select v-model="addItemCategory" :options="categories"></b-form-select>
              <br>
              <textarea v-model="addItemDescription" placeholder="Описание"></textarea>
              <br>
              <b-button v-on:click="this.addItem">Отправить</b-button>
            </div>
            <div v-if="this.isAddOrder">
              <UploadImages @changed="this.handleImages" uploadMsg="Добавьте изображения"/>
              <b-form-input v-model="addOrderTitle" placeholder="Название"></b-form-input>
              <b-form-select v-model="addOrderCategory" :options="categories"></b-form-select>
              <b-form-input v-model="addOrderDeadline" type="date"></b-form-input>
              <br>
              <textarea v-model="addOrderDescription" placeholder="Описание"></textarea>
              <br>
              <b-button v-on:click="this.addOrder">Отправить</b-button>
            </div>
          </div>
          <div v-else>
            <b-link :href="'/item?userId=' + selectedUser.id">Предметы</b-link>
            <br>
            <b-link :href="'/order?userId=' + selectedUser.id">Заказы</b-link>
            <br>
            <b-link :href="'/order?doneByUserId=' + selectedUser.id">Выполненные заказы</b-link>
          </div>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
import UploadImages from "vue-upload-drop-images"
import * as Utils from "../js/utils.js";

export default {
  name: "User",
  props: {
    user: undefined,
    isShortView: undefined,
    selectedUser: undefined
  },
  components: {
    UploadImages
  },
  data() {
    return {
      isAddItem: false,
      addItemTitle: undefined,
      addItemDescription: undefined,
      addItemCategory: undefined,
      isAddOrder: false,
      addOrderTitle: undefined,
      addOrderDescription: undefined,
      addOrderCategory: undefined,
      addOrderDeadline: undefined,
      selectedUserId: undefined,
      isModifyUser: false,
      modifyUserName: undefined,
      modifyUserCity: undefined,
      modifyUserAboutCreator: undefined,
      photosForDeletion: [],
      categories: [],
      photos: [],
      savedPhotos: []
    }
  },
  methods: {
    selectAddItem: function () {
      this.isAddItem = true
      Utils.getAllCategories(this)
    },
    selectAddOrder: function () {
      this.isAddOrder = true
      Utils.getAllCategories(this)
    },
    handleImages: async function (files) {
      this.photos = files
    },
    selectModifyUser: function () {
      this.modifyUserName = this.selectedUser.name
      this.modifyUserCity = this.selectedUser.city
      this.modifyUserAboutCreator = this.selectedUser.aboutCreator
      this.isModifyUser = true
    },
    modifyUser: function () {
      Utils.modifyUser(this)
      location.reload()
    },
    deleteUser: function () {
      Utils.deleteUser(this.selectedUser.id)
      location.reload()
    },
    isPhotoForDeletion: function (id) {
      return this.photosForDeletion.includes(id)
    },
    markPhotoForDeletion: function (id) {
      this.photosForDeletion.push(id)
    },
    addItem: async function () {
      if (this.addItemTitle !== undefined && this.addItemDescription !== undefined && this.addItemCategory !== undefined) {
        Utils.postItem(this)
        location.replace('/item?userId=' + this.selectedUser.id)
      } else {
        alert("Не все обязательные поля заполнены")
      }
    },
    addOrder: async function () {
      if (this.addOrderTitle !== undefined && this.addOrderDescription !== undefined && this.addOrderCategory !== undefined) {
        Utils.postOrder(this)
        location.replace('/order?userId=' + this.selectedUser.id)
      } else {
        alert("Не все обязательные поля заполнены")
      }
    }
  },
  created() {
    if (!this.isShortView && this.user === undefined) {
      Utils.getUserByToken(this)
    }
    if (this.selectedUser === undefined) {
      this.selectedUserId = this.$route.query.userId
      if (this.selectedUserId !== undefined) {
        Utils.getSelectedUser(this)
      }
    }
    Utils.getUserPhotosByUser(this, this.selectedUser.id)
  }
}
</script>

<style scoped>

</style>