<script setup lang="ts">
import { useRoute } from 'vue-router'

defineOptions({ name: 'UserDetail' })

const route = useRoute()
const userId = computed(() => route.params.id as string)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">用户详情</h1>
      <p class="text-sm text-muted-foreground mt-1">
        当前用户 ID：{{ userId }}
      </p>
    </div>

    <div class="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
      用户详情页面占位内容
    </div>
  </div>
</template>
