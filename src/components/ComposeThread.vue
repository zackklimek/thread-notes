<script setup lang="ts">
import { ref, Ref, computed, onMounted, Transition } from "vue";
import { useRouter } from 'vue-router';
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL, } from 'firebase/storage';
import swal from "sweetalert";
import firebaseConfig from '../../firebaseConfig';

// https://github.com/hwchase17/langchainjs
import { OpenAI } from "langchain/llms/openai";
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const llm = new OpenAI({ openAIApiKey: apiKey, temperature: 0 })

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore();
const storage = getStorage(app);


const threadName: Ref<string> = ref('')
const titles: Ref<string[]> = ref(['']);
const edits: Ref<boolean[]> = ref([false])
const router = useRouter();
const notes = ref(['']);
const urls = ref(['']);
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
        return "block hoverClick";
    }
    else {
        return "block";
    }
})
let len = computed(() => { return notes.value.length });

const isHoveringOver = ref(false);
const isHoldingDown = ref(false);
const titleClick = ref(false);

type NoteInput = {
    text: string,
    blob: Blob | undefined,
    tags: string[],
    threadIndex: number,
    threadId: string,
    threadName: string,
    title: string,
    url: string,
    noteId: string
};

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
    document.getElementById('txt0')!.innerText = "";
}

function toggleEdit(i: number) {
    if (edits.value[i] === true) {
        const newVal: string = document.getElementById('txt' + i.toString())!.innerText;
        notes.value[i] = newVal;
        edits.value[i] = !edits.value[i];
    } else {
        edits.value[i] = !edits.value[i];
    }
}

function enterEvent(index: number) {
    const len: number = notes.value.length;
    const id: string = (len - 1).toString();
    const newVal: string = document.getElementById('txt' + id)!.innerText;
    if (edits.value[index] === false && newVal.trim().length > 0) {
        document.getElementById('txt' + id)!.innerText = "";
        /*
            Push: note, tags, ursl, editing, title, imageBlob, currentImg,
                current
        */
        notes.value = [...notes.value.slice(0, len - 1), newVal, notes.value[len - 1]];
        tags.value.push("");
        urls.value.push("");
        edits.value.push(false);
        titles.value.push("");
        imageBlobs.value[index] = currentBlob.value;
        currentImg.value = "";
        currentBlob.value = undefined;
        document.getElementById('txt' + id)!.innerText = newVal;
    }
    // Prevents user from adding input to empty box on enter
    else if (newVal.trim().length === 0) {
        document.getElementById('txt' + id)!.innerText = "";
    }
}

function handleEnter(e: KeyboardEvent) {
    const i: number = parseInt(e.target!.id.substring(3))
    if (edits.value[i] == true) {
        edits.value[i] = false;
    }
}

function postWithImg(n: NoteInput) {
    if (auth.currentUser) {
        const imagePath: string = "users/" + auth.currentUser.uid + "/notes/" + n.noteId;
        const imageRef = sRef(storage, imagePath);
        if (n.blob !== undefined) {
            const noteImageBlob: Blob = n.blob;
            delete n.blob;
            const uploadTask = uploadBytesResumable(imageRef, noteImageBlob)
            uploadTask.on("state_changed",
                () => { },
                () => { swal("Error: Unsuccessful image upload.") },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((imageUrl) => {
                        const imageNote = {
                            ...n,
                            imageUrl: imageUrl
                        };
                        const userNotesRef = doc(db, "users", auth.currentUser!.uid, "notes", n.noteId);
                        setDoc(userNotesRef, imageNote);
                    })
                })
        }
    }
}

function postWithoutImg(n: NoteInput) {
    if (auth.currentUser !== null) {
        const userNotesRef = doc(db, "users", auth.currentUser!.uid, "notes", n.noteId);
        delete n.blob;
        setDoc(userNotesRef, n);
    }
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
                let obj: NoteInput = {
                    text: notes.value[i].trim(),
                    blob: imageBlobs.value[i],
                    tags: splitTags.value[i],
                    threadIndex: i,
                    threadId: initialDate.value,
                    threadName: threadName.value,
                    title: titles.value[i].trim(),
                    url: urls.value[i].trim(),
                    noteId: i + "_" + initialDate.value
                };
                obj.blob ? postWithImg(obj) : postWithoutImg(obj);
            }
        }
        else {
            swal("You're still editing at least one note. Are you sure?");
        }
    }
    else {
        swal("Please sign in first.");
    }
}

function handleDrop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer?.files.length != 0 && e.target!.id.substring(3)) {
        const i = parseInt(e.target!.id.substring(3));
        const file = e.dataTransfer?.files[0];
        if (file?.type.startsWith("image/") && i === len.value - 1) {
            const blobData = file.slice(0, file.size, file.type);
            currentBlob.value = new Blob([blobData], { type: file!.type });
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
        urls.value[i] = e.dataTransfer?.getData('text/plain');
    }
}

function handleDrag(e: DragEvent) {
    e.preventDefault();
    isHoldingDown.value = true;
}

function getImageUrl(blob: Blob | undefined): string {
    if (blob !== undefined) {
        return URL.createObjectURL(blob);
    }
    return "";
}

function toCollection(): void {
    router.push({ path: "/notes" });
}

function focusText(): void {
    document.getElementById("txt" + (len.value - 1).toString())?.focus();
}

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

function processPrompt(index: number) {
    if (edits.value[index] === true || index > len.value - 2) {
        let prompt: string = 'Define or describe the following in ~240 characters max., response should be succinct, not conversational: ' + document.getElementById('txt' + index)!.innerText;
        llm.call(prompt).then((res) => {
            document.getElementById('txt' + index)!.innerText = res.trim();
        })
        // Reduce API calls during testing
        // document.getElementById('txt' + index)!.innerText = "DUMMY RES"
    }
}

function removeNote(index: number) {
    notes.value.splice(index, 1);
    titles.value.splice(index, 1);
    urls.value.splice(index, 1);
    tags.value.splice(index, 1);
    edits.value.splice(index, 1);
}

onMounted(() => {
    initialDate.value = new Date().toISOString();
    focusText();
})

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
            <div v-for="(i, index) in   notes" :id="'box' + index" :class="cardClass" :key="notes[index] + index"
                @dragover="handleDrag" @drop="handleDrop" @mouseover="() => isHoveringOver = true"
                @mouseleave="() => isHoveringOver = false">
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
                <span>
                    <button v-if="index > len - 2 || edits[index]" @click="processPrompt(index)"
                        id="promptButton">Define</button>
                    <button id="removeButton" v-if="index < len - 1" @click="removeNote(index)">Remove</button>
                </span>
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
                <span class="right indexText" id="position">
                    {{ index + 1 }} / {{ len }}
                </span>
                <div class="pt"></div>
            </div>
            <span>
                <button v-show="len > 1" class="borderedButton" @click="clear">Clear</button>
                <button v-show="len > 1" class="borderedButton" @click="publishNote">Publish</button>
            </span>
        </div>
        <div v-else>
            <h2>Published.</h2>
            <p>Create a new thread?</p>
            <span>
                <button @click="clear" class="publishedBtn borderedButton">Thread</button>
                <button @click="toCollection" class="publishedBtn borderedButton">Collection</button>
            </span>
        </div>
    </Transition>
</template>

<style scoped>
iframe {
    max-width: 80%;
}

.header {
    width: 80%;
}

#titleInput {
    background-color: black;
    color: white;
    font-size: 1.03em;
    font-family: Helvetica, Arial, sans-serif;
    max-height: 2em;
    margin-top: 1em;
}

.headerText {
    font-family: Helvetica, Arial, sans-serif;
}

.parent-container {
    display: flex;
    flex-wrap: wrap;
}

#promptButton {
    margin: 1em;
    border: solid 1px rgb(115, 115, 115);
}

#removeButton {
    border: solid 1px rgb(115, 115, 115);
    margin-top: 1em;
    margin-bottom: .3em;
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
    min-width: 50vw;
    max-width: 50vw;
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

.borderedButton {
    background-color: whitesmoke;
    padding: .6em;
    border: gray;
    margin: 1em;
}
</style>