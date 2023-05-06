import { createApp } from 'vue'
import {createRouter, createWebHashHistory} from "vue-router"
import './style.css'
import App from './App.vue'
import ComposeThread from './components/ComposeThread.vue'
import NoteGrid from './components/NoteGrid.vue'; 
import SignUp from './components/SignUp.vue';
import LogIn from './components/LogIn.vue'

const routes = [
    {path: "/", component: ComposeThread},
    {path: "/notes", component: NoteGrid },
    {path: "/signUp", component: SignUp},
    {path: "/logIn", component: LogIn}
]

const router = createRouter({routes: routes,  history: createWebHashHistory()})

createApp(App).use(router).mount('#app')
