<script setup lang="ts">

import { computed, onMounted, ref, Ref } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, getDocs, collection, QuerySnapshot, QueryDocumentSnapshot } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from '../../firebaseConfig';
import { useRouter } from "vue-router";

const app = initializeApp(firebaseConfig);
const router = useRouter()
const auth = getAuth(app);
const db = getFirestore();
const storePath = collection(db, "users/", auth.currentUser!.uid + "/notes/")

const sorted: Ref<any> = ref({});

const threads: Ref<any[]> = ref([]);


function getThreads() {
    threads.value = []
    if (auth.currentUser !== null) {
        getDocs(storePath).then((snap: QuerySnapshot) => {
            snap.forEach((doc: QueryDocumentSnapshot) => {
                threads.value.push(doc.data())
            })
        }).then(() => {
            threads.value.sort((a: any, b: any) => {
                return new Date(b.threadId).getTime() - new Date(a.threadId).getTime();
            })
        }).then(() => {
            threads.value.forEach((t) => {
                t.threadId in sorted.value
                    ? sorted.value[t.threadId].push(t)
                    : sorted.value[t.threadId] = [t]
            })
        })
    }
}

onAuthStateChanged(auth, () => {
    if (auth === null || auth === undefined) {
        router.push({ path: '/' })
    }
    getThreads();
})
</script>

<template>
    <h3>Notes</h3>
    <div v-for="th in sorted">
        <h3>{{ th[0].threadName ? th[0].threadName : th[0].threadId }}</h3>
        <div id="box" v-for="(n, index) in th.sort((a: any, b: any) => a.threadIndex - b.threadIndex)">
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
                    <h4>{{ n.threadName }}</h4>
                    <p>{{ n.threadIndex + 1 }}</p>
                </span>
                <div></div>
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
