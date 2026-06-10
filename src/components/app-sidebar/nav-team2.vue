<script lang="ts" setup>
import { useSidebar } from '@/components/ui/sidebar'
import { useSidebarConfigStore } from '@/stores/sidebar-config'

import type { MenuItem } from './types'

// import NavTeamCollapsible from './nav-team-collapsible.vue'
// import NavTeamVercel from './nav-team-vercel.vue'
import NavTeamCollapsible2 from './nav-team-collapsible2.vue'

const { menuItem } = defineProps<{
  menuItem: MenuItem[]
}>()

const { state } = useSidebar()
const sidebarConfig = useSidebarConfigStore()

/**
 * Determine which menu mode to use
 * - If sidebar is collapsed, always use collapsible mode (with dropdown for non-mobile)
 * - If sidebar is expanded and vercel mode is enabled, use vercel mode
 * - Otherwise use collapsible mode
 */
const effectiveMode = computed(() => {
  // Vercel mode only works when sidebar is expanded
  if (state.value === 'collapsed') {
    return 'collapsible'
  }
  return sidebarConfig.navigationMode
})
</script>

<template>
  <!-- <NavTeamVercel v-if="effectiveMode === 'vercel'" :nav-main="navMain" /> -->
  <NavTeamCollapsible2 :menu-item="menuItem" />
</template>
