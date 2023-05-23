import { createApp } from 'vue'
import {createRouter, createWebHashHistory} from "vue-router"
import './style.css'
import App from './App.vue'
import ComposeThread from './components/ComposeThread.vue'
import ThreadFeed from './components/ThreadFeed.vue'; 
import SignUp from './components/SignUp.vue';
import LogIn from './components/LogIn.vue'

const routes = [
    {path: "/", component: ComposeThread},
    {path: "/notes", component: ThreadFeed },
    {path: "/signUp", component: SignUp},
    {path: "/logIn", component: LogIn},
]

const router = createRouter({routes: routes,  history: createWebHashHistory()})

createApp(App).use(router).mount('#app')
