<script lang="ts" setup>
import { PaintbrushIcon } from '@lucide/vue'
import ContentLayout from './content-layout.vue'
import CustomColor from './custom-color.vue'
import CustomRadius from './custom-radius.vue'
import CustomThemeTitle from './custom-theme-title.vue'
// import MenuStyle from './menu-style.vue'
import ToggleColorMode from './toggle-color-mode.vue'
</script>

<template>
  <UiPopover>
    <UiPopoverTrigger>
      <UiButton variant="outline" size="icon">
        <PaintbrushIcon />
      </UiButton>
    </UiPopoverTrigger>
    <UiPopoverContent align="end">
      <CustomThemeTitle />
      <CustomColor />
      <CustomRadius />
      <ToggleColorMode />
      <ContentLayout />
      <!-- <MenuStyle /> -->
    </UiPopoverContent>
  </UiPopover>
</template>
