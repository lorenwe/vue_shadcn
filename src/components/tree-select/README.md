# TreeSelect 多级选择器

树形下拉选择组件，支持展开/收起、搜索、回显选中路径、禁用节点、清除选择和可选的远程子级加载。

## 目录

```text
src/components/tree-select/
├─ tree-select.vue     入口：Popover + 搜索 + 树
├─ tree-node.vue       递归节点：展开、选中、禁用、加载态
├─ use-tree-select.ts  搜索过滤、远程加载、loading 状态
├─ types.ts            TreeNode 类型
└─ README.md
```

## 使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import TreeSelect from '@/components/tree-select/tree-select.vue'
import type { TreeNode } from '@/components/tree-select/types'

const parentId = ref<string | number | null>(null)

const tree: TreeNode[] = [
  {
    value: 1,
    label: '系统设置',
    children: [
      { value: 2, label: '菜单管理' },
      { value: 3, label: '多语言管理' },
    ],
  },
]
</script>

<template>
  <TreeSelect
    v-model="parentId"
    :data="tree"
    placeholder="请选择父级"
    clearable
  />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `modelValue` | `string \| number \| null` | — | 选中值 |
| `data` | `TreeNode[]` | 必填 | 树数据 |
| `placeholder` | `string` | `请选择父级节点...` | 未选中时的展示文案 |
| `searchPlaceholder` | `string` | `搜索节点...` | 搜索框 placeholder |
| `emptyText` | `string` | `未找到匹配的节点` | 无匹配结果文案 |
| `clearable` | `boolean` | `false` | 是否显示「清除选择」 |
| `clearText` | `string` | `清除选择` | 清除按钮文案 |
| `disabled` | `boolean` | `false` | 禁用整个选择器 |
| `loadChildren` | `(node) => Promise<TreeNode[]>` | — | 远程加载子级；提供后未加载节点显示展开箭头 |

`TreeNode`：

```ts
interface TreeNode {
  value: string | number
  label: string
  disabled?: boolean
  children?: TreeNode[]
  isLeaf?: boolean // 远程加载时标记无子节点
  [key: string]: any
}
```

## 事件

| 事件 | 参数 | 说明 |
|---|---|---|
| `update:modelValue` | `string \| number \| null` | 选中节点或清除时触发 |

## 行为说明

- **受控展开**：展开状态统一由 `tree-select.vue` 的 `expandedValues` 维护，搜索过滤或数据刷新不会丢失。
- **搜索自动展开**：输入关键字后，自动展开所有命中的父级路径，匹配节点直接可见。
- **回显自动展开**：打开下拉或选中值变化时，自动展开该节点的祖先路径。
- **叶子判定**：静态数据中 `children` 不存在或为空即叶子；只有传入 `loadChildren` 时才把未加载节点视为「可能有子级」，避免所有叶子都出现展开箭头。
- **禁用节点**：`node.disabled` 的节点不可选中，但仍可展开查看子级。
- **清除选择**：`clearable` 时显示清除按钮，触发 `update:modelValue(null)`。
- **宽度对齐**：打开时按触发按钮宽度设置下拉宽度，最小 240px。
- **加载状态**：`loadingValues` 使用 `reactive(Set)`，远程加载时节点图标会正确切换为 loading。

## 已知限制

- 搜索输入框使用普通 `Input`（避免与 Command 内部过滤状态冲突），因此搜索框内不支持方向键在树节点间移动；鼠标点击/Tab 仍可操作。
- 远程加载与搜索同时使用时，加载到的子级挂在过滤后的节点副本上，不会回写原始数据；如需该组合，请让 `loadChildren` 返回一次性完整子树。
