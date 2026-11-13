# Cascader 级联选择器

用 shadcn-vue 的基础组件组合出的 Ant Design Cascader 风格组件：

- `Popover`：桌面端下拉容器
- `Sheet`：移动端底部 Drawer
- `Button`：触发器
- `Input`：搜索
- 自定义横向列：每列一个 `overflow-y-auto` 列表
- `lucide` 图标：展开箭头、选中、清除、返回

## 与 Ant Design Cascader 的对应关系

| Ant Design | 本实现 |
|---|---|
| 触发器 + 路径回显 | `Button`，路径用 `separator` 拼接 |
| 多列面板 | `flex` 横向列，点击/悬停展开下一列 |
| `expandTrigger="click" \| "hover"` | `expandTrigger` prop |
| `changeOnSelect` | `changeOnSelect` prop |
| `allowClear` | `clearable` prop + `XIcon` |
| `showSearch` | `searchable` prop + 平铺路径搜索结果 |
| `displayRender` | 暂未实现，可直接改 `displayText` |
| `loadData` 懒加载 | 暂未实现（见“扩展”） |
| `multiple` 多选 | 暂未实现 |
| 移动端适配 | `< 768px` 自动切换为底部 Drawer 单列下钻 |

## 使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Cascader from '@/components/cascader/cascader.vue'
import type { CascaderOption } from '@/components/cascader/types'

const value = ref<string | number | null>(null)

const options: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [
          { value: 'xihu', label: '西湖' },
          { value: 'yuhang', label: '余杭' },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      { value: 'nanjing', label: '南京' },
    ],
  },
]
</script>

<template>
  <Cascader
    v-model="value"
    :options="options"
    placeholder="请选择地区"
    expand-trigger="click"
  />
</template>
```

`value` 为最后一级选中值；同时会触发 `change(value, selectedOptions)`，方便拿到完整路径。

## Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `modelValue` | `string \| number \| null` | — | 选中值 |
| `options` | `CascaderOption[]` | 必填 | 级联数据 |
| `placeholder` | `string` | `请选择` | 未选中文案 |
| `searchPlaceholder` | `string` | `搜索选项...` | 搜索框 placeholder |
| `emptyText` | `string` | `暂无匹配项` | 空结果文案 |
| `separator` | `string` | ` / ` | 路径分隔符 |
| `disabled` | `boolean` | `false` | 禁用 |
| `clearable` | `boolean` | `true` | 显示清除按钮 |
| `searchable` | `boolean` | `false` | 显示搜索框（默认关闭，保持首列窄宽度） |
| `changeOnSelect` | `boolean` | `false` | 是否允许选择非叶子节点 |
| `expandTrigger` | `'click' \| 'hover'` | `'click'` | 展开下一列的方式 |
| `showPath` | `boolean` | `true` | 触发器是否显示完整路径；`false` 时只显示最后一级名称 |
| `selectCurrentText` | `string` | `选择当前` | 移动端选择父级时的按钮文案 |

```ts
interface CascaderOption {
  value: string | number
  label: string
  children?: CascaderOption[]
  disabled?: boolean
  isLeaf?: boolean
  [key: string]: any
}
```

## 事件

| 事件 | 参数 | 说明 |
|---|---|---|
| `update:modelValue` | `string \| number \| null` | 选中/清除 |
| `change` | `value, selectedOptions` | 选中值 + 完整路径 |

## 实现要点

0. 宽度与参考项目（shadcn-vue-cascader）一致：`PopoverContent` 使用
   `w-auto max-w-none p-0`，每列 `min-w-[140px]` 由内容撑开，因此首级只有约
   140px，展开下一列后才向右增宽；列高上限 300px。
1. `selectedPath` 由 `modelValue` 在树中递归查找得到，用于回显路径和展开祖先列。
2. `activePath` 表示当前展开到哪条路径；`columns` 根据它计算：
   - 第 1 列永远是根 options；
   - 第 N 列是 `activePath[N-2].children`。
3. 点击父节点展开下一列；叶子节点才 `selectPath()` 并关闭。
   - `changeOnSelect` + `expandTrigger="click"`：点击父级只展开，当前展开项高亮，
     面板底部出现「选择当前：xxx」，点击后选中该父级；
   - `changeOnSelect` + `expandTrigger="hover"`：悬停展开，点击父级直接选中。
4. 搜索模式把整棵树拍平成完整路径，按任意一级 label 匹配，点击结果直接选中。
5. 清除按钮在 `click` 上阻止冒泡，避免触发 Popover 打开。

## 移动端 Drawer

- 断点：`useBreakpoints({ md: 768 })`，小于 768px 时切换为 `Sheet side="bottom"`。
- 单列逐级下钻：点击父级进入下一级，左上角返回上一级；选中叶子后关闭并回显完整路径。
- 选中项在抽屉中显示勾选；`changeOnSelect` 开启时，父级行仍逐级下钻，
  抽屉头部显示「选择当前」，点击后选中当前父级并关闭。
- 触发器显示：`showPath=false` 时只显示最后一级名称，不显示完整路径。
- 移动端暂不显示搜索框（搜索仍可在桌面端使用）。
- 断点变化时自动关闭下拉，避免 Popover / Sheet 同时打开。

## 搜索

- `searchable` 开启后，面板顶部出现搜索框；输入关键字后按**任意一级 label** 匹配。
- 搜索结果展示完整路径（如「浙江省 / 杭州市 / 西湖区」），点击直接选中并关闭。
- 最多展示 50 条结果，避免大数据量渲染卡顿。
- 默认关闭：关闭时首级保持约 140px 的窄宽度；开启后因搜索框存在，首级约 184px。

```vue
<Cascader
  v-model="value"
  :options="options"
  placeholder="输入关键字搜索地区"
  searchable
/>
```

## 扩展

- **懒加载**：给 `CascaderOption` 增加 `isLeaf`，在 `handleOptionClick` 发现 `children` 为空且 `isLeaf !== true` 时调用 `loadData`，把结果写回选项（建议维护 `Map<pathKey, CascaderOption[]>`，避免直接改 props）。
- **多选**：把 `modelValue` 改成数组，选中时 toggle `pathKey`，触发器展示 `已选 N 项`。
- **自定义展示**：替换 `displayText` 计算属性，或在组件外使用 `change` 事件拿到路径自行渲染。
- **键盘导航**：当前列内可用 Tab/Enter 操作；如需方向键跨列，需要在面板上维护高亮索引并监听 `keydown`。

## 已知限制

- 单选，未实现 `multiple`。
- 未实现 `loadData` 懒加载。
- 未实现方向键跨列导航。
- 搜索最多展示 50 条结果，避免大数组渲染卡顿。
- 移动端暂不展示搜索框。
