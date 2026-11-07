import * as Icons from '@lucide/vue'

/**
 * 将 Lucide 的 PascalCase 组件名转为 kebab-case 图标名。
 * 例：FolderOpen -> folder-open、AArrowDown -> a-arrow-down、Trash2 -> trash-2
 */
export function toKebabCase(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .replace(/(\d)([A-Z])/g, '$1-$2')
    .toLowerCase()
}

/**
 * 归一化图标名：去掉 lucide:/mdi: 等前缀，兼容历史数据（lucide:settings -> settings）。
 */
export function normalizeIconName(name: string): string {
  return name.replace(/^[a-z0-9-]+:/i, '')
}

const namespace = Icons as unknown as Record<string, unknown>

/**
 * 全部 Lucide 图标名（kebab-case，已去重排序），供图标选择器枚举。
 * - 图标组件名均以大写开头（PascalCase），工具函数如 setLucideProps / useLucideProps 为小写开头；
 * - 每个图标同时存在 Xxx 与 XxxIcon 两种导出，只取无 Icon 后缀的 Xxx；
 * - 通过 import * as Icons 动态取成员，tree-shaking 无法裁剪，整套图标已在 bundle 内。
 */
export const LUCIDE_ICON_NAMES: string[] = Array.from(
  new Set(
    Object.keys(Icons)
      .filter((name) => /^[A-Z]/.test(name) && !name.endsWith('Icon') && typeof namespace[name] === 'function')
      .map(toKebabCase),
  ),
).sort()
