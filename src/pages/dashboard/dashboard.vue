<script setup lang="ts">
/**
 * 动态路由通用页面 — 根据 route.meta.title 展示页面标题
 * 后续可按 route.path 匹配到具体业务组件
 */
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { fetchLanguagePack } from '@/api/i18n/i18n'
import { LoginExpiredError } from '@/api/response'

const route = useRoute()
const pageTitle = computed(() => (route.meta.title as string) || route.path)

// 接口访问状态测试
const testing = ref(false)
const lastResult = ref('')

async function testApi() {
  testing.value = true
  try {
    const pack = await fetchLanguagePack()
    const langCount = Object.keys(pack).length
    lastResult.value = `接口访问正常：语言包接口返回 ${langCount} 种语言`
    toast.success('接口访问正常', { description: lastResult.value })
  } catch (error) {
    // 登录失效已由 parseApiResponse 统一提示并跳转，这里不再重复提示
    if (error instanceof LoginExpiredError) {
      return
    }
    const message = error instanceof Error ? error.message : String(error)
    lastResult.value = `接口访问失败：${message}`
    toast.error('接口访问失败', { description: message })
  } finally {
    testing.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">{{ pageTitle }}</h1>
      <p class="text-sm text-muted-foreground mt-1">
        当前路径：{{ route.path }}
      </p>
    </div>

    <!-- 接口访问状态测试 -->
    <div class="flex flex-wrap items-center gap-3">
      <Button :disabled="testing" @click="testApi">
        <UiSpinner v-if="testing" class="mr-2 h-4 w-4 animate-spin" />
        {{ testing ? '测试中…' : '测试接口访问' }}
      </Button>
      <p v-if="lastResult" class="text-sm text-muted-foreground">{{ lastResult }}</p>
    </div>

    <!-- 占位内容 -->
    <div class="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
      <div class="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
        <svg
          class="size-6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      </div>
      <p class="font-medium">{{ pageTitle }} 页面</p>
      <p class="text-sm mt-1">此页面由服务端菜单动态生成，可替换为具体业务组件</p>
    </div>
  </div>
</template>
