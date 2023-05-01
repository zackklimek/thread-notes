<script setup lang="ts">
import { onMounted, ref, Ref, computed } from "vue";

const notes = ref(['']);
const reverseItems = computed(() => notes.value.reverse())
const editing: Ref<boolean> = ref(false);

function toggleEdit(i: number) {
    if (editing.value === true) {
        const newVal: string = document.getElementById(i.toString())!.innerText
        notes.value[i] = newVal;
    }
    editing.value = !editing.value;
}

function enterEvent() {
    editing.value = false;
    const id: string = (notes.value.length - 1).toString()
    const newVal: string = document.getElementById(id)!.innerText;
    // items.value.push(newVal);
    notes.value = [...notes.value, newVal] // Look into cost of spread operator
    // document.getElementById(id)!.innerText = "";
    console.log('new value', notes.value)
}

// const v = ref('v')

// onMounted(() => {
//     notes.value.reverse();
// })


</script>

<template>
    <div id="box" v-for="(i, index) in notes">
        <div class="pt"></div>
        <button v-if="!editing && index < notes.length - 1" class="boxBtn" @click="toggleEdit(index)">Edit</button>
        <button v-if="editing && index < notes.length - 1" class="boxBtn" @click="toggleEdit(index)">Save</button>
        <p :id="index.toString()" class="block" :contenteditable="editing || notes.length - 1 == index"
            @keyup.enter="enterEvent">
            {{ i }}
        </p>
        <span class="right" id="position">
            <span id="position"> {{ index + 1 }} / {{ notes.length }}</span>
        </span>
    </div>
    <button v-if="notes.length > 1">Publish</button>
</template>

<style scoped>
p {
    padding-top: 6.33px;
    min-height: 6.33vh;
}

.boxBtn {
    margin-left: 80%;
    margin-bottom: 0.33em;
}

.pt {
    padding-top: .33em;
}

#box {
    /* outline: solid 2px grey; */
    /* border-radius: .33em; */
    min-height: 5vh;
    word-wrap: break-word;
    min-width: 40vw;
    max-width: 40vw;
    padding-right: .66em;
    padding-left: .66em;
    padding-bottom: .33em;
    padding-top: 0px;
    background-color: rgb(229, 236, 250);
    color: black;
    margin: 1.66em;
    box-shadow: 2px 2px 6px rgba(47, 72, 255, 0.719), -2px -2px 6px rgba(47, 72, 255, 0.719),
        2px -2px 4px rgba(47, 72, 255, 0.719), -2px 2px 4px rgba(47, 72, 255, 0.719);

    /* filter: drop-shadow(5px 5px 5px rgba(0, 0, 0, 0.3)); */
    transition: 0.3s;
    border-radius: 5px;
    /* 5px rounded corners */
}

#position {
    padding: 0;
    margin: 0;
    font-size: 10px;
}
</style>
