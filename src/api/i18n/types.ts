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
