<script setup lang="ts">
import { ref, Ref, computed, onMounted, Transition } from "vue";
import { useRouter } from 'vue-router';

const titles: Ref<string[]> = ref(['']);
const router = useRouter();
const notes = ref(['']);
const urls = ref([''])
const editing: Ref<boolean> = ref(false);
const published: Ref<boolean> = ref(false);
const tags: Ref<string[]> = ref(['']);
const splitTags = computed(() => {
    return tags.value.map((t) => t.trim().split(" "))
});
const cardClass = computed(() => {
    if (over.value) {
        return "block hoverClick"
    }
    else {
        return "block";
    }
})
let len = computed(() => { return notes.value.length });

const currentBlob: Ref<undefined | Blob> = ref(undefined);
const currentImg: Ref<string> = ref("");
const imageBlobs: Ref<(Blob | undefined)[]> = ref([undefined])
const initialDate: Ref<string> = ref("");

type Note = {
    text: string,
    blob: Blob | undefined,
    tags: string[][],
    threadIndex: number,
    threadId: string
}

function clear(): void {
    initialDate.value = new Date().toISOString();
    notes.value = [''];
    editing.value = false;
    tags.value = [''];
    currentBlob.value = undefined;
    currentImg.value = "";
    imageBlobs.value = [undefined];
    published.value = false;
    titles.value = [''];
    urls.value = ['']
}

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
        document.getElementById('txt' + id)!.innerText = "";
        notes.value = [...notes.value.slice(0, len - 1), newVal, notes.value[len - 1]] // Look into cost of spread operator
        tags.value.push("")
        urls.value.push("");
        titles.value.push("")
        imageBlobs.value[index] = currentBlob.value;
        currentImg.value = "";
        currentBlob.value = undefined;
        document.getElementById('txt' + id)!.innerText = newVal;
    }
}

function handleEnter() {
    if (editing.value == true) {
        editing.value = false;
    }
}

function postWithImg(n: Note) {
    console.log(n.text + " has an image")
}

function postWithoutImg(n: Note) {
    console.log(n.text + " does not have an image")
}

function publishNote() {
    published.value = true;
    if (editing.value === false) {
        if (notes.value[notes.value.length - 1] === "")
            notes.value.pop();
        if (notes.value.length != splitTags.value.length)
            splitTags.value.pop();

        for (let i = 0; i < notes.value.length; i++) {
            let obj = {
                text: notes.value[i].trim(),
                blob: imageBlobs.value[i],
                tags: splitTags.value,
                threadIndex: i,
                threadId: initialDate.value
            }

            if (obj.blob) {
                postWithImg(obj)
            }
            else {
                postWithoutImg(obj)
            }
        }
    }
}

function handleDrop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer?.files.length != 0 && e.target!.id.substring(3)) {
        const i = parseInt(e.target!.id.substring(3));
        const file = e.dataTransfer?.files[0]
        if (file?.type.startsWith("image/") && i === len.value - 1) {
            const blobData = file.slice(0, file.size, file.type);
            currentBlob.value = new Blob([blobData])
            currentImg.value = URL.createObjectURL(currentBlob.value);
            editing.value = false;
        }
        else if (editing && file?.type.startsWith("image/") && i != len.value - 1 && i < len.value) {
            const blobData = file.slice(0, file.size, file.type);
            imageBlobs.value[i] = blobData;
            editing.value = false;

        }
    }
    else if (e.dataTransfer?.getData('text/plain')) {
        e.preventDefault();
        const i = parseInt(e.target!.id.substring(3));
        urls.value[i] = e.dataTransfer?.getData('text/plain')
    }
}

function handleDrag(e: DragEvent) {
    e.preventDefault();
    down.value = true;
}

function getImageUrl(blob: Blob | undefined): string {
    if (blob !== undefined) {
        return URL.createObjectURL(blob)
    }
    return "";
}

function toCollection(): void {
    router.push({ path: "/notes" });
}

function focusText(): void {
    document.getElementById("txt" + (len.value - 1).toString())?.focus();
}

onMounted(() => {
    initialDate.value = new Date().toISOString();
    focusText();
})

const over = ref(false);
const down = ref(false);


</script>

<template>
    <Transition name="slide-fade">
        <div v-if="!published">
            <div v-for="(i, index) in notes" :id="'box' + index" :class="cardClass" :key="index" @dragover="handleDrag"
                @drop="handleDrop" @mouseover="() => over = true" @mouseleave="() => over = false">
                <div class="pt" />
                <div class="horizBox">
                    <span class="titleBox">
                        <Transition name="slide-fade">
                            <h5 v-if="titles[index] !== '' && !editing" class="title">{{ titles[index] }}
                            </h5>
                        </Transition>
                        <Transition name="fade">
                            <input v-if="editing && index != (len - 1)" id="titleInput" v-model="titles[index]"
                                placeholder="Add a title" @keyup.enter="handleEnter" />
                        </Transition>
                    </span>
                    <button v-if="!editing && index < len - 1" class="boxBtn" @click="toggleEdit(index)">Edit</button>
                    <button v-if="editing && index < len - 1" class="boxBtn" @click="toggleEdit(index)">Save</button>
                </div>
                <Transition name="slide-fade">
                    <img v-if="getImageUrl(imageBlobs[index]) !== '' && index < len - 1" id="importImg"
                        :src="getImageUrl(imageBlobs[index])" />
                </Transition>
                <Transition name="slide-fade"><img v-if="currentImg !== '' && index === len - 1" :src="currentImg"
                        id="importImg" />
                </Transition>
                <p :id="'txt' + index.toString()" class="block" :contenteditable="editing || len - 1 == index"
                    @keyup.enter="enterEvent(index)">
                    <Transition name="slide-fade">{{ i }}</Transition>
                </p>
                <h5 v-if="!editing && urls[index] !== '' && titles[index] !== ''"><a :href="urls[index]">{{ titles[index]
                }}</a></h5>
                <h5 v-if="!editing && urls[index] !== '' && titles[index] === ''"><a :href="urls[index]">Source</a></h5>
                <span class="right" id="position">
                    <span id="position"> {{ index + 1 }} / {{ len }}</span>
                </span>
                <br v-if="editing || tags[index] != null" />
                <Transition name="fade">
                    <div>
                        <div v-if="index == len - 1 || editing" class="horizBox">
                            <p class="footerText">Tags:</p>
                            <input id="tagsInput" v-model="tags[index]" @keyup.enter="handleEnter" />
                        </div>
                        <div v-if="index != len - 1 && editing" class="horizBox">
                            <span class="footerText">Url:</span>
                            <input id="urlsInput" v-model="urls[index]" @keyup.enter="handleEnter" />
                        </div>
                    </div>
                </Transition>
                <span v-if="!editing && tags[index] != null && tags[index].length > 0 && index != tags.length - 1"
                    v-for="t in splitTags[index]" class="tagText footerText footer">
                    #{{ t }}
                </span>
                <div class="pt" />
            </div>
            <button v-if="len > 1" @click="publishNote">Publish</button>
        </div>
        <div v-else>
            <h3>Published.</h3>
            <p>Create a new thread?</p>
            <span>
                <button class="publishedBtn" @click="clear">Thread</button>
                <button @click="toCollection" class="publishedBtn">Collection</button>
            </span>
        </div>
    </Transition>
</template>

<style scoped>
.horizBox {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-content: center;

}

.titleBox {
    display: flex;
    flex-direction: row;
    align-content: left;
    max-width: 80%;
    justify-content: flex-start;
}

.title {
    padding-top: 0;
    min-height: 0;
    margin: 0;
}

#titleInput {
    max-width: 66%;
    min-width: 15%;
    width: auto;
    background-color: aliceblue;
    max-height: 2.33vh;
    color: black;
    border-radius: 3px;
    margin-left: .5em;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.66s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-fade-enter-active {
    transition: all 0.33s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.33s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
}

p {
    padding-top: 3.33px;
    min-height: 3.33vh;
    margin: .66em;
}

.boxBtn {
    margin-bottom: 0.66em;
}

.publishedBtn {
    margin: .66em;
    font-family: "Raleway", Helvetica, sans-serif;
}

.tagText {
    color: rgb(15, 59, 233);
    padding-right: 1em;
    transition: 0.13s;
}

.footerText {
    font-size: .8em;
    margin: 0;
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
    transform: scale(1.01);
    box-shadow: 0 1px 3px rgba(47, 72, 255, 0.719);
}

#tagsInput {
    background-color: aliceblue;
    margin-left: 1em;
    font-family: "Raleway", sans-serif;
}

#urlsInput {
    background-color: aliceblue;
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
    background-color: aliceblue;
    color: black;
    margin: 1.33em;
    box-shadow: 0 1px 6px rgba(47, 72, 255, 0.719), 0 1px 4px rgba(47, 72, 255, 0.719);
    transition: 0.3s;
    border-radius: 5px;
}

.hoverClick {
    background-color: rgb(229, 236, 250);
}

#position {
    padding: 0;
    margin: 0;
    font-size: 10px;
}
</style>
