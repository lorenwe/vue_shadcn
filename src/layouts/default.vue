<script setup lang="ts">
import { useCookies } from '@vueuse/integrations/useCookies'
import AppSidebar from '@/components/app-sidebar/index.vue'
import AppTabs from '@/components/app-tabs/index.vue'
import CommandMenuPanel from '@/components/command-menu-panel/index.vue'
import LanguageChange from '@/components/language-change.vue'
import { SIDEBAR_COOKIE_NAME } from '@/components/ui/sidebar/utils'
import { cn } from '@/lib/utils'
import { useTabsStore } from '@/stores/tabs'
import { storeToRefs } from 'pinia'

const defaultOpen = useCookies([SIDEBAR_COOKIE_NAME])
const themeStore = useThemeStore()
const { contentLayout } = storeToRefs(themeStore)

const tabsStore = useTabsStore()
</script>

<template>
    <UiSidebarProvider :default-open="defaultOpen.get(SIDEBAR_COOKIE_NAME)">
        <AppSidebar />
        <UiSidebarInset class="w-full max-w-full peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)] peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]">
            <header class="flex items-center gap-3 sm:gap-4 h-14 px-4 py-2 shrink-0 transition-[width,height] ease-linear" >
                <UiSidebarTrigger class="-ml-1" />
                <UiSeparator orientation="vertical" class="h-6" />
                <CommandMenuPanel />
                <div class="flex-1" />
                <div class="ml-auto flex items-center space-x-4">
                    <LanguageChange />
                    <ToggleTheme />
                    <CustomThemeThemePopover />
                </div>
            </header>

            <AppTabs />

            <main :class="cn('p-4 grow', contentLayout === 'centered' ? 'container mx-auto ' : '',)">
                <router-view v-slot="{ Component, route }">
                    <KeepAlive :include="tabsStore.cachedViews">
                        <component :is="Component" :key="route.fullPath" />
                    </KeepAlive>
                </router-view>
            </main>
        </UiSidebarInset>
    </UiSidebarProvider>
</template>