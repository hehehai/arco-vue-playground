<script lang="ts">
import { defineComponent } from 'vue'
import App from './App.vue'
import { arcoInstall } from './arco-install.js'

export default defineComponent({
  components: {
    App
  },
  setup() {
    arcoInstall()
  }
})
</script>

<template>
  <App />
</template>
