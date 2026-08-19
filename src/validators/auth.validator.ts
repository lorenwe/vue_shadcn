import z from 'zod'

/**
 * 登录请求参数校验
 */
export const LoginRequestSchema = z.object({
  username: z.string()
    .min(1, '请输入用户名')
    .min(3, '用户名至少需要 3 个字符'),
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
  // user: UserInfoSchema,
})

