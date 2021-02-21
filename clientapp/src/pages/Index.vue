<template>

  <Layout>

    <!-- Learn how to use images here: https://gridsome.org/docs/images -->
   

    <h1>Login First</h1>

    <p>
      This is the Stockboard dashboard site. Used by only the most privileged users.
    </p>

    <LoginComponent/>

  </Layout>
</template>

<script>
import LoginComponent from '../components/LoginComponent.vue'
export default {
  components: {
    LoginComponent,
  },
  metaInfo: {
    title: 'Hello, world!'
  }
}
</script>

<style>
.home-links a {
  margin-right: 1rem;
}
</style>
