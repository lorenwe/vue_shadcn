<script setup lang="ts">
import { XIcon } from '@lucide/vue'
import { ContextMenuContent, ContextMenuItem, ContextMenuPortal, ContextMenuRoot, ContextMenuSeparator, ContextMenuTrigger } from 'reka-ui'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { cn } from '@/lib/utils'
import { useTabsStore, type TabItem } from '@/stores/tabs'

const route = useRoute()
const router = useRouter()
const { t, te } = useI18n()
const tabsStore = useTabsStore()

/** 解析标签标题：优先 i18n，其次 meta.title / name / path */
function displayTitle(tab: TabItem): string {
  if (tab.i18nKey && te(tab.i18nKey)) {
    return t(tab.i18nKey)
  }
  return tab.title || tab.name || tab.path
}

function isActive(tab: TabItem): boolean {
  return route.fullPath === tab.fullPath
}

/** 点击标签切换页面 */
function openTab(tab: TabItem) {
  if (route.fullPath !== tab.fullPath) {
    router.push(tab.fullPath)
  }
}

/** 关闭单个标签；若关闭的是当前激活标签，跳到相邻标签 */
function handleClose(tab: TabItem) {
  if (tab.affix) return

  const idx = tabsStore.tabs.findIndex(t => t.fullPath === tab.fullPath)
  const wasActive = route.fullPath === tab.fullPath

  tabsStore.removeTab(tab.fullPath)

  if (wasActive) {
    const remaining = tabsStore.tabs
    const next = remaining[idx] ?? remaining[idx - 1] ?? remaining[remaining.length - 1]
    router.push(next ? next.fullPath : '/')
  }
}

/** 关闭其他标签：保留固定标签 + 当前标签，并跳到该标签 */
function handleCloseOthers(tab: TabItem) {
  tabsStore.closeOthers(tab.fullPath)
  if (route.fullPath !== tab.fullPath) {
    router.push(tab.fullPath)
  }
}

/** 关闭所有标签：仅保留固定标签，并跳到首页 */
function handleCloseAll() {
  tabsStore.closeAll()
  const stillActive = tabsStore.tabs.some(t => t.fullPath === route.fullPath)
  if (!stillActive) {
    router.push('/')
  }
}
</script>

<template>
  <div class="flex h-7 items-center gap-1 overflow-x-auto border-b px-2">
    <ContextMenuRoot v-for="tab in tabsStore.tabs" :key="tab.fullPath">
      <ContextMenuTrigger as-child>
        <div
          :class="cn(
            'group inline-flex shrink-0 cursor-pointer select-none items-center gap-1 rounded-md border border-transparent pl-2 pr-1 py-0.5 text-xs transition-colors',
            isActive(tab)
              ? 'bg-muted font-medium text-foreground'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )"
          @click="openTab(tab)"
        >
          <span class="whitespace-nowrap">{{ displayTitle(tab) }}</span>
          <button
            v-if="!tab.affix"
            type="button"
            class="grid size-3.5 place-items-center rounded-sm text-muted-foreground/70 opacity-0 transition-opacity hover:bg-muted-foreground/20 hover:text-foreground group-hover:opacity-100"
            :class="{ 'opacity-100': isActive(tab) }"
            @click.stop="handleClose(tab)"
          >
            <XIcon class="size-3" />
          </button>
        </div>
      </ContextMenuTrigger>

      <ContextMenuPortal>
        <ContextMenuContent
          align="start"
          :side-offset="4"
          class="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <ContextMenuItem
            :disabled="tab.affix"
            class="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            @click="handleClose(tab)"
          >
            {{ t('tabs.closeCurrent') }}
          </ContextMenuItem>
          <ContextMenuSeparator class="-mx-1 my-1 h-px bg-border" />
          <ContextMenuItem
            class="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
            @click="handleCloseOthers(tab)"
          >
            {{ t('tabs.closeOthers') }}
          </ContextMenuItem>
          <ContextMenuItem
            class="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
            @click="handleCloseAll"
          >
            {{ t('tabs.closeAll') }}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuPortal>
    </ContextMenuRoot>
  </div>
</template>
