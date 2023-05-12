<script setup lang="ts">
import { ref, Ref } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../../firebaseConfig';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const xList: Ref<number[]> = ref([])
const yList: Ref<number[]> = ref([])

let ul = ['A', 'B', 'C']

let notes = ['Render a list of all notes that sorts based on the selected notes.', 'Allow the user to drag and drop notes from the sidebar to a canvas where they can position notes as they would like.The idea is to allow the user to save an interactive content map.', 'We want the cards to scale based on zoom.', 'Render a list of all notes that sorts based on the selected notes.', 'Allow the user to drag and drop notes from the sidebar to a canvas where they can position notes as they would like.The idea is to allow the user to save an interactive content map.', 'We want the cards to scale based on zoom.', 'Render a list of all notes that sorts based on the selected notes.', 'Allow the user to drag and drop notes from the sidebar to a canvas where they can position notes as they would like.The idea is to allow the user to save an interactive content map.', 'We want the cards to scale based on zoom.']
let currentItem: string | undefined = undefined;

function mousedownHandler(i: number) {
    if (currentItem === undefined) {
        if (document.getElementById("item")) {
            currentItem = 'item' + i;
        }
    }
    else {
        currentItem = undefined;
    }
}

function mousemoveHandler(e: MouseEvent) {
    if (currentItem !== undefined) {
        if (e.offsetY > 3 && e.offsetX > 3) {
            yList.value[parseInt(currentItem.substring(4, 5))] = e.offsetY;
            xList.value[parseInt(currentItem.substring(4, 5))] = e.offsetX;
        }
    }
}

onAuthStateChanged(auth, () => {
    for (let i = 0; i < ul.length; ++i) {
        xList.value.push(100 * i + 205);
        yList.value.push(100 * i + 205);
    }
})

</script>

<template>
    <span class="space">
        <div class="map" @mousemove="mousemoveHandler">
            <div v-for="(li, i) in ul" id="item" @mousedown="mousedownHandler(i)"
                :style="{ top: yList[i] + 'px', left: xList[i] + 'px' }">
                {{ li }}
            </div>
        </div>
        <div class="col">
            <h3>Notes</h3>
            <div class="colDiv">
                <div v-for="n in notes" class="card">
                    {{ n }}
                </div>
            </div>
        </div>
    </span>
</template>

<style scoped>
.space {
    /* outline: solid 1px red; */
    width: 80vw;
    height: 75vh;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
}


.card {
    position: relative;
    min-height: 5vh;
    word-wrap: break-word;
    padding: 1em;
    background-color: aliceblue;
    color: black;
    margin: 1.33em;
    box-shadow: 0 1px 6px rgba(47, 72, 255, 0.719), 0 1px 4px rgba(47, 72, 255, 0.719);
    border-radius: 5px;
}

.card:hover {
    background-color: white;
    transform: scale(1.015);
}

.map {
    padding: 1em;
    width: 70%;
    height: 100%;
    background-color: aliceblue;
    border-radius: .3em;
    position: relative;
    overflow: hidden;
}

#item {
    width: 100px;
    height: 100px;
    background-color: blue;
    position: absolute;

}

.col {
    width: 20%;
    height: 100%;
}

.colDiv {
    overflow: scroll;
    height: 95%;
    padding: 1em;
}

h3 {
    margin-top: 0em;
    margin-bottom: 0.6em;
}
</style>
