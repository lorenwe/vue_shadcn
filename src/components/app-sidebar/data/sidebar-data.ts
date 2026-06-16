import { AudioWaveformIcon, CommandIcon, GalleryVerticalEndIcon } from '@lucide/vue'

import pinia from '@/plugins/pinia/setup'
import { useMenuStore } from '@/stores/menu'
import { resolveIcon } from '@/utils/resolve-icon'
import type { MenuItem as ApiMenuItem } from '@/api/menu/types'

import type { MenuItem, NavIcon, SidebarData, Team, User } from '../types'

export const user: User = {
  name: 'shadcn',
  email: 'm@example.com',
  avatar: '/avatars/shadcn.jpg',
}

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

/** 向后兼容的静态包装 */
export const sidebarData: Omit<SidebarData, 'menuData'> = {
  user,
  teams,
  navMain: [],
}

// const { navData, menuData } = useSidebar()

// export const sidebarData: SidebarData = {
//   user,
//   teams,
//   navMain: navData.value!,
//   menuData: menuData.value!,
// }
