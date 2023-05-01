<script setup lang="ts">
import { ref, Ref, computed, onMounted } from "vue";

const notes = ref(['']);
const editing: Ref<boolean> = ref(false);
const tags: Ref<string[]> = ref([""]);
const splitTags = computed(() => {
    return tags.value.map((t) => t.trim().split(" "))
});
let len = computed(() => { return notes.value.length });

const currentBlob: Ref<undefined | Blob> = ref(undefined);
const currentImg: Ref<string> = ref("");
const imageBlobs: Ref<(Blob | undefined)[]> = ref([undefined])
const initialDate: Ref<string> = ref("");

function toggleEdit(i: number) {
    if (editing.value === true) {
        const newVal: string = document.getElementById('txt' + i.toString())!.innerText
        notes.value[i] = newVal;
    }
    editing.value = !editing.value;
}

function enterEvent(index: number) {
    if (editing.value === false) {
        const len: number = notes.value.length;
        const id: string = (len - 1).toString()
        const newVal: string = document.getElementById('txt' + id)!.innerText;
        notes.value = [...notes.value.slice(0, len - 1), newVal, notes.value[len - 1]] // Look into cost of spread operator
        tags.value.push("")
        imageBlobs.value[index] = currentBlob.value;
        currentImg.value = "";
        currentBlob.value = undefined;
    }
}

function handleTagsEnter() {
    if (editing.value == true) {
        editing.value = false;
    }
}

function publishNote() {
    if (editing.value === false) {
        if (notes.value[notes.value.length - 1] === "")
            notes.value.pop();
        if (notes.value.length != splitTags.value.length)
            splitTags.value.pop();

        // console.log('split tags', splitTags.value)
        // console.log('notes', notes.value)
        // console.log('blobs', imageBlobs.value)

        for (let i = 0; i < notes.value.length; i++) {
            let obj = {
                name: notes.value[i].trim(),
                blob: imageBlobs.value[i],
                tags: splitTags,
                threadIndex: i,
                threadId: initialDate
            }

            console.log(obj)

        }

    }
}



function handleDrop(e: DragEvent) {
    e.preventDefault();
    console.log('event', e);
    if (e.dataTransfer?.files.length != 0 && e.target!.id.substring(3)) {
        const i = parseInt(e.target!.id.substring(3));
        console.log(i, len.value)
        const file = e.dataTransfer?.files[0]
        if (file?.type.startsWith("image/") && i === len.value - 1) {
            const blobData = file.slice(0, file.size, file.type);
            currentBlob.value = new Blob([blobData])
            currentImg.value = URL.createObjectURL(currentBlob.value);
            editing.value = false;
        }
        else if (file?.type.startsWith("image/") && i != len.value - 1 && i < len.value) {
            const blobData = file.slice(0, file.size, file.type);
            imageBlobs.value[i] = blobData;
            editing.value = false;

        }
    }
    else if (e.dataTransfer?.getData('text/plain')) {
        console.log('link?', e.dataTransfer?.getData('text/plain'))
    }
}


function getImageUrl(blob: Blob | undefined): string {
    console.log('get url from blob')
    if (blob !== undefined) {
        return URL.createObjectURL(blob)
    }
    return "";
}

onMounted(() => {
    initialDate.value = new Date().toISOString();
    console.log('mounted', initialDate);
})

</script>

<template>
    <div v-for="(i, index) in notes" :id="'box' + index" :key="index" @dragover.prevent @drop="handleDrop">
        <div class="pt" />
        <button v-if="!editing && index < len - 1" class="boxBtn" @click="toggleEdit(index)">Edit</button>
        <button v-if="editing && index < len - 1" class="boxBtn" @click="toggleEdit(index)">Save</button>
        <img v-if="getImageUrl(imageBlobs[index]) !== '' && index < len - 1" id="importImg"
            :src="getImageUrl(imageBlobs[index])" />
        <img v-if="currentImg !== '' && index === len - 1" :src="currentImg" id="importImg" />
        <p :id="'txt' + index.toString()" class="block" :contenteditable="editing || len - 1 == index"
            @keyup.enter="enterEvent(index)">
            {{ i }}
        </p>
        <span class="right" id="position">
            <span id="position"> {{ index + 1 }} / {{ len }}</span>
        </span>
        <br v-if="editing || tags[index] != null" />
        <div v-if="index == len - 1 || editing" class="footer">
            <span class="footerText">Tags:</span>
            <input id="tagsInput" v-model="tags[index]" @keyup.enter="handleTagsEnter" />
        </div>
        <span v-if="!editing && tags[index] != null && tags[index].length > 0 && index != tags.length - 1"
            v-for="t in splitTags[index]" class="tagText footerText footer">
            #{{ t }}
        </span>
        <div class="pt" />
    </div>
    <button v-if="len > 1" @click="publishNote">Publish</button>
</template>

<style scoped>
p {
    padding-top: 6.33px;
    min-height: 3.33vh;
}

.boxBtn {
    margin-left: 80%;
    margin-bottom: 0.66em;
}

.tagText {
    color: rgb(15, 59, 233);
    padding-right: 1em;
    transition: 0.13s;
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
    max-width: 66%;
    /* max-height: 30vh; */
    width: auto;
    height: auto;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    transition: 0.3s;
}

#importImg:hover {
    transform: scale(1.02);
    box-shadow: 0 1px 3px rgba(47, 72, 255, 0.719);
}

#tagsInput {
    width: 70%;
    background-color: rgb(229, 236, 250);
    margin-left: 1em;
    font-family: "Raleway", sans-serif;
}

[id^="box"] {
    position: relative;
    min-height: 5vh;
    word-wrap: break-word;
    min-width: 40vw;
    max-width: 40vw;
    padding-right: .66em;
    padding-left: .66em;
    padding-top: 0px;
    background-color: rgb(229, 236, 250);
    color: black;
    margin: 1.33em;
    box-shadow: 0 1px 6px rgba(47, 72, 255, 0.719), 0 1px 4px rgba(47, 72, 255, 0.719);
    transition: 0.3s;
    border-radius: 5px;
}

#position {
    padding: 0;
    margin: 0;
    font-size: 10px;
}
</style>
