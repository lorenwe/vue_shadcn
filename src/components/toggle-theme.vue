<script setup lang="ts">
import { MoonIcon, SunIcon, SunMoonIcon } from '@lucide/vue'
import { setColorMode } from '@/composables/use-color-mode'

</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton
        variant="outline"
        size="icon"
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        <SunIcon class="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon class="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span class="sr-only">Toggle theme</span>
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end">
      <UiDropdownMenuItem @click="(e: MouseEvent) => setColorMode(e, 'light')" >
        <SunIcon />
        Light
      </UiDropdownMenuItem>
      <UiDropdownMenuItem @click="(e: MouseEvent) => setColorMode(e, 'dark')">
        <MoonIcon />
        Dark
      </UiDropdownMenuItem>
      <UiDropdownMenuItem @click="(e: MouseEvent) => setColorMode(e, 'auto')">
        <SunMoonIcon />
        System
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
