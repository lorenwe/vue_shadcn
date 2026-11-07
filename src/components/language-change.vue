<script setup lang="ts">
import type { Language } from '@/api/i18n/types'
import type { AcceptableValue } from 'reka-ui'
import { useI18n } from 'vue-i18n'
import { LanguagesIcon } from '@lucide/vue'
import { Icon } from "@iconify/vue";


const { locale, t } = useI18n()

function setDefaultLanguage() {
  locale.value = DEFAULT_LOCALE
  appLocale.value = DEFAULT_LOCALE
}

function handleLocaleChange(val: AcceptableValue) {
  if (typeof val !== 'string') {
    console.warn(`[i18n] 无效的语言值类型: ${typeof val}，将使用默认语言`)
    setDefaultLanguage()
    return
  }

  // 2. 检查语言是否支持
  const isValidLanguage = SUPPORTED_LOCALES.some(lang => lang.code === val)
  
  if (!isValidLanguage) {
    console.warn(`[i18n] 不支持的语言: ${val}，将使用默认语言`)
    setDefaultLanguage()
    return
  }

  // 3. 设置语言
  const language = val as Language
  
  // 同步更新 i18n 和 appLocale
  locale.value = language
  appLocale.value = language
  
  console.log(`✅ [i18n] 语言已切换: ${language}`)
}
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton
        variant="outline"
        size="icon"
        aria-label="Change language"
        :title="t('common.language.change')"
      >
        <LanguagesIcon  />
        <span class="sr-only">{{ t('common.language.change') }}</span>
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end">
      <UiDropdownMenuRadioGroup
        v-model="locale"
        @update:model-value="handleLocaleChange"
      >
        <!-- 国旗卡片：size-4 仅用于规避下拉项的 [&_svg:not([class*='size-'])]:size-4 强制正方形规则；真实 4:3 尺寸由内联 style 控制 -->
        <UiDropdownMenuRadioItem value="en-US">
          <span class="flex h-4 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-muted ring-1 ring-inset ring-border/80">
            <Icon icon="flag:us-4x3" class="size-4" style="width:16px;height:12px" />
          </span>
          <span>English</span>
        </UiDropdownMenuRadioItem>
        <UiDropdownMenuRadioItem value="zh-CN">
          <span class="flex h-4 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-muted ring-1 ring-inset ring-border/80">
            <Icon icon="flag:cn-4x3" class="size-4" style="width:16px;height:12px" />
          </span>
          <span>简体中文</span>
        </UiDropdownMenuRadioItem>
        <UiDropdownMenuRadioItem value="zh-TW">
          <span class="flex h-4 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-muted ring-1 ring-inset ring-border/80">
            <Icon icon="flag:tw-4x3" class="size-4" style="width:16px;height:12px" />
          </span>
          <span>繁體中文</span>
        </UiDropdownMenuRadioItem>
        <UiDropdownMenuRadioItem value="ja-JP">
          <span class="flex h-4 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-muted ring-1 ring-inset ring-border/80">
            <Icon icon="flag:jp-4x3" class="size-4" style="width:16px;height:12px" />
          </span>
          <span>日本語</span>
        </UiDropdownMenuRadioItem>
      </UiDropdownMenuRadioGroup>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
