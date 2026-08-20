import z from 'zod'

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
