<template>
  <Layout>
    <span class="w-64 text-gray-500 mx-auto font-large">Hello, world!</span>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Pariatur
      excepturi labore tempore expedita, et iste tenetur suscipit explicabo!
      Dolores, aperiam non officia eos quod asperiores
    </p>

    <p class="home-links">
      <a href="https://gridsome.org/docs/" target="_blank" rel="noopener"
        >Gridsome Docs</a
      >
      <a
        href="https://github.com/gridsome/gridsome"
        target="_blank"
        rel="noopener"
        >GitHub</a
      >
    </p>

    <v-card>
      <v-card-text>
        <h2 class="mx-auto"> HELLO</h2>
        <v-form class="mx-auto">
          <v-text-field
            class="mt-4"
            label="Username"
            v-model="username"
            type="text"
            hint="Username"
            hide-details
            outlined
            filled
            dense
          />
          <v-spacer />

          <v-text-field
            class="mt-4"
            label="Password"
            v-model="password"
            type="password"
            hint="Password"
            hide-details
            
            outlined
            filled
            dense
          />
          <v-btn @click="onLogin()"> Login</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </Layout>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      password: ""
    }
  },
  metaInfo: {
    title: "Hello, world!",
  },
  methods: {
    onLogin() {
      //Do some login request!


    }
  }
}
</script>

<style>
.home-links a {
  margin-right: 1rem;
}
</style>
