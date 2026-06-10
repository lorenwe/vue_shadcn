<script lang="ts" setup>
import { sidebarData } from '@/components/app-sidebar/data/sidebar-data.ts'
import { useRoute } from 'vue-router'
// import { useSidebar } from '@/components/ui/sidebar'
import { ChevronRightIcon, ExternalLinkIcon } from '@lucide/vue'

import type { MenuItem } from '@/components/app-sidebar/types'
import { isExternalUrl } from '@/utils/is-external-url'
import MenuButton2 from '@/components/app-sidebar/menu-button2.vue'
import NavTeamRecursive from '@/components/app-sidebar/nav-team-recursive.vue'
import NavDropdownMenu from '@/components/app-sidebar/nav-dropdown-menu.vue'

const route = useRoute()
const initialPath = route.path
// const { state, isMobile } = useSidebar()

const { menuData } = sidebarData

function isCollapsed(menu: MenuItem): boolean {
  if (menu.url === initialPath)
    return true
  return !!menu.items?.some(item => item.url === initialPath)
}

function isActive(menu: MenuItem): boolean {
  const pathname = route.path
  if (menu.url) {
    return pathname === menu.url
  }
  return !!menu.items?.some(item => item.url === pathname)
}
</script>

<template>
    <UiSidebarMenu>
        <!-- <template v-for="menu in menuData" :key="menu.title">
            <NavTeamRecursive v-for="child in menu.items" :key="child.title" :menu-item="child" />
        </template> -->
        <template v-for="menu in menuData" :key="menu.title">
            <NavDropdownMenu :menu-item="menu" />
        </template>
    </UiSidebarMenu>
</template>