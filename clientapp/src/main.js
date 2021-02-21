// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

require('~/tailwindmain.css')

import Vuetify from 'vuetify/lib/framework'
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import DefaultLayout from '~/layouts/Default.vue'

import store from './store/store.js'

export default function(Vue, { router, head, isClient, appOptions }) {
  head.link.push({
    rel: 'stylesheet',
    href:
      'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css'
  })

  head.link.push({
    rel: 'stylesheet',
    href:
      'https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900'
  })

  const opts = {}

  Vue.use(Vuetify)
  appOptions.store = store
  appOptions.vuetify = new Vuetify(opts)
  // Set default layout as a global component
  Vue.component('Layout', DefaultLayout)
}
