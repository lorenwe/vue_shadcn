import z from 'zod'

/**
 * 多语言词条（/admin/api/list 接口返回，支持递归 children）
 * 字段与后端语言表对齐，四种语言各占一个字段
 */
export const AdminApiListItemSchema: z.ZodType<{
  id: number
  parent_id?: number
  method: string | null
  sort?: number
  api_name: string
  status: number
  api_path?: string | null
  api_type?: string | null
  children?: z.infer<typeof AdminApiListItemSchema>[]
}> = z
  .object({
    id: z.number(),
    parent_id: z.number().optional(),
    method: z.string().nullable(),
    sort: z.number().optional(),
    api_name: z.string(),
    status: z.number(),
    api_path: z.string().nullable().optional(),
    api_type: z.string().nullable().optional(),
    children: z.lazy(() => AdminApiListItemSchema.array().optional())
  })
  .passthrough()

export type AdminApiListItem = z.infer<typeof AdminApiListItemSchema>

/** 多语言词条列表（树形） */
export const AdminApiListResponseSchema = z.array(AdminApiListItemSchema)
export type AdminApiListResponse = z.infer<typeof AdminApiListResponseSchema>