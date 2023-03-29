<template>
  <div id="app">
    {{ message('world') }}
  </div>
</template>

<script setup lang="ts">
import dep1 from 'vue-dep-1';
import dep2 from 'vue-dep-2';

const message = (name: any): String => {
  return `Hello ${name}`;
}
</script>

<style>
#app {
  font-size: 18px;
  font-family: "Roboto", sans-serif;
  color: blue;
}
</style>
