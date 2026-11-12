#!/usr/bin/env node
/**
 * 抓取 /language/allLocales 并覆盖 docs/api/i18n/language-pack.full.json
 *
 * 用法：
 *   API_BASE_URL=http://localhost:3333/api API_TOKEN=xxx node scripts/fetch-language-pack.mjs
 *
 * PowerShell：
 *   $env:API_BASE_URL='http://localhost:3333/api'; $env:API_TOKEN='xxx'; node scripts/fetch-language-pack.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const baseUrl = (process.env.API_BASE_URL ?? 'http://localhost:3333/api').replace(/\/+$/, '')
const token = process.env.API_TOKEN
const outputFile = resolve(process.cwd(), 'docs/api/i18n/language-pack.full.json')
const metaFile = resolve(process.cwd(), 'docs/api/i18n/language-pack.meta.json')

const headers = {}
if (token) {
  headers.Authorization = `Bearer ${token}`
}

const response = await fetch(`${baseUrl}/language/allLocales`, {
  method: 'POST',
  headers,
})

if (!response.ok) {
  console.error(`[fetch-language-pack] HTTP ${response.status} ${response.statusText}`)
  process.exit(1)
}

const payload = await response.json()
if (payload?.code !== 200) {
  console.error(`[fetch-language-pack] 业务错误：code=${payload?.code} message=${payload?.message}`)
  process.exit(1)
}

if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) {
  console.error('[fetch-language-pack] data 不是 locale → 文案 映射对象')
  process.exit(1)
}

await mkdir(dirname(outputFile), { recursive: true })
await writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
await writeFile(
  metaFile,
  `${JSON.stringify({
    source: 'allLocales',
    endpoint: `${baseUrl}/language/allLocales`,
    fetchedAt: new Date().toISOString(),
  }, null, 2)}\n`,
  'utf8',
)

console.log(`[fetch-language-pack] 已写入 ${outputFile}（locales: ${Object.keys(payload.data).join(', ')}）`)
