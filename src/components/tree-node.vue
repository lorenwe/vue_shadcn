<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { TreeItem, TreeRoot } from 'reka-ui'
import { ref, computed } from 'vue'

// ===== 数据类型 =====
interface TreeNode {
  title: string
  icon?: string
  children?: TreeNode[]
  disabled?: boolean
}

// ===== Props =====
const props = defineProps<{
  items: TreeNode[]
  defaultChecked?: string[]
}>()

// ===== Emits =====
const emit = defineEmits<{
  'update:checked': [checked: string[]]
  'change': [checked: string[], item: TreeNode]
}>()

// ===== 状态 =====
const checkedSet = ref<Set<string>>(new Set(props.defaultChecked || []))
const halfCheckedSet = ref<Set<string>>(new Set())

// ===== 工具函数 =====
// 获取节点的所有后代
function getDescendantKeys(items: TreeNode[], targetKey: string): string[] {
  const keys: string[] = []
  
  function findNode(nodes: TreeNode[]): boolean {
    for (const node of nodes) {
      if (node.title === targetKey) {
        collectDescendants(node)
        return true
      }
      if (node.children && findNode(node.children)) {
        return true
      }
    }
    return false
  }
  
  function collectDescendants(node: TreeNode) {
    if (node.children) {
      for (const child of node.children) {
        keys.push(child.title)
        collectDescendants(child)
      }
    }
  }
  
  findNode(items)
  return keys
}

// 获取父节点
function getParentKeys(items: TreeNode[], targetKey: string): string[] {
  const parents: string[] = []
  
  function traverse(nodes: TreeNode[], parentKey?: string) {
    for (const node of nodes) {
      if (node.title === targetKey) {
        if (parentKey) parents.push(parentKey)
        return true
      }
      if (node.children && traverse(node.children, node.title)) {
        if (parentKey) parents.push(parentKey)
        return true
      }
    }
    return false
  }
  
  traverse(items)
  return parents
}

// 获取所有节点
function getAllKeys(items: TreeNode[]): string[] {
  const keys: string[] = []
  function traverse(nodes: TreeNode[]) {
    for (const node of nodes) {
      keys.push(node.title)
      if (node.children) traverse(node.children)
    }
  }
  traverse(items)
  return keys
}

// ===== 核心逻辑 =====
// 更新父节点状态
function updateParentState(key: string) {
  const parents = getParentKeys(props.items, key)
  
  for (const parentKey of parents) {
    const children = getDescendantKeys(props.items, parentKey)
    const childKeys = children.filter(k => k !== parentKey)
    
    if (childKeys.length === 0) continue
    
    const checkedChildren = childKeys.filter(k => checkedSet.value.has(k))
    
    // 所有子节点都被选中
    if (checkedChildren.length === childKeys.length) {
      checkedSet.value.add(parentKey)
      halfCheckedSet.value.delete(parentKey)
    }
    // 部分子节点被选中
    else if (checkedChildren.length > 0) {
      halfCheckedSet.value.add(parentKey)
      checkedSet.value.delete(parentKey)
    }
    // 没有子节点被选中
    else {
      checkedSet.value.delete(parentKey)
      halfCheckedSet.value.delete(parentKey)
    }
    
    updateParentState(parentKey)
  }
}

// 切换节点
function toggleCheck(key: string) {
  const isChecked = checkedSet.value.has(key)
  const descendants = getDescendantKeys(props.items, key)
  
  if (isChecked) {
    // 取消选中
    checkedSet.value.delete(key)
    for (const desc of descendants) {
      checkedSet.value.delete(desc)
      halfCheckedSet.value.delete(desc)
    }
  } else {
    // 选中
    checkedSet.value.add(key)
    // 在半选集中有当前操作的节点，则从半选集中删除当前节点，表示当前节点已不在是半选状态了
    if (halfCheckedSet.value.has(key)) halfCheckedSet.value.delete(key)
    for (const desc of descendants) {
      checkedSet.value.add(desc)
      halfCheckedSet.value.delete(desc)
    }
  }
  
  // 更新父节点
  updateParentState(key)
  
  // 触发事件
  const checkedList = Array.from(checkedSet.value)
  emit('update:checked', checkedList)
  
  // 找到当前节点
  const findItem = (nodes: TreeNode[]): TreeNode | null => {
    for (const node of nodes) {
      if (node.title === key) return node
      if (node.children) {
        const found = findItem(node.children)
        if (found) return found
      }
    }
    return null
  }
  const item = findItem(props.items)
  if (item) {
    emit('change', checkedList, item)
  }
}

// ===== 获取节点状态 =====
function getNodeState(key: string): 'checked' | 'unchecked' | 'half' {
  let res: 'checked' | 'unchecked' | 'half'
  // console.log("getNodeState checkedSet", checkedSet.value)
  // console.log("getNodeState halfCheckedSet", halfCheckedSet.value)
  if (checkedSet.value.has(key)) {
    res = 'checked'
  } else if (halfCheckedSet.value.has(key)) {
    res = 'half'
  } else {
    res = 'unchecked'
  }
  return res
}

// ===== 全部选中/取消 =====
function checkAll() {
  const allKeys = getAllKeys(props.items)
  allKeys.forEach(key => checkedSet.value.add(key))
  halfCheckedSet.value.clear()
  emit('update:checked', Array.from(checkedSet.value))
}

function uncheckAll() {
  checkedSet.value.clear()
  halfCheckedSet.value.clear()
  emit('update:checked', [])
}

// ===== 计算选中的叶子节点 =====
const checkedLeafKeys = computed(() => {
  const leafKeys: string[] = []
  function traverse(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (!node.children || node.children.length === 0) {
        if (checkedSet.value.has(node.title)) {
          leafKeys.push(node.title)
        }
      } else {
        traverse(node.children)
      }
    }
  }
  traverse(props.items)
  return leafKeys
})

// 返回类名对象
function getCheckboxClasses(key: string) {
  const state = getNodeState(key)
  // console.log("getCheckboxClasses", key, state)
  return {
    'border-gray-300 hover:border-blue-500': state === 'unchecked',
    'bg-blue-500 border-blue-500 hover:bg-blue-600': state === 'checked' || state === 'half',
  }
}


// ===== 暴露方法 =====
defineExpose({
  checkedSet,
  checkedLeafKeys,
  checkAll,
  uncheckAll,
  toggleCheck,
})
</script>

<template>
  <div class="tree-wrapper">
    <!-- 全选工具栏 -->
    <div class="tree-toolbar">
      <button @click="checkAll" class="toolbar-btn">全选</button>
      <button @click="uncheckAll" class="toolbar-btn">取消全选</button>
      <span class="toolbar-info">已选: {{ checkedLeafKeys.length }}</span>
    </div>

    <!-- 树形组件 -->
    <TreeRoot
      v-slot="{ flattenItems }"
      :items="items"
      :get-key="(item) => item.title"
      :propagate-select="false"
      class="list-none select-none w-56 bg-white text-stone-700 rounded-lg border shadow-sm p-2 text-sm font-medium"
    >
      <TreeItem
        v-for="item in flattenItems"
        v-slot="{isExpanded, handleToggle }"
        :key="item._id"
        v-bind="item.bind"
        :style="{ 'padding-left': `${item.level - 0.5}rem` }"
        class="flex items-center py-1 px-2 my-0.5 rounded outline-none hover:bg-gray-50"
        :class="{ 'opacity-50 pointer-events-none': item.value.disabled }"
      >
        <!-- 复选框 -->
        <button
          type="button"
          class="flex-shrink-0 w-4 h-4 mr-2 rounded border-2 flex items-center justify-center transition-colors"
          :class="getCheckboxClasses(item.value.title)"
          @click.stop="toggleCheck(item.value.title)"
          :disabled="item.value.disabled"
        >
          <!-- 选中：对勾 -->
          <Icon
            v-if="getNodeState(item.value.title) === 'checked'"
            icon="lucide:check"
            class="w-3 h-3 text-white"
          />
          <!-- 半选：横线 -->
          <Icon
            v-else-if="getNodeState(item.value.title) === 'half'"
            icon="lucide:minus"
            class="w-3 h-3 text-white"
          />
        </button>

        <!-- 图标 -->
        <template v-if="item.hasChildren">
          <Icon
            :icon="isExpanded ? 'lucide:folder-open' : 'lucide:folder'"
            class="flex-shrink-0 h-4 w-4 text-yellow-500"
          />
        </template>
        <Icon
          v-else
          :icon="item.value.icon || 'lucide:file'"
          class="flex-shrink-0 h-4 w-4 text-gray-400"
        />

        <!-- 标题 -->
        <span class="flex-1 truncate ml-2">
          {{ item.value.title }}
        </span>

        <!-- 展开/收起按钮 -->
        <button
          v-if="item.hasChildren"
          type="button"
          class="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 transition-transform duration-200"
          :class="{ 'rotate-90': isExpanded }"
          @click.stop="handleToggle"
        >
          <Icon icon="lucide:chevron-right" class="w-4 h-4" />
        </button>
      </TreeItem>
    </TreeRoot>
  </div>
</template>
