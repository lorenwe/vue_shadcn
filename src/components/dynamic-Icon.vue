<template>
  <component :is="iconComponent" v-bind="$attrs" />
</template>

<script setup lang="ts">
// import { computed } from 'vue'
import * as Icons from '@lucide/vue'
import { type NavIcon } from '@/components/app-sidebar/types'

const props = defineProps<{
  name: string
}>()

// 缓存转换后的组件
const iconCache = new Map<string, NavIcon>()

// 明确返回 NavIcon | null，排除 undefined
const iconComponent = computed<NavIcon | null>(() => {
  if (!props.name) return null
  
  if (iconCache.has(props.name)) {
    return iconCache.get(props.name)!
  }
  
  const componentName = props.name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  
  const Icon = Icons[componentName as keyof typeof Icons] as NavIcon
  
  if (Icon) {
    iconCache.set(props.name, Icon)
    return Icon
  }
  
  // 确保始终返回 NavIcon 或 null，而不是 undefined
  const fallbackIcon = Icons.HelpCircle as NavIcon
  iconCache.set(props.name, fallbackIcon)
  return fallbackIcon
})
</script>