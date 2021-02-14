<template>
  <div id="app">
    {{ message }}
  </div>
</template>

<script>
import dep1 from 'vue-dep-1';
import dep2 from 'vue-dep-2';

export default {
  data() {
    return {
      message: "Hello World",
    };
  },
};
</script>

<style>
#app {
  font-size: 18px;
  font-family: "Roboto", sans-serif;
  color: blue;
}
</style>
