import z from 'zod'

/** 角色列表项（/role/list 返回的 VO） */
export const RoleItemSchema = z
  .object({
    id: z.number(),
    role_name: z.string(),
    role_code: z.string(),
    sort: z.number(),
    status: z.number(),
    remark: z.string().nullable().optional(),
    role_menu: z.array(z.number()).optional(),
    create_at: z.number().nullable().optional(),
    update_at: z.number().nullable().optional(),
  })
  .passthrough()

export type RoleItem = z.infer<typeof RoleItemSchema>

export const RoleListResponseSchema = z
  .object({
    list: z.array(RoleItemSchema),
    total: z.number(),
    pages: z.number(),
    page_num: z.number(),
    page_size: z.number(),
  })
  .passthrough()

export type RoleListResponse = z.infer<typeof RoleListResponseSchema>

export interface RoleListQuery {
  page_num: number
  page_size: number
  role_name?: string
  role_code?: string
  status?: number
}

/** 新增 / 编辑角色的提交数据（JSON snake_case） */
export interface RoleSavePayload {
  id?: number
  role_name: string
  role_code: string
  role_menu: number[]
  sort: number
  status: number
  remark?: string
}
