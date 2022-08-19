<script setup>
import dep1 from 'vue-dep-1';
import dep2 from 'vue-dep-2';

const message = "Hello World";
</script>

<template>
  <div id="app">
    {{ message }}
  </div>
</template>

<style>
#app {
  font-size: 18px;
  font-family: "Roboto", sans-serif;
  color: blue;
}
</style>
