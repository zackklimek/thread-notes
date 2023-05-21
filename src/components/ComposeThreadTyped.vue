<script setup lang="ts">
import { ref, Ref } from 'vue';
const notes: Ref<NoteInput[]> = ref([{
    note: "",
    title: "",
    tags: "",
    url: "",
    editing: true,
    imageBlob: undefined
}])
const inputText: Ref<string> = ref("");
const inputTags: Ref<string> = ref("");

type NoteInput = {
    note: string,
    title: string,
    tags: string,
    url: string,
    editing: boolean,
    imageBlob: Blob | undefined,
};

function add() {
    const pushNote: NoteInput = {
        note: inputText.value,
        title: "",
        tags: inputTags.value,
        url: "",
        editing: false,
        imageBlob: undefined,
    };
    notes.value.push(pushNote);
    inputText.value = "";
}
</script>
<template>
    <input v-model="inputText" />
    <label>Note</label>
    <input v-model="inputTags" />
    <label>Tags</label>
    <button @click="add">Add</button>
    <div class="card" v-for="n in notes">
        <p contenteditable=true>{{ n.note }}</p>
    </div>
</template>
<style scoped>
input,
button {
    margin: 1em;
    background-color: white;
    color: black;
}

.card {
    background-color: white;
    color: black;
    border-radius: .3em;
    width: 50%;
    margin: 1.5em;
    padding: 1.3em;
}
</style>