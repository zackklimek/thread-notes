<script setup lang="ts">

import { ref, Ref } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, getDocs, collection, QuerySnapshot, QueryDocumentSnapshot, doc, deleteDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from '../../firebaseConfig';
import { useRouter } from "vue-router";

const app = initializeApp(firebaseConfig);
const router = useRouter()
const auth = getAuth(app);
const db = getFirestore();

const sorted: Ref<any> = ref({});
const show: Ref<any> = ref({});

const notes: Ref<any[]> = ref([]);


function getThreads() {
    notes.value = [];
    if (auth.currentUser !== null) {
        const storePath = collection(db, "users/", auth.currentUser!.uid + "/notes/");
        getDocs(storePath).then((snap: QuerySnapshot) => {
            snap.forEach((doc: QueryDocumentSnapshot) => {
                notes.value.push(doc.data())
            })
        }).then(() => {
            notes.value.sort((a: any, b: any) => {
                return new Date(b.threadId).getTime() - new Date(a.threadId).getTime();
            })
        }).then(() => {
            notes.value.forEach((t) => {
                if (t.threadId in sorted.value) {
                    sorted.value[t.threadId].push(t)
                }
                else {
                    sorted.value[t.threadId] = [t];
                    show.value[t.threadId] = true;
                }
                // t.threadId in sorted.value
                //     ? sorted.value[t.threadId].push(t)
                //     : sorted.value[t.threadId] = [t]
            })
        })
    }
}

function deleteNote(note: any) {
    const path = doc(db, "users/", auth.currentUser!.uid + "/notes/", note.noteId);
    // Check if image url exists, remove from FB Storage as well if so...
    deleteDoc(path).then(() => {
        window.location.reload(); //FIXME
    });
}

function threadClick(thrId: string) {
    show.value[thrId] = !show.value[thrId];
}

onAuthStateChanged(auth, () => {
    if (auth === null || auth === undefined) {
        router.push({ path: '/' })
    }
    getThreads();
})

</script>

<template>
    <h2>Threads</h2>
    <div class="threadDiv" v-for="(th, i) in sorted" :key="th.threadId">
        <span>
            <h3 @click="threadClick(th[0].threadId)" class="threadName">{{ th[0].threadName ? th[0].threadName :
                th[0].threadId }} </h3>
        </span>
        <div id="box" v-if="show[th[0].threadId]"
            v-for="(n, index) in th.sort((a: any, b: any) => a.threadIndex - b.threadIndex)">
            <div class="noteCard">
                <div class="headerParent">
                    <h4>{{ new Date(n.threadId).toLocaleDateString('en-us') }}</h4>
                </div>
                <div class="body">
                    <h4>{{ n.title }}</h4>
                    <img v-show="'imageUrl' in n" :src="n.imageUrl" />
                    <p :id="index.toString()" class="block">
                        {{ n.text }}
                    </p>
                    <span v-if="n.tags[0] !== ''" v-for="tag in n.tags" class="tag">
                        #{{ tag }}</span>
                </div>
                <span class="footerParent">
                    <p class="indexText">{{ index + 1 }}</p>
                    <button @click="deleteNote(n)">Delete</button>
                </span>
                <div></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
span {
    text-align: left;
}

.threadName:hover {
    transform: scale(1.03);
    text-decoration: underline;
}

.threadDiv {
    text-align: center;
}

.noteCard {
    position: relative;
    min-height: 5vh;
    word-wrap: break-word;
    min-width: 45vw;
    max-width: 45vw;
    padding-right: 1.3em;
    padding-left: 1.3em;
    padding-top: .66em;
    background-color: aliceblue;
    color: black;
    margin-top: 1.5em;
    margin-bottom: 1.33em;
    box-shadow: black;
    border-radius: 5px;
}

.body {
    padding: 2em;
    padding-top: 0;
}

.tag {
    padding-right: .66em;
    padding-left: .66em;
}

.headerParent {
    display: flex;
    justify-content: flex-end;
}

.footerParent {
    display: flex;
    justify-content: space-between;
}

.tag:hover {
    color: rgba(47, 72, 255, 0.719);
}

.noteCard:hover {
    transform: scale(1.015);
}

h4 {
    margin-top: 0.6em;
}
</style>
