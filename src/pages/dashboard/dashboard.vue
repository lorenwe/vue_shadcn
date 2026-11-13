<script setup lang="ts">
import { ref } from 'vue'
import Cascader from '@/components/cascader/cascader.vue'
import type { CascaderOption } from '@/components/cascader/types'
import TreeSelect from '@/components/tree-select/tree-select.vue'
import type { TreeNode } from '@/components/tree-select/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

defineOptions({ name: 'Dashboard' })

const parentId = ref<string | number | null>(null)
const region = ref<string | number | null>(null)
const hoverRegion = ref<string | number | null>(null)
const searchRegion = ref<string | number | null>(null)
const regionPath = ref<CascaderOption[]>([])
const searchRegionPath = ref<CascaderOption[]>([])

const fullTree: TreeNode[] = [
  {
    value: '1',
    label: '技术部',
    children: [
      { value: '1-1', label: '前端组', children: [{ value: '1-1-1', label: '基础架构' }] },
      { value: '1-2', label: '后端组' },
    ],
  },
  {
    value: '2',
    label: '产品部',
    children: [{ value: '2-1', label: '设计组' }],
  },
]

const regionOptions: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: '浙江省',
    children: [
      {
        value: 'hangzhou',
        label: '杭州市',
        children: [
          { value: 'xihu', label: '西湖区' },
          { value: 'yuhang', label: '余杭区' },
        ],
      },
      {
        value: 'ningbo',
        label: '宁波市',
        children: [{ value: 'haishu', label: '海曙区' }],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏省',
    children: [
      {
        value: 'nanjing',
        label: '南京市',
        children: [
          { value: 'xuanwu', label: '玄武区' },
          { value: 'jianye', label: '建邺区' },
        ],
      },
      {
        value: 'suzhou',
        label: '苏州市',
        children: [{ value: 'gusu', label: '姑苏区' }],
      },
    ],
  },
  {
    value: 'guangdong',
    label: '广东省',
    children: [
      {
        value: 'guangzhou',
        label: '广州市',
        children: [{ value: 'tianhe', label: '天河区' }],
      },
    ],
  },
]

function onRegionChange(_value: string | number | null, path: CascaderOption[]) {
  regionPath.value = path
}

function onSearchRegionChange(_value: string | number | null, path: CascaderOption[]) {
  searchRegionPath.value = path
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">
        组件用例
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        TreeSelect 树形选择 / Cascader 级联选择
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>TreeSelect</CardTitle>
          <CardDescription>
            单选树形下拉，支持搜索、选中路径回显和清除。
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <TreeSelect
            v-model="parentId"
            :data="fullTree"
            placeholder="选择所属父级部门..."
            clearable
          />
          <p class="text-sm text-muted-foreground">
            选中值：
            <span class="font-mono text-foreground">{{ parentId ?? '-' }}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cascader</CardTitle>
          <CardDescription>
            点击父级展开右侧列，点击叶子选中；首列保持窄宽度，逐级展开。
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <Cascader
            v-model="region"
            :options="regionOptions"
            placeholder="请选择地区"
            @change="onRegionChange"
          />
          <div class="space-y-1 text-sm text-muted-foreground">
            <p>
              选中值：
              <span class="font-mono text-foreground">{{ region ?? '-' }}</span>
            </p>
            <p>
              完整路径：
              <span class="text-foreground">
                {{ regionPath.map(item => item.label).join(' / ') || '-' }}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Cascader 搜索</CardTitle>
        <CardDescription>
          展开后在面板顶部输入关键字，按完整路径匹配；适合层级较深、选项较多的数据。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Cascader
          v-model="searchRegion"
          :options="regionOptions"
          placeholder="输入关键字搜索地区"
          searchable
          @change="onSearchRegionChange"
        />
        <div class="space-y-1 text-sm text-muted-foreground">
          <p>
            选中值：
            <span class="font-mono text-foreground">{{ searchRegion ?? '-' }}</span>
          </p>
          <p>
            完整路径：
            <span class="text-foreground">
              {{ searchRegionPath.map(item => item.label).join(' / ') || '-' }}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Cascader：悬停展开 + 允许选择任意层级</CardTitle>
        <CardDescription>
          `expand-trigger="hover"` + `change-on-select`：悬停展开下一列，父级也可直接选中。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Cascader
          v-model="hoverRegion"
          :options="regionOptions"
          placeholder="悬停展开并选择任意层级"
          expand-trigger="hover"
          change-on-select
          clearable
        />
        <p class="text-sm text-muted-foreground">
          选中值：
          <span class="font-mono text-foreground">{{ hoverRegion ?? '-' }}</span>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
