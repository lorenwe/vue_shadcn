<script setup lang="ts">
import { BadgeCheckIcon, BellIcon, ChevronsUpDownIcon, CreditCardIcon, LogOutIcon, SparklesIcon, UserRoundCogIcon } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { useSidebar } from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { isMobile, open } = useSidebar()

/** 从 auth store 取真实用户信息，缺失字段给兜底值 */
const displayName = computed(() => authStore.userInfo?.name || '用户')
const displayEmail = computed(() => authStore.userInfo?.email || '')
const displayAvatar = computed(() => authStore.userInfo?.avatar || '')

async function logout() {
  try {
    await authStore.logout()
    toast.success('已退出登录')
    await router.push('/login')
  } catch {
    toast.error('退出失败，请重试')
  }
}
</script>

<template>
  <UiSidebarMenu>
    <UiSidebarMenuItem>
      <UiDropdownMenu>
        <UiDropdownMenuTrigger as-child>
          <UiSidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <UiAvatar class="size-8 rounded-lg">
              <UiAvatarImage :src="displayAvatar" :alt="displayName" />
              <UiAvatarFallback class="rounded-lg">
                CN
              </UiAvatarFallback>
            </UiAvatar>
            <div class="grid flex-1 text-sm leading-tight text-left">
              <span class="font-semibold truncate">{{ displayName }}</span>
              <span class="text-xs truncate">{{ displayEmail }}</span>
            </div>
            <ChevronsUpDownIcon class="ml-auto size-4" />
          </UiSidebarMenuButton>
        </UiDropdownMenuTrigger>
        <UiDropdownMenuContent
          class="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          :side="(isMobile || open) ? 'bottom' : 'right'"
          align="start"
          :side-offset="4"
        >
          <UiDropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <UiAvatar class="size-8 rounded-lg">
                <UiAvatarImage :src="displayAvatar" :alt="displayName" />
                <UiAvatarFallback class="rounded-lg">
                  CN
                </UiAvatarFallback>
              </UiAvatar>
              <div class="grid flex-1 text-sm leading-tight text-left">
                <span class="font-semibold truncate">{{ displayName }}</span>
                <span class="text-xs truncate">{{ displayEmail }}</span>
              </div>
            </div>
          </UiDropdownMenuLabel>

          <UiDropdownMenuSeparator />
          <UiDropdownMenuGroup>
            <UiDropdownMenuItem @click="router.push('/billing/')">
              <SparklesIcon />
              Upgrade to Pro
            </UiDropdownMenuItem>
          </UiDropdownMenuGroup>

          <UiDropdownMenuSeparator />
          <UiDropdownMenuGroup>
            <UiDropdownMenuItem @click="router.push('/billing?type=billing')">
              <CreditCardIcon />
              Billing
            </UiDropdownMenuItem>
          </UiDropdownMenuGroup>

          <UiDropdownMenuSeparator />
          <UiDropdownMenuGroup>
            <UiDropdownMenuItem @click="router.push('/settings/')">
              <UserRoundCogIcon />
              Profile
            </UiDropdownMenuItem>
            <UiDropdownMenuItem @click="router.push('/settings/account')">
              <BadgeCheckIcon />
              Account
            </UiDropdownMenuItem>
            <UiDropdownMenuItem @click="router.push('/settings/notifications')">
              <BellIcon />
              Notifications
            </UiDropdownMenuItem>
          </UiDropdownMenuGroup>

          <UiDropdownMenuSeparator />
          <UiDropdownMenuItem @click="logout">
            <LogOutIcon />
            退出
          </UiDropdownMenuItem>
        </UiDropdownMenuContent>
      </UiDropdownMenu>
    </UiSidebarMenuItem>
  </UiSidebarMenu>
</template>
