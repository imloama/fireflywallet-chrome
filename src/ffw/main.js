//api接口界面采用popup的方式打开，接收不同的参数，打开不同的界面
// main
import Vue from 'vue'
//import Vuetify from 'vuetify'
// import 'babel-polyfill'
import App from './App'
import store from './store'
import { i18n }  from './locales/index'
require('./filters/index')
require('./directives/swiper')
require('./api/index')
import axios from 'axios'
require('./api/utils') 
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)

import MLayout from './components/MLayout.vue'
Vue.component('m-layout', MLayout)

import Toasted from 'vue-toasted';
Vue.use(Toasted,{ 
  theme: "primary", 
  position: "bottom-center", 
  duration : 3000
})

import '@/libs/pkgs/initVuetify'

Vue.config.productionTip = false

/* eslint-disable no-new */
export const app =new Vue({
  el: '#app',
  store,
  i18n,
  render: h => h(App),
})

