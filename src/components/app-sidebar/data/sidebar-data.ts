import { AudioWaveformIcon, CommandIcon, GalleryVerticalEndIcon } from '@lucide/vue'

import pinia from '@/plugins/pinia/setup'
import { useMenuStore } from '@/stores/menu'
import { resolveIcon } from '@/utils/resolve-icon'
import type { MenuItem as ApiMenuItem } from '@/api/menu/types'

import type { MenuItem, NavIcon, Team } from '../types'


export const teams: Team[] = [
  {
    name: 'Acme Inc',
    logo: GalleryVerticalEndIcon,
    plan: 'Enterprise',
  },
  {
    name: 'Acme Corp.',
    logo: AudioWaveformIcon,
    plan: 'Startup',
  },
  {
    name: 'Evil Corp.',
    logo: CommandIcon,
    plan: 'Free',
  },
]

/**
 * 将服务端菜单项转为侧边栏渲染格式（icon: string → Component）
 */
function toSidebarMenuItem(item: ApiMenuItem): MenuItem {
  return {
    title: item.title,
    url: item.url,
    icon: item.icon ? resolveIcon(item.icon) as NavIcon : undefined,
    items: item.items?.map(toSidebarMenuItem),
  }
}

/** 响应式菜单数据，来自服务端 */
const menuStore = useMenuStore(pinia)

export const menuData = computed<MenuItem[]>(() => menuStore.menuItems.map(toSidebarMenuItem))

