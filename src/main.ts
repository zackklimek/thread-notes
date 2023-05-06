import { createApp } from 'vue'
import {createRouter, createWebHashHistory} from "vue-router"
import './style.css'
import App from './App.vue'
import Thread from './components/Thread.vue'
import NoteGrid from './components/NoteGrid.vue'; 
import SignUp from './components/SignUp.vue'

const routes = [
    {path: "/", component: Thread},
    {path: "/notes", component: NoteGrid},
    {path: "/signUp", component: SignUp}
]

const router = createRouter({routes: routes,  history: createWebHashHistory()})

createApp(App).use(router).mount('#app')
