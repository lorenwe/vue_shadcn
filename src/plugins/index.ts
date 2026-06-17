import type { App } from 'vue'


import { setupNProgress } from './nprogress/setup'
import { setupPinia } from './pinia/setup'
import { setupRouter } from './router/setup'
import { setupI18n } from './i18n/setup'


export function setupPlugins(app: App) {
  setupNProgress()
  setupPinia(app)
  // i18n 必须在 router 之前：路由组件渲染时依赖 $t()
  // setupI18n(app)
  setupRouter(app)
}
