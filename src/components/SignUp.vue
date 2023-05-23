<script setup lang="ts">

import { ref, Ref } from "vue";
import swal from "sweetalert";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { initializeApp } from 'firebase/app';
import { useRouter } from 'vue-router';
import firebaseConfig from "../../firebaseConfig.ts";


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const router = useRouter();

const loginInput: Ref<string> = ref("");
const passInput: Ref<string> = ref("");

function signUpHandler() {
    if (loginInput.value.length > 0 && passInput.value.length >= 8 && loginInput.value.includes('@')) {
        createUserWithEmailAndPassword(auth, loginInput.value, passInput.value)
            .then(() => {
                loginInput.value = "";
                passInput.value = "";
                router.push({ path: "/" })
            })
    }
    else if (passInput.value.length < 8) {
        passInput.value = "";
        swal("Password must be at least 8 characters.")
    }
}

</script>

<template>
    <h2>Sign Up</h2>
    <div class="card">
        <h4 class="text">Create an account.</h4>
        <div class="column">
            <input placeholder="Email" v-model="loginInput" />
            <input placeholder="Password" type="password" v-model="passInput" />
            <p class="p-text">Password must be <br>at least 8 characters.</p>
        </div>
        <br />
        <button @click="signUpHandler">Sign Up</button>
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
