<script setup lang="ts">
import { ref, Ref } from "vue";

const items = ref(['']);
const editing: Ref<boolean> = ref(false);


function toggleEdit(i: number) {
    if (editing.value === true) {
        const newVal: string = document.getElementById(i.toString())!.innerText
        items.value[i] = newVal;
    }
    editing.value = !editing.value;
}

function enterEvent(i: number) {
    editing.value = false;
    const newVal: string = document.getElementById(i.toString())!.innerText;
    items.value.push(newVal);
}

</script>

<template>
    <div id="box" v-for="(i, index) in items">
        <div class="pt"></div>
        <p :id="index.toString()" class="block" :contenteditable="editing || items.length - 1 == index"
            @keyup.enter="enterEvent(index)">
            {{ i }}
        </p>
        <button v-if="!editing && index < items.length - 1" class="boxBtn" @click="toggleEdit(index)">Edit</button>
        <button v-if="editing && index < items.length - 1" class="boxBtn" @click="toggleEdit(index)">Save</button>
        <span class="right" id="position">
            <span id="position"> {{ index + 1 }} / {{ items.length }}</span>
        </span>
    </div>
    <button v-if="items.length > 1">Publish</button>
</template>

<style scoped>
p {
    padding-top: 6.33px;
    min-height: 6.33vh;
}

.boxBtn {
    margin-right: 50%;
    margin-bottom: 0.33em;
}

.pt {
    padding-top: .33em;
}

#box {
    outline: solid 1px grey;
    border-radius: .33em;
    min-height: 5vh;
    word-wrap: break-word;
    min-width: 40vw;
    max-width: 40vw;
    padding-right: .66em;
    padding-left: .66em;
    padding-bottom: .33em;
    padding-top: 0px;
    background-color: rgb(229, 236, 250);
    margin: 1.66em;
}

#position {
    padding: 0;
    margin: 0;
    font-size: 10px;
}
</style>
