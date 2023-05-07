<script setup lang="ts">
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../../firebaseConfig';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

</script>

<template>
    <span class="space">
        <div class="map">
            <p>Allow the user to drag and drop notes from the sidebar to a canvas where they can position notes as they
                would like. The idea is to allow the user to save an interactive content map.</p>
            <p>We want the cards to scale based on zoom.</p>
        </div>
        <div class="col">
            <p>Render a list of all notes that sorts based on the selected notes.</p>
        </div>
    </span>
</template>

<style scoped>
.space {
    outline: solid 1px red;
    width: 80vw;
    height: 70vh;
    display: flex;
    justify-content: space-evenly;
}

.map {
    width: 70%;
    height: 100%;
    outline: solid 1px blue;
}

.col {
    width: 25%;
    height: 100%;
    outline: solid 1px blueviolet;
}
</style>
