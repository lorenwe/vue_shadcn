import z from 'zod'
import type { Language } from '@/api/i18n/types'

/**
 * 菜单项 meta 元数据 schema
 */
export const MenuMetaSchema = z.object({
  auth: z.string().optional(),      // 权限标识
  layout: z.string().optional(),    // 布局配置
  // 可以根据需要添加更多字段
}).passthrough() // 允许额外字段

/**
 * 菜单项 zod schema（支持递归子菜单）
 * icon 字段为字符串，由前端 resolveIcon 转为组件
 */
export const MenuItemSchema: z.ZodType<{
  title: string
  url?: string
  icon?: string
  items?: z.infer<typeof MenuItemSchema>[]
  meta?: Record<string, any>  // 宽松的 meta 类型
}> = z.object({
  title: z.string(),
  url: z.string().optional(),
  icon: z.string().optional(),
  meta: z.record(z.string(), z.any()).optional(),  // 任意键值对
  items: z.lazy(() => MenuItemSchema.array().optional()),
})

export type MenuItem = z.infer<typeof MenuItemSchema>

/**
 * 服务端返回的完整菜单数据 = 菜单项数组
 */
export const MenuResponseSchema = z.array(MenuItemSchema)
export type MenuResponse = z.infer<typeof MenuResponseSchema>

export const MenuItemSchema2: z.ZodType<{
  path: string
  id: number
  menu_id: number
  parent_id: number
  name: string
  name_tree: string
  icon?: string
  permission: string
  children?: z.infer<typeof MenuItemSchema2>[]
  // meta?: Record<string, any>  // 宽松的 meta 类型
}> = z.object({
  path: z.string(),
  id: z.number(),
  menu_id: z.number(),
  parent_id: z.number(),
  name: z.string(),
  name_tree: z.string(),
  icon: z.string().optional(),
  permission: z.string(),
  // meta: z.record(z.string(), z.any()).optional(),  // 任意键值对
  children: z.lazy(() => MenuItemSchema2.array().optional()),
})
export type MenuItem2 = z.infer<typeof MenuItemSchema2>

/**
 * 服务端返回的完整菜单数据 = 菜单项数组
 */
export const MenuResponseSchema2 = z.array(MenuItemSchema2)
export type MenuResponse2 = z.infer<typeof MenuResponseSchema2>

/**
 * 菜单翻译字段（/menu/list 接口返回，键为语言代码）
 */
export type MenuTranslations = Record<Language, string | null | undefined>

/**
 * 菜单管理列表项（/menu/list 接口返回，支持递归 children）
 * 字段与后端 sys_menu 表对齐，翻译字段由语言表联表返回
 */
export const MenuListItemSchema: z.ZodType<{
  id: number
  parent_id?: number
  language_id?: number | null
  menu_type: string
  menu_api?: string | null
  component?: string | null
  path?: string | null
  icon?: string | null
  permission?: string | null
  sort?: number
  status?: number
  redirect?: string | null
  target?: string | null
  children?: z.infer<typeof MenuListItemSchema>[]
  'en-US'?: string | null
  'ja-JP'?: string | null
  'zh-CN'?: string | null
  'zh-TW'?: string | null
}> = z.object({
  id: z.number(),
  parent_id: z.number().optional(),
  language_id: z.number().nullable().optional(),
  menu_type: z.string(),
  menu_api: z.string().nullable().optional(),
  component: z.string().nullable().optional(),
  path: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  permission: z.string().nullable().optional(),
  sort: z.number().optional(),
  status: z.number().optional(),
  redirect: z.string().nullable().optional(),
  target: z.string().nullable().optional(),
  children: z.lazy(() => MenuListItemSchema.array().optional()),
  'en-US': z.string().nullable().optional(),
  'ja-JP': z.string().nullable().optional(),
  'zh-CN': z.string().nullable().optional(),
  'zh-TW': z.string().nullable().optional(),
}).passthrough()

export type MenuListItem = z.infer<typeof MenuListItemSchema>

/**
 * 菜单管理列表 = 菜单项数组
 */
export const MenuListResponseSchema = z.array(MenuListItemSchema)
export type MenuListResponse = z.infer<typeof MenuListResponseSchema>
