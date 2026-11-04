import { h } from 'vue'
import {
  LayoutDashboardIcon,
  UsersIcon,
  UserCogIcon,
  MenuIcon,
  FileTextIcon,
  FolderTreeIcon,
  SettingsIcon,
  ShieldCheckIcon,
  PaletteIcon,
  ScrollTextIcon,
  TagIcon,
  BellIcon,
  MessagesSquareIcon,
  LogsIcon,
} from '@lucide/vue'

export interface MenuNode {
  id: string
  title: string
  url?: string
  icon?: any
  subRows?: MenuNode[]
}

/**
 * 模拟菜单树数据 —— 三级嵌套结构
 */
export const menuTreeData: MenuNode[] = [
  {
    id: '1',
    title: '系统管理',
    icon: h(SettingsIcon, { class: 'size-4 text-sky-500' }),
    subRows: [
      {
        id: '1-1',
        title: '用户管理',
        icon: h(UsersIcon, { class: 'size-4 text-blue-500' }),
        url: '/user',
        subRows: [
          {
            id: '1-1-1',
            title: '用户列表',
            icon: h(ScrollTextIcon, { class: 'size-4 text-gray-400' }),
            url: '/user',
          },
          {
            id: '1-1-2',
            title: '用户角色',
            icon: h(UserCogIcon, { class: 'size-4 text-gray-400' }),
            url: '/user/role',
          },
        ],
      },
      {
        id: '1-2',
        title: '菜单管理',
        icon: h(MenuIcon, { class: 'size-4 text-emerald-500' }),
        url: '/menu',
        subRows: [
          {
            id: '1-2-1',
            title: '菜单列表',
            icon: h(FolderTreeIcon, { class: 'size-4 text-gray-400' }),
            url: '/menu/list',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: '内容管理',
    icon: h(FileTextIcon, { class: 'size-4 text-orange-500' }),
    subRows: [
      {
        id: '2-1',
        title: '文章管理',
        icon: h(FileTextIcon, { class: 'size-4 text-violet-500' }),
        url: '/article',
      },
      {
        id: '2-2',
        title: '分类管理',
        icon: h(TagIcon, { class: 'size-4 text-rose-500' }),
        url: '/category',
        subRows: [
          {
            id: '2-2-1',
            title: '技术文章',
            icon: h(TagIcon, { class: 'size-4 text-gray-400' }),
            url: '/category/tech',
          },
          {
            id: '2-2-2',
            title: '产品动态',
            icon: h(TagIcon, { class: 'size-4 text-gray-400' }),
            url: '/category/product',
          },
          {
            id: '2-2-3',
            title: '帮助文档',
            icon: h(TagIcon, { class: 'size-4 text-gray-400' }),
            url: '/category/help',
          },
        ],
      },
    ],
  },
  {
    id: '3',
    title: '系统设置',
    icon: h(SettingsIcon, { class: 'size-4 text-slate-500' }),
    subRows: [
      {
        id: '3-1',
        title: '基本设置',
        icon: h(PaletteIcon, { class: 'size-4 text-pink-500' }),
        url: '/settings/basic',
      },
      {
        id: '3-2',
        title: '权限设置',
        icon: h(ShieldCheckIcon, { class: 'size-4 text-amber-500' }),
        url: '/settings/permission',
        subRows: [
          {
            id: '3-2-1',
            title: '角色权限',
            icon: h(ShieldCheckIcon, { class: 'size-4 text-gray-400' }),
            url: '/settings/permission/role',
          },
          {
            id: '3-2-2',
            title: '接口权限',
            icon: h(LogsIcon, { class: 'size-4 text-gray-400' }),
            url: '/settings/permission/api',
          },
        ],
      },
    ],
  },
  {
    id: '4',
    title: '消息中心',
    icon: h(BellIcon, { class: 'size-4 text-red-500' }),
    url: '/messages',
    subRows: [
      {
        id: '4-1',
        title: '系统通知',
        icon: h(MessagesSquareIcon, { class: 'size-4 text-gray-400' }),
        url: '/messages/system',
      },
      {
        id: '4-2',
        title: '用户反馈',
        icon: h(MessagesSquareIcon, { class: 'size-4 text-gray-400' }),
        url: '/messages/feedback',
      },
    ],
  },
  {
    id: '5',
    title: '仪表盘',
    icon: h(LayoutDashboardIcon, { class: 'size-4 text-indigo-500' }),
    url: '/dashboard',
  },
]
