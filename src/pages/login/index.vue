<script lang="ts">
import { useColorMode } from '@vueuse/core'
import LoginForm from "@/components/login-form.vue"

// 执行初始化：读取缓存 + 给 html 挂载 dark 类，主题立即生效
useColorMode()
</script>

<template>
  <div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-sm">
      <LoginForm />
    </div>
  </div>
</template>