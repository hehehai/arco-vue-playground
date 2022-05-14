<script setup lang="ts">
import { ref } from 'vue'

const msg = ref('Hello World!')
</script>

<template>
  <h1>{{ msg }}</h1>
  <a-input v-model="msg" />

  <p>
    <a-button>Hello Arco Vue</a-button>
  </p>
</template>
