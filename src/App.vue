<script setup lang="ts">
import Thread from './components/Thread.vue';
</script>

<template>
  <div class="fixed">
    <Thread />
    <h1>thread-notes</h1>
  </div>
</template>

<style scoped>
.fixed {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
