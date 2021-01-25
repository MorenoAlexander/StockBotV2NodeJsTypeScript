<template>
  <Layout>
    <h1>Hello, world!</h1>
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
        <v-form>
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
    };
  },
  metaInfo: {
    title: "Hello, world!",
  },
};
</script>

<style>
.home-links a {
  margin-right: 1rem;
}
</style>
