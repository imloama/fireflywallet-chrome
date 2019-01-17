import Vue from 'vue'
import Router from 'vue-router'
import FFWC from './FFWC.vue';

Vue.use(Router)
export default new Router({
    routes: [
      {
        path: '/',
        name: 'FFWC',
        component: FFWC
      }
    ]});
