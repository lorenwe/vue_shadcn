<script lang="ts" setup>
import TreeCheckbox from '@/components/tree-node/tree-node.vue'

defineOptions({ name: 'Home' })

const items2 = [
  {
    id: 'system',
    title: '系统管理',
    icon: 'lucide:settings',
    children: [
      { id: 'system-user', title: '用户管理', icon: 'lucide:users' },
      { id: 'system-role', title: '角色管理', icon: 'lucide:shield' },
      {
        id: 'system-permission',
        title: '权限管理',
        icon: 'lucide:lock',
        children: [
          { id: 'permission-view', title: '查看权限', icon: 'lucide:eye' },
          { id: 'permission-edit', title: '编辑权限', icon: 'lucide:pencil' },
          { id: 'permission-delete', title: '删除权限', icon: 'lucide:trash-2' },
        ],
      },
    ],
  },
  {
    id: 'content',
    title: '内容管理',
    icon: 'lucide:file-text',
    children: [
      { id: 'content-article', title: '文章管理', icon: 'lucide:file' },
      { id: 'content-category', title: '分类管理', icon: 'lucide:tag' },
      { id: 'content-tag', title: '标签管理', icon: 'lucide:hash' },
    ],
  },
  {
    id: 'settings',
    title: '系统设置',
    icon: 'lucide:sliders',
    children: [
      { id: 'settings-basic', title: '基本设置', icon: 'lucide:settings' },
      { id: 'settings-security', title: '安全设置', icon: 'lucide:shield-check' },
    ],
  },
]

// 默认选中的权限
const defaultChecked: string[] = []
// ✅ 使用 ref 使其响应式
const checkeds = ref<Array<string | number>>([])

function handleCheckedChange(checked: Array<string | number>) {
  checkeds.value = checked  // ✅ 通过 .value 赋值
  console.log('选中的权限:', checked)
}

function handleChange(checked: Array<string | number>, item: { title: string }) {
  console.log('权限变化:', item.title, checked)
}
</script>

<template>
    <div class="p-8">
    <h2 class="text-lg font-bold mb-4">权限管理</h2>
    <TreeCheckbox
      :items="items2"
      :default-checked="defaultChecked"
      @update:checked="handleCheckedChange"
      @change="handleChange"
    />
    
    <!-- 显示选中的权限列表 -->
    <div class="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 class="font-medium mb-2">已选权限：</h3>
      <ul class="space-y-1">
        <li v-for="key in checkeds" :key="key" class="text-sm text-gray-600">
          ✅ {{ key }}
        </li>
      </ul>
    </div>
  </div>
</template>