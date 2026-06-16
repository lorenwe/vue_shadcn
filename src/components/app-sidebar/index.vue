<script lang="ts" setup>

import { menuData, teams } from './data/sidebar-data.ts';
import NavFooter from './nav-footer.vue'
import NavTeam2 from './nav-team2.vue'
import TeamSwitcher from './team-switcher.vue'
</script>

<template>
  <UiSidebar collapsible="icon" class="z-50">
    <UiSidebarHeader>
      <TeamSwitcher :teams="teams" />
    </UiSidebarHeader>

    <UiSidebarContent>
      <NavTeam2 :menu-item="menuData" />
    </UiSidebarContent>

    <UiSidebarFooter>
      <NavFooter />
    </UiSidebarFooter>

    <UiSidebarRail />
  </UiSidebar>
</template>