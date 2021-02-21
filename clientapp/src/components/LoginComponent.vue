<template>
  <v-card>
    <v-card-title>LOGIN</v-card-title>
    <v-card-text>
      <v-form>
        <v-text-field v-model="payload.email" label="Email" />
        <v-text-field
          v-model="payload.password"
          label="Password"
          type="password"
        />
        <v-btn @click="Login()">LOGIN</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  data() {
    return {
      payload: {
        email: '',
        password: '',
      },
    }
  },
  methods: {
    Login() {
      this.$store.dispatch('systemAccess/loginUser', this.payload)
    },
  },
}
</script>

