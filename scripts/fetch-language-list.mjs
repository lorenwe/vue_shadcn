#!/usr/bin/env node
/**
 * 刷新 docs/api/i18n/language-list.full.json
 *
 * 用法：
 *   API_BASE_URL=http://localhost:3333/api API_TOKEN=xxx node scripts/fetch-language-list.mjs
 *
 * PowerShell：
 *   $env:API_BASE_URL='http://localhost:3333/api'; $env:API_TOKEN='xxx'; node scripts/fetch-language-list.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const baseUrl = (process.env.API_BASE_URL ?? 'http://localhost:3333/api').replace(/\/+$/, '')
const token = process.env.API_TOKEN
const outputFile = resolve(process.cwd(), 'docs/api/i18n/language-list.full.json')

const headers = {}
if (token) {
  headers.Authorization = `Bearer ${token}`
}

const response = await fetch(`${baseUrl}/language/list`, {
  method: 'POST',
  headers,
})

if (!response.ok) {
  console.error(`[fetch-language-list] HTTP ${response.status} ${response.statusText}`)
  process.exit(1)
}

const payload = await response.json()
if (payload?.code !== 200) {
  console.error(`[fetch-language-list] 业务错误：code=${payload?.code} message=${payload?.message}`)
  process.exit(1)
}

await mkdir(dirname(outputFile), { recursive: true })
await writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

console.log(`[fetch-language-list] 已写入 ${outputFile}（${payload.data?.length ?? 0} 个根节点）`)
