<script lang="ts" setup>
import { useSidebar } from '@/components/ui/sidebar'
import NavTeamRecursive from '@/components/app-sidebar/nav-team-recursive.vue'
import NavDropdownMenu from '@/components/app-sidebar/nav-dropdown-menu.vue'

import type { MenuItem } from './types'

const { menuItem } = defineProps<{
  menuItem: MenuItem[]
}>()

const { state, isMobile } = useSidebar()

</script>

<template>
  <UiSidebarGroup>
    <UiSidebarMenu>
      <template v-if="state !== 'collapsed' || isMobile">
        <!-- 侧边栏已展开 -->
        <template v-for="menu in menuItem" :key="menu.title">
          <NavTeamRecursive :menu-item="menu" />
        </template>
      </template>
      <template v-else>
        <!-- 侧边栏已折叠 -->
        <template v-for="menu in menuItem" :key="menu.title">
          <NavDropdownMenu :menu-item="menu" />
        </template>
      </template>
    </UiSidebarMenu>
  </UiSidebarGroup>
</template>
