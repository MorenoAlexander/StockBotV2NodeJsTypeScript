<template>
  <Layout>
    <h1>About us</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error doloremque omnis animi, eligendi magni a voluptatum, vitae, consequuntur rerum illum odit fugit assumenda rem dolores inventore iste reprehenderit maxime! Iusto.</p>
    <p>
      <v-text-field
        v-model="generatedId"
        hide-details
        label="Generated ID"
      dense
      />
      <v-btn @click="getNewId()">Get new ID</v-btn>
    </p>
  </Layout>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      generatedId: 'No ID'
    }
    
  },
  metaInfo: {
    title: 'About us'
  },
  mounted() {
    axios.get('/test').then((data) => {
      this.$data.generatedId = data.data;
    })

  },
  methods: {
    async getNewId() {

      this.generatedId = (await axios.get('https://oneparish-dev3-1222.nodechef.com/test')).data

    }
  }
}
</script>
