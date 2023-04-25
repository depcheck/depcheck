<script setup lang="ts">
import dep1 from 'vue-ts-dep-1';

type Message = string | string[];

const message: Message = 'Hello World';
</script>

<template>
  <div id="app">
    {{ message }}
  </div>
</template>

<style>
#app {
  font-size: 18px;
  font-family: 'Roboto', sans-serif;
  color: blue;
}
</style>
