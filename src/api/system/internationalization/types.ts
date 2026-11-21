import z from 'zod'

/**
 * 多语言词条（/language/list 接口返回，支持递归 children）
 * 字段与后端语言表对齐，四种语言各占一个字段
 */
export const LanguageListItemSchema: z.ZodType<{
  id: number
  parent_id?: number
  name: string
  sort?: number
  zhCN?: string | null
  enUS?: string | null
  jaJP?: string | null
  zhTW?: string | null
  remark?: string | null
  children?: z.infer<typeof LanguageListItemSchema>[]
}> = z
  .object({
    id: z.number(),
    parent_id: z.number().optional(),
    name: z.string(),
    sort: z.number().optional(),
    zhCN: z.string().nullable().optional(),
    enUS: z.string().nullable().optional(),
    jaJP: z.string().nullable().optional(),
    zhTW: z.string().nullable().optional(),
    remark: z.string().nullable().optional(),
    children: z.lazy(() => LanguageListItemSchema.array().optional()),
  })
  .passthrough()

export type LanguageListItem = z.infer<typeof LanguageListItemSchema>

/** 多语言词条列表（树形） */
export const LanguageListResponseSchema = z.array(LanguageListItemSchema)
export type LanguageListResponse = z.infer<typeof LanguageListResponseSchema>

/**
 * 新增 / 编辑语言词条的提交数据。
 * 字段名与后端 SysLanguage 实体一致；id、createBy、updateBy 由后端生成，不在此提交。
 */
export interface LanguageSavePayload {
  id?: number
  parentId: number
  sort: number
  name: string
  zhCN: string
  enUS: string
  jaJP: string
  zhTW: string
  remark?: string
}
