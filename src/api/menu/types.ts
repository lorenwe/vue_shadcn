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
