<script setup lang="ts">

import { ref, Ref } from "vue";
import firebaseConfig from "../../firebaseConfig.ts";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { initializeApp } from 'firebase/app';
import { useRouter } from 'vue-router';
import swal from "sweetalert";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const router = useRouter();

const loginInput: Ref<string> = ref("");
const passInput: Ref<string> = ref("");

function logInHandler() {
    signInWithEmailAndPassword(auth, loginInput.value, passInput.value)
        .then(() => {
            loginInput.value = "";
            passInput.value = "";
            router.push({ path: "/" })
        })
        .catch((error: any) => {
            if (error.code === 'auth/wrong-password') {
                swal("Incorrect password")
                passInput.value = "";
            }
        })
}

</script>

<template>
    <h2>Log In</h2>
    <div class="card">
        <h4 class="text">Log in to your account.</h4>
        <div class="column">
            <input placeholder="Email" v-model="loginInput" />
            <input placeholder="Password" type="password" v-model="passInput" />
        </div>
        <br />
        <button @click="logInHandler">Log In</button>
    </div>
</template>

<style scoped>
.column {
    display: flex;
    flex-direction: column;
}

.card {
    border-radius: .3em;
    background-color: aliceblue;
    padding-bottom: 1.6em;
    padding-top: .6em;
    padding-left: 3em;
    padding-right: 3em;
    width: 50%;

}

input {
    background-color: white;
    color: black;
    margin-bottom: .6em;
}

button {
    display: inline-block;
    width: auto;
}

.text {
    color: black;
}

.p-text {
    margin-top: .6em;
    margin-bottom: .1em;
    color: black;
    font-size: .8em;
}
</style>
