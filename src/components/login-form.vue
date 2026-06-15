<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
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
const authStore = useAuthStore()

const email = ref('123@123.com')
const password = ref('123')
const isLoading = ref(false)
const errors = ref<{ email?: string; password?: string }>({})

function validate(): boolean {
  errors.value = {}

  if (!email.value.trim()) {
    errors.value.email = '请输入邮箱地址'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = '请输入有效的邮箱地址'
  }

  if (!password.value) {
    errors.value.password = '请输入密码'
  } else if (password.value.length < 3) {
    errors.value.password = '密码至少需要 3 个字符'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return

  isLoading.value = true
  try {
    await authStore.login(email.value, password.value)
    toast.success('登录成功', {
      description: '欢迎回来！',
    })
    await router.push('/')
  } catch (error: any) {
    const message = error?.data?.message || error?.message || '登录失败，请检查邮箱和密码'
    toast.error('登录失败', {
      description: message,
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader>
        <CardTitle>登录您的账户</CardTitle>
        <CardDescription>
          请在下方输入您的电子邮件以登录您的账户
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit">
          <FieldGroup>
            <Field :data-invalid="!!errors.email">
              <FieldLabel for="email">
                邮箱
              </FieldLabel>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="m@example.com"
                :disabled="isLoading"
                required
              />
              <FieldError v-if="errors.email">{{ errors.email }}</FieldError>
            </Field>
            <Field :data-invalid="!!errors.password">
              <div class="flex items-center">
                <FieldLabel for="password">
                  密码
                </FieldLabel>
                <a
                  href="#"
                  class="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  忘记密码了?
                </a>
              </div>
              <Input
                id="password"
                v-model="password"
                type="password"
                :disabled="isLoading"
                required
              />
              <FieldError v-if="errors.password">{{ errors.password }}</FieldError>
            </Field>
            <Field>
              <Button type="submit" :disabled="isLoading">
                <UiSpinner v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
                {{ isLoading ? '登录中...' : '登录' }}
              </Button>
              <Button variant="outline" type="button" :disabled="isLoading">
                使用 Google 登录
              </Button>
              <FieldDescription class="text-center">
                没有账号？
                <a href="#">
                  注册
                </a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
