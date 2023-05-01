<script setup lang="ts">
import { RouterLink } from 'vue-router';
// import Thread from './components/Thread.vue';
</script>

<template>
  <span>
    <RouterLink to="/"><a class="link">Compose Thread</a></RouterLink>
    <RouterLink to="/notes"><a class="link">View Notes</a></RouterLink>
  </span>
  <div class="fixed">
    <!-- <Thread /> -->
    <router-view />
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

.fade {
  transition: opacity 0.5s ease;
}
</style>
