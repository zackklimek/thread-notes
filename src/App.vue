<script setup lang="ts">
import { ref, Ref } from 'vue';
import { RouterLink } from 'vue-router';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";
import firebaseConfig from '../firebaseConfig';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const userEmail: Ref<string | null> = ref(null);

onAuthStateChanged(auth, () => {
  if (auth.currentUser)
    userEmail.value = auth.currentUser?.email;
  else
    userEmail.value = null;
})

</script>

<template>
  <div id="navbar">
    <RouterLink to="/"><a class="link">Compose Thread</a></RouterLink>
    <RouterLink v-if="userEmail !== null" to="/notes"><a class="link">View Notes</a></RouterLink>
    <RouterLink v-if="userEmail !== null" to="/"><a class="link">Mapping?</a></RouterLink>
    <RouterLink v-if="userEmail === null" to="/signUp"><a class="link">Create an Account</a></RouterLink>
    <RouterLink v-if="userEmail === null" to="/logIn"><a class="link">Log In</a></RouterLink>
    <RouterLink v-if="userEmail !== null" @click="() => signOut(auth)" to="/"><a class="link">Sign
        Out</a>
    </RouterLink>
  </div>
  <div class="fixed">
    <router-view />
    <div>
      <h1 class="footerElement footerTitle">thread-notes</h1>
      <h4 v-if="userEmail !== null" class="footerElement">{{ userEmail }} </h4>
    </div>
  </div>
</template>

<style scoped>
.footerTitle {
  padding-top: 1em;
}

.footerElement {
  margin: .3em;
}

.fixed {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#navbar {
  padding-bottom: 1.66em;
}

.fade {
  transition: opacity 0.5s ease;
}
</style>
