<script lang="ts" setup>
import { sidebarData, menuData } from './data/sidebar-data'
import NavFooter from './nav-footer.vue'
import NavTeam2 from './nav-team2.vue'
import TeamSwitcher from './team-switcher.vue'
</script>

<template>
  <UiSidebar collapsible="icon" class="z-50">
    <UiSidebarHeader>
      <TeamSwitcher :teams="sidebarData.teams" />
    </UiSidebarHeader>

    <UiSidebarContent>
      <NavTeam2 :menu-item="menuData" />
    </UiSidebarContent>

    <UiSidebarFooter>
      <NavFooter :user="sidebarData.user" />
    </UiSidebarFooter>

    <UiSidebarRail />
  </UiSidebar>
</template>