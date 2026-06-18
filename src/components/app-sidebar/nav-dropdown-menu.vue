<script lang="ts" setup>
import NavDropdownMenu from '@/components/app-sidebar/nav-dropdown-menu.vue'
import MenuButton from './menu-button.vue'
import type { MenuItem } from './types'
import { isExternalUrl } from '@/utils/is-external-url'
import { useRoute } from 'vue-router'

const { menuItem } = defineProps<{
  menuItem: MenuItem
}>()
const route = useRoute()
function isActive(menu: MenuItem): boolean {
  const pathname = route.path
  if (menu.url) {
    return pathname === menu.url
  }
  return !!menu.items?.some(item => item.url === pathname)
}

</script>

<template>
    <!-- 无子节点：普通链接 -->
    <UiSidebarMenuItem v-if="!menuItem.items">
        <MenuButton
            :is-active="isActive(menuItem)"
            :tooltip="menuItem.title"
            :is-external-url="isExternalUrl(menuItem.url)"
            :menu="menuItem"
        />
    </UiSidebarMenuItem>
    <!-- 有子节点：可折叠 -->
    <UiDropdownMenu v-else>
        <UiDropdownMenuTrigger as-child>
            <UiSidebarMenuButton :tooltip="menuItem.title">
            <component :is="menuItem.icon" v-if="menuItem.icon" />
            <span>{{ menuItem.title }}</span>
            </UiSidebarMenuButton>
        </UiDropdownMenuTrigger>
        <UiDropdownMenuContent align="start" side="right">
            <UiDropdownMenuLabel>{{ menuItem.title }}</UiDropdownMenuLabel>
            <UiDropdownMenuSeparator />
            <UiDropdownMenuItem v-for="subItem in menuItem.items" :key="subItem.title" as-child>
                <NavDropdownMenu :menu-item="subItem" />
            </UiDropdownMenuItem>
        </UiDropdownMenuContent>
    </UiDropdownMenu>
</template>