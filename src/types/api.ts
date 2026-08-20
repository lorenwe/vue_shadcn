import z from 'zod'

// /**
//  * 服务端统一响应包装 — TypeScript 类型
//  * @template T — data 字段的实际类型
//  */
// export interface ApiResponse<T = unknown> {
//   code: number
//   message: string
//   data: T
// }

/**
 * 服务端统一响应包装 — zod schema 工厂
 * 用法：ApiResponseSchema(LoginResponseSchema).parse(res)
 */
export function ApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    code: z.number(),
    message: z.string(),
    data: dataSchema,
  })
}

// 推导出的类型（不需要手动定义接口）
export type ApiResponse<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof ApiResponseSchema<T>>
>

/**
 * 统一响应外层 schema：只校验 code/message，data 用 unknown 兜底
 * 用于「先判断业务码、再校验数据」的两步解析
 */
export const ApiEnvelopeSchema = z.object({
  code: z.number(),
  message: z.string().optional().default(''),
  data: z.unknown(),
})

// 推导出的类型（不需要手动定义接口）
export type ApiEnvelope = z.infer<typeof ApiEnvelopeSchema>

/**
 * 解析统一响应：先判断业务码，非成功码直接抛错（不做 data 校验），
 * 成功后才校验 data，避免错误响应因 data 缺失/结构不符而被误报成「校验错误」
 * @param res         接口原始返回
 * @param dataSchema  data 字段的校验 schema
 * @param successCode 成功业务码，默认 200
 */
export function parseApiResponse<T extends z.ZodTypeAny>(
  res: unknown,
  dataSchema: T,
  successCode = 200,
): z.infer<T> {
  const envelope = ApiEnvelopeSchema.safeParse(res)
  if (!envelope.success) {
    throw new Error('响应格式错误：无法解析 code/message')
  }
  const { code, message, data } = envelope.data
  if (code !== successCode) {
    throw new Error(message || `请求失败（code: ${code}）`)
  }
  return dataSchema.parse(data)
}

// 通用分页构造器
export function pageResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    list: z.array(itemSchema),
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1)
  })
}
type PageSchemaFactoryReturn<T extends z.ZodTypeAny> = ReturnType<typeof pageResponseSchema<T>>
export type PageResponse<T> = z.infer<PageSchemaFactoryReturn<z.ZodType<T>>>