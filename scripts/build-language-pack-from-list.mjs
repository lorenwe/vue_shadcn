#!/usr/bin/env node
/**
 * 从 language-list.full.json 生成运行时语言包快照
 *
 * /language/allLocales 的 key 规则：语言词条树按 name 用 "." 连接，
 * 例如 pages → system → menu-management → name 即为
 * "pages.system.menu-management.name"。
 *
 * 该脚本用于后端不可用、或需要离线重建 language-pack 快照时；
 * 真实接口可用时，请优先运行 scripts/fetch-language-pack.mjs。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const LIST_FILE = 'docs/api/i18n/language-list.full.json'
const FULL_FILE = 'docs/api/i18n/language-pack.full.json'
const SAMPLE_FILE = 'docs/api/i18n/language-pack.sample.json'
const META_FILE = 'docs/api/i18n/language-pack.meta.json'

const LOCALES = [
  ['zh-CN', 'zhCN'],
  ['en-US', 'enUS'],
  ['ja-JP', 'jaJP'],
  ['zh-TW', 'zhTW'],
]

const source = JSON.parse(readFileSync(LIST_FILE, 'utf8'))
const entries = new Map()

function walk(nodes, prefix) {
  for (const node of nodes) {
    const key = prefix ? `${prefix}.${node.name}` : node.name
    const existing = entries.get(key)
    if (!existing) {
      const item = {}
      for (const [locale, field] of LOCALES) {
        item[locale] = node[field] ?? null
      }
      entries.set(key, item)
    } else {
      // 同一路径重复出现时，只补齐缺失的翻译，不覆盖已有值
      for (const [locale, field] of LOCALES) {
        if (existing[locale] == null) {
          existing[locale] = node[field] ?? null
        }
      }
    }
    if (node.children?.length) {
      walk(node.children, key)
    }
  }
}

walk(source.data, '')

const sortedKeys = [...entries.keys()].sort()

function buildPack(keys) {
  const data = Object.fromEntries(LOCALES.map(([locale]) => [locale, {}]))
  for (const key of keys) {
    const item = entries.get(key)
    for (const [locale] of LOCALES) {
      const value = item[locale]
      if (typeof value === 'string') {
        data[locale][key] = value
      }
    }
  }
  return {
    code: source.code,
    message: source.message,
    data,
  }
}

const full = buildPack(sortedKeys)

// 精简样例：菜单、表格、国际化模块、上传组件等代表性命名空间
const samplePrefixes = [
  'menu.system',
  'global.table',
  'pages.system.menu-management',
  'pages.system.internationalization',
  'components.UploadImage',
]
const sampleKeySet = new Set()
for (const prefix of samplePrefixes) {
  for (const key of sortedKeys) {
    if (key === prefix || key.startsWith(`${prefix}.`)) {
      sampleKeySet.add(key)
    }
  }
}
const sampleKeys = [...sampleKeySet]

const sample = buildPack(sampleKeys)

writeFileSync(FULL_FILE, `${JSON.stringify(full, null, 2)}\n`, 'utf8')
writeFileSync(SAMPLE_FILE, `${JSON.stringify(sample, null, 2)}\n`, 'utf8')
writeFileSync(
  META_FILE,
  `${JSON.stringify({
    source: 'derived-from-list',
    derivedFrom: LIST_FILE,
    generatedAt: new Date().toISOString(),
    note: '真实 /language/allLocales 响应请用 scripts/fetch-language-pack.mjs 覆盖',
  }, null, 2)}\n`,
  'utf8',
)

console.log(`[build-language-pack] keys=${sortedKeys.length} sampleKeys=${sampleKeys.length}`)
console.log(`[build-language-pack] 已写入 ${FULL_FILE}`)
