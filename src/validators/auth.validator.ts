import z from 'zod'

/**
 * 登录请求参数校验
 */
export const LoginRequestSchema = z.object({
  email: z.email('请输入有效的邮箱地址'),
  password: z.string()
    .min(1, '请输入密码')
    .min(3, '密码至少需要 3 个字符'),
})

/**
 * 用户信息校验
 */
export const UserInfoSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
})

/**
 * 登录响应 data 字段校验
 */
export const LoginResponseSchema = z.object({
  token: z.string(),
  user: UserInfoSchema,
})

