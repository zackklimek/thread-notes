<script setup lang="ts">
import { onUnmounted, onMounted, ref, Ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useRouter } from 'vue-router';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";
import firebaseConfig from '../firebaseConfig';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const router = useRouter();
const userEmail: Ref<string | null> = ref(null);

onAuthStateChanged(auth, () => {
  if (auth.currentUser)
    userEmail.value = auth.currentUser?.email;
  else {
    userEmail.value = null;
    router.push({
      path: '/'
    })
  }
})

onUnmounted(() => {
  signOut(auth);
})

</script>

<template>
  <div id="navbar">
    <RouterLink to="/"><a class="link">Compose Thread</a></RouterLink>
    <RouterLink v-if="userEmail !== null" to="/notes"><a class="link">View Notes</a></RouterLink>
    <RouterLink v-if="userEmail !== null" to="/map"><a class="link">Mapping</a></RouterLink>
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
      <h4 v-if="userEmail !== null" class="footerElement">for <a class="text">{{ userEmail }}</a> </h4>
      <p class="footerElement">v 0.6.5</p>
    </div>
  </div>
</template>

<style scoped>
.footerTitle {
  padding-top: 1em;
}

.footerElement {
  margin: .3em;
  font-family: Helvetica, Arial, sans-serif;
}

.fixed {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#navbar {
  padding-bottom: 1.66em;
  display: flex;
  justify-content: space-between;
}

.fade {
  transition: opacity 0.5s ease;
}
</style>
