<script setup lang="ts">

import { ref } from "vue";

const notes = ref(['']);

</script>

<template>
    <p>Note Grid</p>
    <div id="box" v-for="(i, index) in notes">
        <div class="pt"></div>
        <p :id="index.toString()" class="block">
            {{ i }}
        </p>
    </div>
</template>

<style scoped></style>
