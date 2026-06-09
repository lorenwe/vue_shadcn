import { createApp } from 'vue'
import App from './App.vue'
import "@/assets/style/style.css"
import '@/assets/style/scrollbar.css'
import { setupPlugins } from '@/plugins'

function bootstrap() {
  const app = createApp(App)

  setupPlugins(app)

  app.mount('#app')
}

bootstrap()