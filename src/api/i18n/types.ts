import z from 'zod'

/**
 * 语言包：key → 文案 的扁平映射
 */
export const LanguagePackSchema = z.record(z.string(), z.string())
export type LanguagePack = z.infer<typeof LanguagePackSchema>

/**
 * 获取语言包请求参数
 */
export const FetchPackRequestSchema = z.object({
  locale: z.string(),
})
export type FetchPackRequest = z.infer<typeof FetchPackRequestSchema>
