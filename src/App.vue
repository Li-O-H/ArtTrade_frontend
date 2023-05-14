<script src="https://unpkg.com/vue-router@3.0.1/dist/vue-router.js"></script>

<template>
  <div id="App">
    <div v-if="this.user !== undefined">
      <b-navbar fixed="top" type="dark">
        <b-navbar-brand href="#/">AtrTrade</b-navbar-brand>
        <b-navbar-nav>
          <b-nav-item active href="#/item">Предметы</b-nav-item>
          <b-nav-item active href="#/order">Заказы</b-nav-item>
        </b-navbar-nav>
        <b-button v-on:click="this.signout">Выйти</b-button>
      </b-navbar>
      <router-view></router-view>
      <User v-if="$route.path === '/'" :selected-user=this.user></User>
    </div>
    <div v-else id="auth">
      <div v-if="isSelect">
        <b-button v-on:click="this.selectSignin">Вход</b-button>
        <br>
        <b-button v-on:click="this.selectSignup">Регистрация</b-button>
      </div>
      <div v-if="isSignin">
        <input v-model="email" placeholder="E-mail">
        <br>
        <input type="password" v-model="password" placeholder="Пароль">
        <br>
        <b-button v-on:click="this.signin">Авторизоваться</b-button>
      </div>
      <div v-if="isSignup">
        <span>Введите данные</span>
        <br>
        <input v-model="email" placeholder="E-mail">
        <br>
        <input type="password" v-model="password" placeholder="Пароль">
        <br>
        <input type="password" v-model="matchingPassword" placeholder="Повторите пароль">
        <br>
        <input v-model="userName" placeholder="Имя">
        <br>
        <input v-model="city" placeholder="Город">
        <br>
        <textarea v-model="aboutCreator" placeholder="О себе (для авторов)"></textarea>
        <br>
        <b-button v-on:click="this.signup">Отправить</b-button>
        <br>
      </div>
    </div>
  </div>
</template>

<script>
import User from './components/User.vue'
import * as Utils from './js/utils.js'

export default {
  name: 'App',
  data() {
    return {
      user: undefined,
      isSelect: true,
      isSignin: false,
      isSignup: false,
      password: undefined,
      matchingPassword: undefined,
      city: undefined,
      email: undefined,
      aboutCreator: undefined,
      userName: undefined,
    }
  },
  components: {
    User
  },
  methods: {
    selectSignin: function () {
      this.isSelect = false;
      this.isSignin = true;
    },
    signin: function () {
      Utils.signin(this)
    },
    selectSignup: function () {
      this.isSelect = false;
      this.isSignup = true;
    },
    signup: async function () {
      if (this.password !== undefined && this.matchingPassword !== undefined && this.city !== undefined &&
          this.email !== undefined && this.userName !== undefined) {
        if (this.matchingPassword !== this.password) {
          alert("Пароли не совпадают")
          return
        }
        Utils.signup(this)
      } else {
        alert("Не все обязательные поля заполнены")
      }
    },
    signout: async function () {
      localStorage.removeItem('token');
      window.location.replace("/")
    },
  },
  created() {
    if (localStorage.getItem("token") !== null) {
      Utils.getUserByToken(this)
    } else {
      this.isSelect = true;
    }
  }
}
</script>

<style>

html, body {
  height: 100%;
  background-color: bisque;
}

#App {
  height: 100%;
  font-family: "Century Gothic", serif;
  text-align: center;
  padding-top: 60px;
  background-color: bisque;
}

.navbar {
  background-color: lightseagreen;
  height: 60px;
}

.content {
  padding-left: 2%;
  padding-right: 2%;
  padding-bottom: 2%;
}

.column {
  width: 33%;
  display: inline-block;
}

.card-body {
  padding: 5px;
  background-color: azure;
}

#auth {
  margin-top: 10%;
}

.btn {
  width: 140px;
  margin-top: 10px;
}

.form-control {
  margin-bottom: 10px;
}

input {
  width: 100%;
}

select {
  width: 100%;
}

.card-img {
  max-width: 400px;
  max-height: 400px;
}

@media (max-width: 1000px) {
  .content {
    margin: 0 0 0 0;
    width: 100%;
  }
}
</style>
