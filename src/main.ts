import { createApp } from 'vue'
import App from './App.vue'
import "@/assets/style/style.css"
import '@/assets/style/scrollbar.css'
import '@/assets/style/themes.css'
import '@/assets/style/view-transition.css' // 主题切换动画效果
import { setupPlugins } from '@/plugins'

async function bootstrap() {
  const app = createApp(App)

  setupPlugins(app)

  app.mount('#app')

  // 初始化语言包：不阻塞首屏渲染，内置 JSON 即时可用
  // const { useI18nStore } = await import('@/stores/i18n')
  // const i18nStore = useI18nStore()
  // i18nStore.initLocale().catch(() => {})
}

bootstrap()
