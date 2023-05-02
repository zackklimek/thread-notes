<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <div id="navbar">
    <RouterLink to="/"><a class="link">Compose Thread</a></RouterLink>
    <RouterLink to="/notes"><a class="link">View Notes</a></RouterLink>
    <RouterLink to="/"><a class="link">Mapping?</a></RouterLink>
  </div>
  <div class="fixed">
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

#navbar {
  padding-bottom: 1.66em;
}

.fade {
  transition: opacity 0.5s ease;
}
</style>
