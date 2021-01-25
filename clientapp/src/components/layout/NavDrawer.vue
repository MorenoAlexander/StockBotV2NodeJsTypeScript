<script>
import { TOP_NAV, NAV } from "../../constants/nav";
import NavDrawerListItem from "./NavDrawerListItem.vue";


export default {
  components: {
    NavDrawerListItem,
  },

  data() {
    return {
      navTopItems: TOP_NAV,
      navItems: [...NAV].sort((a, b) => (a.name > b.name ? 1 : -1)),
    }
  },

  computed: {
      navDrawer: {
          get(){
              
              return this.$store.state.ui.navDrawer;
          },
          set(drawer) {
              this.$store.dispatch('ui/setNavDrawer', drawer)
          }
      }
  }
}
</script>

<template>
  <v-navigation-drawer v-model="navDrawer" app clipped width="350">
    <v-list class="py-0" dense>
      <NavDrawerListItem
        v-for="item in navTopItems"
        :key="item.name"
        :name="item.name"
        :route="item.route"
        :icon="item.icon"
      />

      <v-divider />

      <NavDrawerListItem
        v-for="item in navItems"
        :key="item.name"
        :name="item.name"
        :route="item.route"
        :icon="item.icon"
      />
    </v-list>
  </v-navigation-drawer>
</template>