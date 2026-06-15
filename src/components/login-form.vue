<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
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
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel for="email">
                邮箱
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                default-value="123@123.com"
                required
              />
            </Field>
            <Field>
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
              <Input id="password" type="password" required default-value="123" />
            </Field>
            <Field>
              <Button type="submit">
                登录
              </Button>
              <Button variant="outline" type="button">
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
