<script setup lang="ts">
import { ref, Ref, computed, onMounted, Transition } from "vue";
import { useRouter } from 'vue-router';
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import firebaseConfig from '../../firebaseConfig';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const threadName: Ref<string> = ref('')
const titles: Ref<string[]> = ref(['']);
const edits: Ref<boolean[]> = ref([false])
const router = useRouter();
const notes = ref(['']);
const urls = ref([''])
const published: Ref<boolean> = ref(false);
const tags: Ref<string[]> = ref(['']);

const currentBlob: Ref<undefined | Blob> = ref(undefined);
const currentImg: Ref<string> = ref("");
const imageBlobs: Ref<(Blob | undefined)[]> = ref([undefined])
const initialDate: Ref<string> = ref("");

const splitTags = computed(() => {
    return tags.value.map((t) => t.trim().split(" "))
});
const cardClass = computed(() => {
    if (isHoveringOver.value) {
        return "block hoverClick"
    }
    else {
        return "block";
    }
})
let len = computed(() => { return notes.value.length });

const isHoveringOver = ref(false);
const isHoldingDown = ref(false);


function clear(): void {
    initialDate.value = new Date().toISOString();
    notes.value = [''];
    edits.value = [false];
    tags.value = [''];
    currentBlob.value = undefined;
    currentImg.value = "";
    imageBlobs.value = [undefined];
    published.value = false;
    titles.value = [''];
    urls.value = [''];
    threadName.value = '';
}

function toggleEdit(i: number) {
    if (edits.value[i] === true) {
        const newVal: string = document.getElementById('txt' + i.toString())!.innerText
        notes.value[i] = newVal;
        edits.value[i] = !edits.value[i]
    } else {
        edits.value[i] = !edits.value[i]
    }
}

function enterEvent(index: number) {
    if (edits.value[index] === false) {
        const len: number = notes.value.length;
        const id: string = (len - 1).toString()
        const newVal: string = document.getElementById('txt' + id)!.innerText;
        document.getElementById('txt' + id)!.innerText = "";
        notes.value = [...notes.value.slice(0, len - 1), newVal, notes.value[len - 1]] // Look into cost of spread operator
        tags.value.push("")
        urls.value.push("");
        edits.value.push(false);
        titles.value.push("")
        imageBlobs.value[index] = currentBlob.value;
        currentImg.value = "";
        currentBlob.value = undefined;
        document.getElementById('txt' + id)!.innerText = newVal;
    }
}

function handleEnter(e: KeyboardEvent) {
    const i: number = parseInt(e.target!.id.substring(3))
    if (edits.value[i] == true) {
        edits.value[i] = false;
    }
}

function postWithImg(n: Note) {
    console.log(n.text + " has an image", n)
}

function postWithoutImg(n: Note) {
    console.log(n.text + " does not have an image")
}

type Note = {
    text: string,
    blob: Blob | undefined,
    tags: string[],
    threadIndex: number,
    threadId: string,
    threadName: string,
    title: string
    url: string
}

function publishNote() {
    if (auth.currentUser != null) {
        if (!edits.value.includes(true)) {
            published.value = true;
            if (notes.value[notes.value.length - 1] === "")
                notes.value.pop();
            if (notes.value.length != splitTags.value.length)
                splitTags.value.pop();

            for (let i = 0; i < notes.value.length; i++) {
                let obj = {
                    text: notes.value[i].trim(),
                    blob: imageBlobs.value[i],
                    tags: splitTags.value[i],
                    threadIndex: i,
                    threadId: initialDate.value,
                    threadName: threadName.value,
                    title: titles.value[i].trim(),
                    url: urls.value[i].trim()
                }

                if (obj.blob) {
                    postWithImg(obj)
                }
                else {
                    postWithoutImg(obj)
                }
            }
        }
        else {
            alert("You're still editing at least one note. Are you sure?")
        }
    }
    else {
        alert("Please sign in first.")
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
            edits.value[i] = false;
        }
        else if (edits.value[i] && file?.type.startsWith("image/") && i != len.value - 1 && i < len.value) {
            const blobData = file.slice(0, file.size, file.type);
            imageBlobs.value[i] = blobData;
            edits.value[i] = false;

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
    isHoldingDown.value = true;
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



const titleClick = ref(false);

function titleEnter() {
    titleClick.value = false;
}

function isVideo(index: number) {
    if (urls.value[index].startsWith("https://www.youtube")) {
        return true;
    }
    else {
        return false;
    }
}

function getEmbeddedVideo(index: number) {
    if (urls.value[index].startsWith("https://www.youtube")) {
        return 'https://www.youtube.com/embed/' + urls.value[index].split('v=')[1];
    }
    else {
        return "";
    }
}

</script>

<template>
    <div class="horizBox header">
        <h4 v-if="threadName === '' && !titleClick" class="headerText" @click="() => titleClick = true">[ THREAD NAME ]
        </h4>
        <h4 v-if="threadName !== '' && !titleClick" class="headerText" @click="() => titleClick = true"> [ {{
            threadName }} ]</h4>
        <input id="titleInput" v-model="threadName" placeholder="Name your thread." v-if="titleClick"
            @keyup.enter="titleEnter" />

        <h4 class="headerText"> {{ new Date(initialDate).toLocaleString('en-us') }}</h4>
    </div>
    <!-- Need to break this into more modular components -->
    <Transition name="slide-fade">
        <div v-if="!published">
            <div v-for="(i, index) in   notes  " :id="'box' + index" :class="cardClass" :key="index" @dragover="handleDrag"
                @drop="handleDrop" @mouseover="() => isHoveringOver = true" @mouseleave="() => isHoveringOver = false">
                <div class="pt" />
                <div class="horizBox">
                    <span class="titleBox">
                        <Transition name="slide-fade">
                            <h4 v-if="titles[index] !== '' && !edits[index]" class="title">{{ titles[index] }}</h4>
                        </Transition>
                        <Transition name="fade">
                            <input :id="'tle' + index.toString()" v-if="edits[index] && index != (len - 1)"
                                class="cardInput" v-model="titles[index]" placeholder="Add a title"
                                @keyup.enter="handleEnter" />
                        </Transition>
                    </span>
                    <button v-if="!edits[index] && index < len - 1" class="boxBtn" @click="toggleEdit(index)">Edit</button>
                    <button v-if="edits[index] && index < len - 1" class="boxBtn" @click="toggleEdit(index)">Save</button>
                </div>
                <Transition name="slide-fade">
                    <iframe v-if="isVideo(index)" :src="getEmbeddedVideo(index)">

                    </iframe>
                </Transition>
                <Transition name="slide-fade">
                    <img v-if="getImageUrl(imageBlobs[index]) !== '' && index < len - 1" id="importImg"
                        :src="getImageUrl(imageBlobs[index])" />
                </Transition>
                <Transition name="slide-fade">
                    <img v-if="currentImg !== '' && index === len - 1" :src="currentImg" id="importImg" />
                </Transition>
                <p :id="'txt' + index.toString()" class="block txtHover" :contenteditable="edits[index] || len - 1 == index"
                    @keyup.enter="enterEvent(index)">
                    <Transition name="slide-fade">{{ i }}</Transition>
                </p>
                <h5 v-if="!edits[index] && urls[index] !== '' && titles[index] !== ''">
                    <a :href="urls[index]" target="_blank"> {{ titles[index] }}</a>
                </h5>
                <h5 v-if="!edits[index] && urls[index] !== '' && titles[index] === ''">
                    <a :href="urls[index]">Source</a>
                </h5>
                <br v-if="edits[index] || tags[index] != null" />
                <Transition name="fade">
                    <div>
                        <Transition name="fade">
                            <div v-if="index == len - 1 || edits[index]" class="horizBox">
                                <p class="footerText">Tags:</p>
                                <input :id="'tag' + index.toString()" v-model="tags[index]" class="cardInput"
                                    @keyup.enter="handleEnter" />
                            </div>
                        </Transition>
                        <Transition name="fade">
                            <div v-if="index != len - 1 && edits[index]" class="horizBox">
                                <span class="footerText">Url:</span>
                                <input class="cardInput" v-model="urls[index]" @keyup.enter="handleEnter" />
                            </div>
                        </Transition>
                    </div>
                </Transition>
                <span class="parent-container">
                    <span v-if="!edits[index] && tags[index] != null && tags[index].length > 0 && index != tags.length - 1"
                        v-for="  t   in   splitTags[index]  " class="tagText footerText">
                        #{{ t }}
                    </span>
                </span>
                <span class="right" id="position">
                    {{ index + 1 }} / {{ len }}
                </span>
                <div class="pt"></div>
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
iframe {
    max-width: 80%;
}

.header {
    width: 90%;
}

#titleInput {
    background-color: black;
    color: white;
    font-size: 1.03em;
    font-family: Helvetica, Arial, sans-serif
}

.headerText {
    font-family: Helvetica, Arial, sans-serif;
}

.parent-container {
    display: flex;
    flex-wrap: wrap;
}

.horizBox {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-content: center;
    margin-bottom: .5em;
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
    font-family: "Raleway", Helvetica, Arial, sans-serif;
}

.tagText {
    color: rgb(0, 17, 127);
    padding-right: 1em;
    transition: 0.13s;
}

.footerText {
    font-size: .75em;
    margin: 0;
}

.tagText:hover {
    color: rgb(97, 125, 235);
    transform: scale(1.02);
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

[id^="tags"] {
    background-color: aliceblue;
    margin-left: 1em;
    font-family: "Raleway", sans-serif;
}

.cardInput {
    background-color: aliceblue;
    color: black;
    font-family: "Raleway", sans-serif;
    border-radius: .3em;
    padding-left: .66em;
    font-size: .8em;
    width: 50%;
    max-height: 2em;
}

[id^="txt"]:hover {
    background-color: aliceblue;
    box-shadow: inset;
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
    margin-left: .66em;
}

[id^="box"]:hover {
    transform: scale(1.015);
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
