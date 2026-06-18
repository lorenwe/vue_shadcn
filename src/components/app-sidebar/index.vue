<script lang="ts" setup>

import { menuData, teams } from './data/sidebar-data.ts';
import NavFooter from './nav-footer.vue'
import NavTeam from './nav-team.vue'
import TeamSwitcher from './team-switcher.vue'
</script>

<template>
  <UiSidebar collapsible="icon" class="z-50">
    <UiSidebarHeader>
      <TeamSwitcher :teams="teams" />
    </UiSidebarHeader>

    <UiSidebarContent>
      <NavTeam :menu-item="menuData" />
    </UiSidebarContent>

    <UiSidebarFooter>
      <NavFooter />
    </UiSidebarFooter>

    <UiSidebarRail />
  </UiSidebar>
</template>