<script setup lang="ts">
/**
 * 动态路由通用页面 — 根据 route.meta.title 展示页面标题
 * 后续可按 route.path 匹配到具体业务组件
 */
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() => (route.meta.title as string) || route.path)
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
