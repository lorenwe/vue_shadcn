import type { App } from 'vue'

import { setupAutoAnimate } from './auto-animate/setup'
import { setupNProgress } from './nprogress/setup'
import { setupPinia } from './pinia/setup'
import { setupRouter } from './router/setup'
import { setupI18n } from './i18n/setup'
import { setupTanstackVueQuery } from './tanstack-vue-query/setup'


export async function setupPlugins(app: App) {
  setupNProgress()
  setupAutoAnimate(app)
  setupPinia(app)
  await setupI18n(app)
  setupTanstackVueQuery(app)
  setupRouter(app)
}
