<script setup lang="ts">
import { ref } from 'vue'

const msg = ref('Hello Arco Vue!')
</script>

<template>
  <div class="container">
    <h1>{{ msg }}</h1>
    <a-input
      v-model="msg"
      :style="{ width: '320px' }"
      placeholder="Please enter something"
      allow-clear
    />

    <a-divider />

    <a-space>
      <a-typography-text>Space:</a-typography-text>
      <a-button type="primary">Item1</a-button>
      <a-button type="primary">Item2</a-button>
      <a-switch default-checked />
    </a-space>
  </div>
</template>

<style>
.container {
  padding: 20px;
}
</style>
