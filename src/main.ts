import { createApp } from 'vue'
import App from './App.vue'
import "@/assets/style/style.css"
import '@/assets/style/scrollbar.css'
import '@/assets/style/themes.css'
import '@/assets/style/view-transition.css' // 主题切换动画效果
import { setupPlugins } from '@/plugins'

function bootstrap() {
  const app = createApp(App)

  setupPlugins(app)

  app.mount('#app')
}

bootstrap()
