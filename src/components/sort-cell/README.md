# SortCell 可编辑排序单元格

点击排序值后变成数字输入框，提交时调用页面配置的接口。

## 用法

```vue
<script setup lang="ts">
import SortCell from '@/components/sort-cell/sort-cell.vue'
import { updateUserSortApi } from '@/api/system/user-management/user-api'

function onSortUpdated() {
  loadList()
}
</script>

<template>
  <SortCell
    :id="row.id"
    :value="row.sort"
    :update="payload => updateUserSortApi({ id: Number(payload.id), sort: payload.sort })"
    @saved="onSortUpdated"
  />
</template>
```

`update` 接收统一参数：

```ts
interface SortUpdatePayload {
  id: string | number
  sort: number
}
```

不同接口只需在页面侧做适配，例如：

```ts
:update="payload => updateMenuSortApi({ menu_id: payload.id, sort: payload.sort })"
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `id` | `string \| number` | 必填 | 当前行主键 |
| `value` | `number` | 必填 | 当前排序值 |
| `update` | `(payload: SortUpdatePayload) => Promise<void>` | 必填 | 当前页面的排序保存接口 |
| `min` | `number` | `0` | 最小值 |
| `disabled` | `boolean` | `false` | 是否禁用编辑 |
| `successMessage` | `string` | `排序修改成功` | 成功提示 |
| `invalidMessage` | `string` | `排序值必须为大于等于 0 的整数` | 校验失败提示 |
| `hint` | `string` | `点击修改排序` | 悬浮提示 / aria-label |

## Events

| 事件 | 参数 | 说明 |
|---|---|---|
| `saved` | `value: number` | 接口保存成功后触发，页面可据此刷新列表或更新行数据 |

## 后端字段名不是 id / sort

组件内部统一使用：

```ts
{ id, sort }
```

它不直接发请求，也不会把字段名写死。字段名不一致时，由页面的 `update`
适配函数做映射即可。

例如后端接口接收 `menu_id` 和 `order_value`：

```vue
<SortCell
  :id="row.menu_id"
  :value="row.order_value"
  :update="payload => updateMenuSortApi({
    menu_id: payload.id,
    order_value: payload.sort,
  })"
  @saved="reload"
/>
```

对应接口：

```ts
async function updateMenuSortApi(payload: {
  menu_id: number
  order_value: number
}) {
  await apiFetch('/menu/sort', { method: 'POST', body: payload })
}
```

同理：

- 唯一 ID 叫 `uuid` / `menu_id` / `role_id`：传给组件的 `id` 即可；
- 排序字段叫 `order` / `order_value` / `sort_num`：传给组件的 `value` 即可；
- 接口需要额外字段（如 `type`、`tenant_id`）：在 `update` 适配函数里补齐；
- 接口需要嵌套结构：也在 `update` 里组装。

因此不需要给组件增加 `idKey` / `sortKey` 这类配置；`update` 回调本身就是
接口适配层，可以处理任意字段名和请求结构。

## 行为

- 点击数字进入编辑态，自动聚焦并选中；
- Enter 或失焦提交；
- Esc 取消；
- 值未变化时不调用接口；
- 接口失败时保持编辑态，可重试或按 Esc 取消。
