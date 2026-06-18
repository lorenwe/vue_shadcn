<script setup lang="ts">
import { ChevronRightIcon } from '@lucide/vue'
import { useRoute } from 'vue-router'
import { isExternalUrl } from '@/utils/is-external-url'
import type { MenuItem } from './types'
import MenuButton from './menu-button.vue'
import NavTeamRecursive from '@/components/app-sidebar/nav-team-recursive.vue'

const { menuItem } = defineProps<{
  menuItem: MenuItem
}>()

const route = useRoute()
const initialPath = route.path

function isActive(menu: MenuItem): boolean {
  const pathname = route.path
  if (menu.url) {
    return pathname === menu.url
  }
  return !!menu.items?.some(item => item.url === pathname)
}

function isCollapsed(menu: MenuItem): boolean {
  if (menu.url === initialPath)
    return true
  return !!menu.items?.some(item => item.url === initialPath)
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
  <UiSidebarMenuItem v-else >
      <UiCollapsible as-child :default-open="isCollapsed(menuItem)" class="group/collapsible" >
          <UiSidebarMenuItem>
              <UiCollapsibleTrigger as-child>
                  <UiSidebarMenuButton :tooltip="menuItem.title">
                      <component :is="menuItem.icon" v-if="menuItem.icon" />
                      <span>{{ menuItem.title }}</span>
                      <ChevronRightIcon class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </UiSidebarMenuButton>
              </UiCollapsibleTrigger>
          </UiSidebarMenuItem>
          <UiCollapsibleContent>
              <UiSidebarMenuSub class="ms-3.5 me-0 ps-2.5 pe-0">
                  <UiSidebarMenuSubItem>
                      <NavTeamRecursive v-for="child in menuItem.items" :key="child.title" :menu-item="child" />
                  </UiSidebarMenuSubItem>
              </UiSidebarMenuSub>
          </UiCollapsibleContent>
      </UiCollapsible>
  </UiSidebarMenuItem>
</template>