<script>

export default {
  methods: {
    toggleNavDrawer() {
      this.$store.dispatch('ui/toggleNavDrawer')
    },
  },
}
</script>

<template>
  <v-app-bar app clipped-left dark color="primary">
    <v-app-bar-nav-icon @click="toggleNavDrawer" />

    <v-icon class="mx-2">
      build
    </v-icon>

    <v-toolbar-title>
      Static site
    </v-toolbar-title>

    <v-spacer />

    <v-spacer />
  </v-app-bar>
</template>
