import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Initialize our storage
import { initializeStorage } from './utils/storage'
initializeStorage()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')