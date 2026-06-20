import type { App } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,                      // 失败重试次数
      refetchOnWindowFocus: false,   // 窗口聚焦时不重新请求
      refetchOnReconnect: false,     // 网络重连时不重新请求
      staleTime: 1000 * 60 * 5,      // 数据新鲜时间（5分钟）
    },
  },
})

export function setupTanstackVueQuery(app: App) {
  app.use(VueQueryPlugin, {
    enableDevtoolsV6Plugin: true,
    queryClient,
  })
}
