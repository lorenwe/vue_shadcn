<script lang="ts" setup>
import type { BasicColorSchema } from '@vueuse/core'
// import type { Component } from 'vue'

import { MoonIcon, SunIcon, SunMoonIcon } from '@lucide/vue'
import { setColorMode, colorMode } from '@/composables/use-color-mode'

const colorModes: {
  colorMode: BasicColorSchema
  icon: Component
}[] = [
  { colorMode: 'light', icon: SunIcon },
  { colorMode: 'dark', icon: MoonIcon },
  { colorMode: 'auto', icon: SunMoonIcon },
]
</script>

<template>
  <div class="space-y-1.5 pt-6">
    <UiLabel for="radius" class="text-xs">
      Color Mode
    </UiLabel>
    <div class="grid grid-cols-3 gap-2 py-1.5">
      <UiButton
        v-for="item in colorModes" :key="item.colorMode"
        variant="outline"
        class="justify-center items-center h-8 px-3"
        :class="item.colorMode === colorMode ? 'border-foreground border-2' : ''"
        @click="(e: MouseEvent) => setColorMode(e, item.colorMode)"
      >
        <component :is="item.icon" />
        <span class="text-xs">{{ item.colorMode }}</span>
      </UiButton>
    </div>
  </div>
</template>
