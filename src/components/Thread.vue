<script setup lang="ts">
import { ref, Ref, computed } from "vue";

const notes = ref(['']);
const editing: Ref<boolean> = ref(false);
const tags: Ref<string[]> = ref([""]);
const splitTags = computed(() => {
    return tags.value.map((t) => t.trim().split(" "))
});
const b: Ref<undefined | Blob> = ref(undefined);
const currentImg: Ref<string> = ref("");
const imageUrls: Ref<string[]> = ref([""]);

function toggleEdit(i: number) {
    if (editing.value === true) {
        const newVal: string = document.getElementById(i.toString())!.innerText
        notes.value[i] = newVal;
    }
    editing.value = !editing.value;
}

function enterEvent(index: number) {
    if (editing.value === false) {
        const len: number = notes.value.length;
        const id: string = (len - 1).toString()
        const newVal: string = document.getElementById(id)!.innerText;
        notes.value = [...notes.value.slice(0, len - 1), newVal, notes.value[len - 1]] // Look into cost of spread operator
        tags.value.push("")
        imageUrls.value[index] = currentImg.value;
        currentImg.value = "";
    }
}

function handleInputEnter() {
    if (editing.value == true) {
        editing.value = false;
    }
}

function publishNote() {
    if (editing.value === false) {
        const trimmedNotes = notes.value.map((n) => n = n.trim())
        console.log(trimmedNotes)
    }
}



function handleDrop(e: DragEvent) {
    e.preventDefault()
    console.log('event', e)
    // console.log('target', e.target!.id.substring(3))
    // console.log(e.dataTransfer)
    if (e.dataTransfer?.files.length != 0 && e.target!.id.substring(3)) {
        const file = e.dataTransfer?.files[0]
        if (file?.type.startsWith("image/")) {
            const blobData = file.slice(0, file.size, file.type);
            b.value = new Blob([blobData])
            // console.log(file)
            currentImg.value = URL.createObjectURL(b.value);

            /* 
                push image to cloud storage images
                populate ref with url
                v-show img tag
            */
        }
    }
}

</script>

<template>
    <div v-for="(i, index) in notes" :id="'box' + index" :key="index" @dragover.prevent @drop="handleDrop">
        <div class="pt"></div>
        <button v-if="!editing && index < notes.length - 1" class="boxBtn" @click="toggleEdit(index)">Edit</button>
        <button v-if="editing && index < notes.length - 1" class="boxBtn" @click="toggleEdit(index)">Save</button>
        <img v-if="imageUrls[index] !== '' && index < notes.length - 1" id="importImg" :src="imageUrls[index]" />
        <img v-if="currentImg !== '' && index === notes.length - 1" :src="currentImg" id="importImg" />
        <p :id="index.toString()" class="block" :contenteditable="editing || notes.length - 1 == index"
            @keyup.enter="enterEvent(index)">
            {{ i }}
        </p>
        <span class="right" id="position">
            <span id="position"> {{ index + 1 }} / {{ notes.length }}</span>
        </span>
        <br v-if="editing || tags[index] != null" />
        <div v-if="index == notes.length - 1 || editing" class="footer">
            <span class="footerText">Tags:</span>
            <input id="tagsInput" v-model="tags[index]" @keyup.enter="handleInputEnter" />
        </div>
        <span v-if="!editing && tags[index] != null && tags[index].length > 0 && index != tags.length - 1"
            v-for="t in splitTags[index]" class="tagText footerText footer">
            #{{ t }}
        </span>
    </div>
    <button v-if="notes.length > 1" @click="publishNote">Publish</button>
</template>

<style scoped>
p {
    padding-top: 6.33px;
    min-height: 6.33vh;
}

.boxBtn {
    margin-left: 85%;
    margin-bottom: 0.33em;

}

.tagText {
    color: rgb(15, 59, 233);
    margin-left: 1em;
}

.footerText {
    font-size: .8em;
    width: 100vh;
}

.footer {
    margin-bottom: 0.5em;
    margin-top: 0.33em;
}

.tagText:hover {
    color: rgb(97, 125, 235);
}


.pt {
    padding-top: .66em;
}

#importImg {
    min-width: 30vh;
    max-width: 30vh;
    padding-top: 1.33em;
    max-height: 50vh;
}

#tagsInput {
    width: 80%;
    background-color: rgb(229, 236, 250);
    margin-left: 1em;
}

[id^="box"] {
    position: relative;
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
    transition: 0.3s;
    border-radius: 5px;
}

#position {
    padding: 0;
    margin: 0;
    font-size: 10px;
}
</style>
