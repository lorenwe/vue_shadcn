<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
} from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import RoleFormSheet from './components/form-sheet.vue'
import SortCell from '@/components/sort-cell/sort-cell.vue'
import type { SortUpdatePayload } from '@/components/sort-cell/types'
import type { TreeNode as TreeCheckboxNode } from '@/components/tree-node/types'
import { deleteRoleApi, fetchRolesApi, updateRoleSortApi } from '@/api/system/role-management/role-api'
import type { RoleItem } from '@/api/system/role-management/types'
import { fetchMenuListApi } from '@/api/system/menu-management/menu'
import type { MenuListItem } from '@/api/system/menu-management/types'
import { toMenuNodes, type MenuNode } from '@/pages/system/menu-management/data'
import type { Language } from '@/api/global/types'
import { usePageText } from './use-page-text'

defineOptions({ name: 'RoleManagement' })

const { t, tr, locale } = usePageText()

const roles = ref<RoleItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

const menus = ref<MenuListItem[]>([])
const permissionMenus = computed<TreeCheckboxNode[]>(() =>
  toPermissionTree(toMenuNodes(menus.value, locale.value as Language)),
)

function toPermissionTree(nodes: MenuNode[]): TreeCheckboxNode[] {
  return nodes.map(node => ({
    id: Number(node.id),
    title: node.title,
    children: node.subRows?.length ? toPermissionTree(node.subRows) : undefined,
  }))
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

async function loadRoles() {
  isLoading.value = true
  error.value = null
  try {
    const res = await fetchRolesApi({
      page_num: page.value,
      page_size: pageSize.value,
      role_name: keyword.value.trim() || undefined,
    })
    roles.value = res.list
    total.value = res.total
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    isLoading.value = false
  }
}

async function loadMenus() {
  try {
    menus.value = await fetchMenuListApi()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : String(e))
  }
}

onMounted(() => {
  loadRoles()
  loadMenus()
})

function search() {
  page.value = 1
  loadRoles()
}

function goToPage(nextPage: number) {
  if (nextPage < 1 || nextPage > totalPages.value || nextPage === page.value) return
  page.value = nextPage
  loadRoles()
}

const formOpen = ref(false)
const editingRole = ref<RoleItem | null>(null)

function openCreate() {
  editingRole.value = null
  formOpen.value = true
}

function openEdit(role: RoleItem) {
  editingRole.value = role
  formOpen.value = true
}

function onSubmitted() {
  loadRoles()
}

function updateRoleSort(payload: SortUpdatePayload) {
  return updateRoleSortApi({
    id: Number(payload.id),
    sort: payload.sort,
  })
}

function onSortUpdated() {
  loadRoles()
}

const deleteOpen = ref(false)
const deleteTarget = ref<RoleItem | null>(null)
const deleting = ref(false)

function askDelete(role: RoleItem) {
  deleteTarget.value = role
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await deleteRoleApi(Number(deleteTarget.value.id))
    toast.success(tr('pages.system.role-management.deleteSuccess', '删除成功'))
    deleteOpen.value = false
    deleteTarget.value = null
    if (roles.value.length === 1 && page.value > 1) {
      page.value--
    }
    await loadRoles()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : String(e))
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">
          {{ tr('menu.system.role-management', t('pages.system.role-management.title')) }}
        </h2>
        <p class="text-sm text-muted-foreground">
          <template v-if="isLoading">
            {{ tr('pages.system.role-management.loading', '…') }}
          </template>
          <template v-else>
            {{ tr('pages.system.role-management.total', '共 {total} 个角色').replace('{total}', String(total)) }}
          </template>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <Button size="sm" :disabled="isLoading" @click="openCreate">
          <PlusIcon class="size-4" />
          <span class="ml-1">{{ tr('menu.system.role-management.add', '新建') }}</span>
        </Button>
        <Input
          v-model="keyword"
          :placeholder="tr('pages.system.role-management.searchPlaceholder', '搜索角色名称')"
          class="h-8 w-52"
          @keyup.enter="search"
        />
        <Button variant="outline" size="sm" :disabled="isLoading" @click="search">
          <SearchIcon class="size-4" />
        </Button>
        <Button variant="outline" size="sm" :disabled="isLoading" @click="loadRoles">
          <RefreshCwIcon class="size-4" :class="{ 'animate-spin': isLoading }" />
        </Button>
      </div>
    </div>

    <div
      v-if="error"
      class="flex items-center justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
    >
      <span>{{ error }}</span>
      <Button variant="outline" size="sm" @click="loadRoles">
        {{ tr('pages.system.role-management.retry', '重试') }}
      </Button>
    </div>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="min-w-[180px]">
              {{ tr('pages.system.role-management.role_name', '角色名称') }}
            </TableHead>
            <TableHead class="min-w-[180px]">
              {{ tr('pages.system.role-management.role_code', '角色代码') }}
            </TableHead>
            <TableHead class="w-24">
              {{ tr('global.status', '状态') }}
            </TableHead>
            <TableHead class="w-20 text-right">
              {{ tr('global.table.sort', '排序') }}
            </TableHead>
            <TableHead class="min-w-[220px]">
              {{ tr('pages.system.role-management.remark', '备注') }}
            </TableHead>
            <TableHead class="w-36 text-right">
              {{ tr('global.table.operation', '操作') }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="roles.length">
            <TableRow v-for="role in roles" :key="role.id">
              <TableCell class="font-medium">{{ role.role_name }}</TableCell>
              <TableCell>
                <code class="rounded bg-muted px-1.5 py-0.5 text-xs">{{ role.role_code }}</code>
              </TableCell>
              <TableCell>
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                  :class="role.status === 0
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-primary/10 text-primary'"
                >
                  {{ role.status === 0
                    ? tr('global.status.disabled', '禁用')
                    : tr('global.status.enabled', '启用') }}
                </span>
              </TableCell>
              <TableCell class="w-20 text-right">
                <SortCell
                  :id="role.id"
                  :value="role.sort"
                  :update="updateRoleSort"
                  @saved="onSortUpdated"
                />
              </TableCell>
              <TableCell>
                <span :class="role.remark ? 'text-sm' : 'text-sm text-muted-foreground'">
                  {{ role.remark || '-' }}
                </span>
              </TableCell>
              <TableCell>
                <div class="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-8 px-2 text-xs"
                    @click="openEdit(role)"
                  >
                    {{ tr('menu.system.role-management.edit', '编辑') }}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-8 px-2 text-xs text-destructive hover:text-destructive"
                    :disabled="role.role_code === 'super_admin'"
                    :title="role.role_code === 'super_admin'
                      ? tr('pages.system.role-management.superAdminProtected', '超级管理员角色不能删除')
                      : undefined"
                    @click="askDelete(role)"
                  >
                    {{ tr('menu.system.role-management.delete', '删除') }}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else>
            <TableCell :colspan="6" class="h-24 text-center text-sm text-muted-foreground">
              {{ isLoading
                ? tr('pages.system.role-management.loading', '…')
                : tr('pages.system.role-management.empty', '暂无角色数据') }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
      <span>
        {{ tr('pages.system.role-management.total', '共 {total} 个角色').replace('{total}', String(total)) }}
      </span>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="isLoading || page <= 1"
          @click="goToPage(page - 1)"
        >
          {{ tr('pages.system.role-management.prev', '上一页') }}
        </Button>
        <span class="min-w-16 text-center tabular-nums">
          {{ page }} / {{ totalPages }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="isLoading || page >= totalPages"
          @click="goToPage(page + 1)"
        >
          {{ tr('pages.system.role-management.next', '下一页') }}
        </Button>
      </div>
    </div>

    <RoleFormSheet
      v-model:open="formOpen"
      :role="editingRole"
      :menus="permissionMenus"
      @submitted="onSubmitted"
    />

    <Dialog :open="deleteOpen" @update:open="(v: boolean) => deleteOpen = v">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{ tr('pages.system.role-management.deleteTitle', '删除角色') }}
          </DialogTitle>
          <DialogDescription>
            {{ tr('pages.system.role-management.deleteDescription', '删除后不可恢复，确定删除该角色吗？') }}
            <span v-if="deleteTarget" class="mt-1 block font-mono text-xs text-foreground">
              {{ deleteTarget.role_name }}
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex-row justify-end gap-2">
          <Button variant="outline" :disabled="deleting" @click="deleteOpen = false">
            {{ tr('pages.system.role-management.cancel', '取消') }}
          </Button>
          <Button variant="destructive" :disabled="deleting" @click="confirmDelete">
            {{ deleting
              ? tr('pages.system.role-management.deleting', '删除中…')
              : tr('menu.system.role-management.delete', '删除') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
