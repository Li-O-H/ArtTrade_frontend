import Vue from 'vue'
import Router from 'vue-router'
import App from './App.vue'

import {BootstrapVue} from 'bootstrap-vue'
import * as path from "path";
import 'bootstrap/dist/css/bootstrap.css'
import Item from "./components/Item";
import User from "./components/User";
import ItemFeedback from "./components/ItemFeedback";
import ItemBid from "./components/ItemBid";
import Order from "./components/Order";
import OrderFeedback from "./components/OrderFeedback";
import OrderBid from "./components/OrderBid";

const routes = [
    {path: '/user', component: User},
    {
        path: '/item', component: Item,
        children: [
            {
                path: ':id',
                component: Item, props: {id: path.id},
            }
        ]
    },
    {path: '/itemFeedback', component: ItemFeedback},
    {path: '/itemBid', component: ItemBid},
    {
        path: '/order', component: Order,
        children: [
            {
                path: ':id',
                component: Order, props: {id: path.id},
            }
        ]
    },
    {path: '/orderFeedback', component: OrderFeedback},
    {path: '/orderBid', component: OrderBid}
]

const router = new Router({routes: routes})
Vue.use(BootstrapVue)
Vue.use(Router)

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')

