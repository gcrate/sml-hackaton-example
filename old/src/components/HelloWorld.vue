<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="format-detection" content="telephone=no">
<meta name="msapplication-tap-highlight" content="no">

<template>
  <ion-app>
    <ion-page class="show-page">
      <ion-header>
        <ion-toolbar>
          <ion-title>Ionic 4 + Vue Application </ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="content" padding>
          <ion-list>
            <ion-item v-for="item of items" v-bind:key="item.id">
              <ion-label full></ion-label>
            </ion-item>
          </ion-list>
          <ion-button @click="goToPage2" full>Go To Page II</ion-button>
      </ion-content>
    </ion-page>
  </ion-app>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      items: [{id: 0, name: 'Ahmed'}, {id: 1, name: 'Naima'}]
    }
  },
  methods: {
    goToPage2 () {
      this.$router.push('page2')
    }
  } 
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
