<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { LoginRequestSchema } from '@/validators/auth.validator'
import type { ZodError } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()

const email = ref('123@123.com')
const password = ref('123')
const isLoading = ref(false)

// 字段级错误：每个字段可以有多条消息
const fieldErrors = ref<Record<string, string[]>>({})
// 通用错误（非字段级，如「服务端错误」）
const formError = ref('')

/** 触发过提交之后，才开始展示失焦验证错误，避免一进来就是满屏错误 */
const hasSubmitted = ref(false)

/**
 * 将 zod 错误写入 fieldErrors（按字段分组）
 */
function applyZodErrors(error: ZodError) {
  const next: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const field = typeof issue.path[0] === 'string' ? issue.path[0] : String(issue.path[0])
    if (!next[field]) next[field] = []
    next[field].push(issue.message)
  }
  fieldErrors.value = next
}

/** 清除单个字段的错误 */
function clearFieldError(field: string) {
  if (fieldErrors.value[field]) {
    const next = { ...fieldErrors.value }
    delete next[field]
    fieldErrors.value = next
  }
}

/** 校验单个字段（失焦用） */
function validateField(field: 'email' | 'password') {
  if (!hasSubmitted.value) return

  const result = LoginRequestSchema.safeParse({
    email: email.value,
    password: password.value,
  })

  if (result.success) {
    clearFieldError(field)
    return
  }

  const fieldMsgs = result.error.issues
    .filter((i) => i.path[0] === field)
    .map((i) => i.message)
  if (fieldMsgs.length > 0) {
    fieldErrors.value = {
      ...fieldErrors.value,
      [field]: fieldMsgs,
    }
  } else {
    clearFieldError(field)
  }
}

/** 全量校验 → 提交 */
async function handleSubmit() {
  hasSubmitted.value = true
  formError.value = ''
  fieldErrors.value = {}

  const result = LoginRequestSchema.safeParse({
    email: email.value,
    password: password.value,
  })

  if (!result.success) {
    applyZodErrors(result.error)
    // 聚焦第一个错误字段
    const firstIssue = result.error.issues[0]
    if (firstIssue) {
      const el = document.getElementById(firstIssue.path.join('-'))
      el?.focus()
    }
    return
  }

  isLoading.value = true
  try {
    await authStore.login(result.data.email, result.data.password)
    toast.success(t('login.success'), { description: t('login.welcome') })
    // 优先跳转到 redirect 参数指定的页面，其次首页
    const redirect = (route.query.redirect as string) || '/'
    await router.push(redirect)
  } catch (error: any) {
    const message = error?.data?.message || error?.message || t('login.checkCredentials')
    formError.value = message
    toast.error(t('login.failed'), { description: message })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader>
        <CardTitle>{{ t('login.title') }}</CardTitle>
        <CardDescription>
          {{ t('login.description') }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" novalidate>
          <FieldGroup>
            <!-- 邮箱 -->
            <Field :data-invalid="hasSubmitted && !!fieldErrors.email?.length">
              <FieldLabel for="email">{{ t('login.email') }}</FieldLabel>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="t('login.emailPlaceholder')"
                :disabled="isLoading"
                required
                @blur="validateField('email')"
                @input="clearFieldError('email')"
              />
              <FieldError v-if="fieldErrors.email?.length" :errors="fieldErrors.email" />
            </Field>

            <!-- 密码 -->
            <Field :data-invalid="hasSubmitted && !!fieldErrors.password?.length">
              <div class="flex items-center">
                <FieldLabel for="password">{{ t('login.password') }}</FieldLabel>
                <a
                  href="#"
                  class="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  {{ t('login.forgotPassword') }}
                </a>
              </div>
              <Input
                id="password"
                v-model="password"
                type="password"
                :disabled="isLoading"
                required
                @blur="validateField('password')"
                @input="clearFieldError('password')"
              />
              <FieldError v-if="fieldErrors.password?.length" :errors="fieldErrors.password" />
            </Field>

            <!-- 表单级通用错误 -->
            <div
              v-if="formError"
              class="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {{ formError }}
            </div>

            <Field>
              <Button type="submit" :disabled="isLoading" class="w-full">
                <UiSpinner v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
                {{ isLoading ? t('login.submitting') : t('login.submit') }}
              </Button>
              <Button variant="outline" type="button" :disabled="isLoading" class="w-full">
                {{ t('login.googleLogin') }}
              </Button>
              <FieldDescription class="text-center">
                {{ t('login.noAccount') }}
                <a href="#">{{ t('register') }}</a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
