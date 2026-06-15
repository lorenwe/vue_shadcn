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