import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import * as bootstrap from 'bootstrap'

// Make bootstrap available globally
window.bootstrap = bootstrap

const app = createApp(App)
app.use(router)
app.mount('#app') 