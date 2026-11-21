import z from 'zod'

/** 语言代码 */
export const LanguageSchema = z.enum(['zh-CN', 'en-US', 'ja-JP', 'zh-TW'])
export type Language = z.infer<typeof LanguageSchema>

/** 单语言消息：key → 文案（支持占位符如 {type}） */
export const MessagesSchema = z.record(z.string(), z.string())
export type Messages = z.infer<typeof MessagesSchema>

/**
 * 完整语言包：
 * API 一次性返回所有语言，结构为 { 'zh-CN': {...}, 'en-US': {...}, ... }
 */
export const LanguagePackSchema = z.record(LanguageSchema, MessagesSchema)
export type LanguagePack = z.infer<typeof LanguagePackSchema>

/**
 * 当前登录用户的菜单项（/admin/user/menu 接口返回，支持递归 children）
 */
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
}> = z.object({
  path: z.string(),
  id: z.number(),
  menu_id: z.number(),
  parent_id: z.number(),
  name: z.string(),
  name_tree: z.string(),
  icon: z.string().optional(),
  permission: z.string(),
  children: z.lazy(() => MenuItemSchema2.array().optional()),
})
export type MenuItem2 = z.infer<typeof MenuItemSchema2>

/**
 * 当前用户菜单 = 菜单项数组
 */
export const MenuResponseSchema2 = z.array(MenuItemSchema2)
export type MenuResponse2 = z.infer<typeof MenuResponseSchema2>
