import z from 'zod'

/** 用户列表项（/admin/user/list 返回的 VO） */
export const UserItemSchema = z
  .object({
    id: z.number(),
    sort: z.number(),
    username: z.string(),
    remark: z.string().nullable().optional(),
    create_at: z.number().nullable().optional(),
    update_at: z.number().nullable().optional(),
  })
  .passthrough()

export type UserItem = z.infer<typeof UserItemSchema>

/**
 * 分页响应。
 * 注意：后端 PageUtils 构造 PageResult 时参数顺序有误，
 * pages/page_num/page_size 三个字段语义与命名不一致；
 * 前端只依赖 list 和 total，分页状态由前端维护。
 */
export const UserListResponseSchema = z
  .object({
    list: z.array(UserItemSchema),
    total: z.number(),
    pages: z.number(),
    page_num: z.number(),
    page_size: z.number(),
  })
  .passthrough()

export type UserListResponse = z.infer<typeof UserListResponseSchema>

export interface UserListQuery {
  page_num: number
  page_size: number
  username?: string
  remark?: string
}

/** 新增 / 编辑用户的提交数据（JSON snake_case） */
export interface UserSavePayload {
  id?: number
  username: string
  /** 新增必填；编辑时留空表示不修改密码 */
  password?: string
  remark?: string
  sort: number
}
