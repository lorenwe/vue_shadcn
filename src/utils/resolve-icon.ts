import { h } from 'vue'
import DynamicIcon from '@/components/dynamic-Icon.vue'
import { type NavIcon } from '@/components/app-sidebar/types'

export function resolveIcon(iconName: string): NavIcon {
  // 返回一个函数组件或者直接返回 DynamicIcon 并传递 name 属性
  return (props: any) => h(DynamicIcon, { ...props, name: iconName })
}