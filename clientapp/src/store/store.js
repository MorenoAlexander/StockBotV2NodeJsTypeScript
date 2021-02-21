import Vue from 'vue'
import Vuex from 'vuex'

//import store modules here
import * as ui from './ui'
import * as systemAccess from './system-access'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    ui,
    systemAccess
  }
})
