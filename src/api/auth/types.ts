import z from 'zod'
import type { LoginRequestSchema, LoginResponseSchema, UserInfoSchema } from '@/validators/auth.validator'

/**
 * 登录相关类型 — 从 zod schema 推导，单一数据源
 * 运行时校验逻辑位于 @/validators/auth.validator
 */
export type LoginRequest = z.infer<typeof LoginRequestSchema>

export type UserInfo = z.infer<typeof UserInfoSchema>

export type LoginResponse = z.infer<typeof LoginResponseSchema>
