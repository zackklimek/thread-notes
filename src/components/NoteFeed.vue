<script setup lang="ts">

import { ref, Ref } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, getDocs, collection, QuerySnapshot, QueryDocumentSnapshot } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from '../../firebaseConfig';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore();

const threads: Ref<any[]> = ref([]);

function getThreads() {
    threads.value = []
    if (auth.currentUser !== null) {
        const storePath = collection(db, "users/", auth.currentUser!.uid + "/notes/")
        getDocs(storePath).then((snap: QuerySnapshot) => {
            snap.forEach((doc: QueryDocumentSnapshot) => {
                threads.value.push(doc.data())
            })
        }).then(() => {
            threads.value.sort((a: any, b: any) => {
                return new Date(b.threadId).getTime() - new Date(a.threadId).getTime();
            })
        })
    }
}

onAuthStateChanged(auth, () => {
    getThreads();
})
</script>

<template>
    <h3>Notes</h3>
    <div id="box" v-for="(t, index) in threads">
        <div class="noteCard">
            <div class="headerParent">
                <h4>{{ new Date(t.threadId).toLocaleDateString('en-us') }}</h4>
            </div>
            <div class="body">
                <h4>{{ t.title }}</h4>
                <img v-show="'imageUrl' in t" :src="t.imageUrl" />
                <p :id="index.toString()" class="block">
                    {{ t.text }}
                </p>
                <span v-if="t.tags[0] !== ''" v-for="tag in t.tags" class="tag">
                    #{{ tag }}</span>
            </div>
            <div class="footerParent">
                <h4>{{ t.threadName }}</h4>
            </div>
        </div>
    </div>
</template>

<style scoped>
.noteCard {
    position: relative;
    min-height: 5vh;
    word-wrap: break-word;
    min-width: 40vw;
    max-width: 40vw;
    padding-right: 1.3em;
    padding-left: 1.3em;
    padding-top: .66em;
    background-color: aliceblue;
    color: black;
    margin: 1.33em;
    box-shadow: 0 1px 6px rgba(47, 72, 255, 0.719), 0 1px 4px rgba(47, 72, 255, 0.719);
    transition: 0.3s;
    border-radius: 5px;
    margin-left: .66em;
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
    justify-content: flex-start;
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
