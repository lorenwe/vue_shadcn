import type { App } from 'vue'


import { setupNProgress } from './nprogress/setup'
import { setupPinia } from './pinia/setup'
import { setupRouter } from './router/setup'


export function setupPlugins(app: App) {
  setupNProgress()
  setupPinia(app)
  setupRouter(app)
}