<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import {
  createColumnHelper,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import {
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  UserIcon,
} from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import UserTable from './components/table.vue'
import UserFormSheet from './components/form-sheet.vue'
import { deleteUserApi, fetchUsersApi } from '@/api/system/user-management/user-api'
import type { UserItem } from '@/api/system/user-management/types'
import { usePageText } from './use-page-text'

defineOptions({ name: 'UserManagement' })

const { t, tr, locale } = usePageText()

const items = ref<UserItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')

const isLoading = ref(false)
const error = ref<string | null>(null)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

async function loadUsers() {
  isLoading.value = true
  error.value = null
  try {
    const res = await fetchUsersApi({
      page_num: page.value,
      page_size: pageSize.value,
      username: keyword.value.trim() || undefined,
    })
    items.value = res.list
    total.value = res.total
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadUsers)

function search() {
  page.value = 1
  loadUsers()
}

function goToPage(nextPage: number) {
  if (nextPage < 1 || nextPage > totalPages.value || nextPage === page.value) return
  page.value = nextPage
  loadUsers()
}

const formOpen = ref(false)
const editingUser = ref<UserItem | null>(null)

function openCreate() {
  editingUser.value = null
  formOpen.value = true
}

function openEdit(user: UserItem) {
  editingUser.value = user
  formOpen.value = true
}

function onSubmitted() {
  loadUsers()
}

const deleteOpen = ref(false)
const deleteTarget = ref<UserItem | null>(null)
const deleting = ref(false)

function askDelete(user: UserItem) {
  deleteTarget.value = user
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await deleteUserApi(Number(deleteTarget.value.id))
    toast.success(tr('pages.system.user-management.deleteSuccess', '删除成功'))
    deleteOpen.value = false
    deleteTarget.value = null
    if (items.value.length === 1 && page.value > 1) {
      page.value--
    }
    await loadUsers()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : String(e))
  } finally {
    deleting.value = false
  }
}

function formatTime(value: number | null | undefined): string {
  if (!value) return '-'
  const date = new Date(value * 1000)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

const columnHelper = createColumnHelper<UserItem>()

const columns = computed(() => {
  void locale.value

  return [
    columnHelper.accessor('username', {
      header: () => tr('pages.system.user-management.username', '用户名'),
      size: 240,
      minSize: 180,
      cell: ({ getValue }) => h('div', { class: 'flex items-center gap-2' }, [
        h('span', {
          class: 'flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground',
        }, [
          h(UserIcon, { class: 'size-3.5' }),
        ]),
        h('span', { class: 'font-medium' }, getValue()),
      ]),
    }),
    columnHelper.accessor('remark', {
      header: () => tr('pages.system.user-management.remark', '备注'),
      size: 260,
      minSize: 180,
      cell: ({ getValue }) => {
        const remark = getValue()
        return h(
          'span',
          { class: remark ? 'text-sm' : 'text-sm text-muted-foreground' },
          remark || '-',
        )
      },
    }),
    columnHelper.accessor('sort', {
      header: () => h('div', { class: 'text-right' }, tr('global.table.sort', '排序')),
      size: 80,
      minSize: 64,
      maxSize: 100,
      cell: ({ getValue }) => h(
        'div',
        { class: 'text-right text-sm tabular-nums text-muted-foreground' },
        String(getValue()),
      ),
    }),
    columnHelper.accessor('create_at', {
      header: () => tr('pages.system.user-management.createAt', '创建时间'),
      size: 180,
      minSize: 150,
      cell: ({ getValue }) => h(
        'span',
        { class: 'text-sm text-muted-foreground' },
        formatTime(getValue()),
      ),
    }),
    columnHelper.accessor('update_at', {
      header: () => tr('pages.system.user-management.updateAt', '更新时间'),
      size: 180,
      minSize: 150,
      cell: ({ getValue }) => h(
        'span',
        { class: 'text-sm text-muted-foreground' },
        formatTime(getValue()),
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => h('div', { class: 'text-right' }, tr('global.table.operation', '操作')),
      size: 140,
      minSize: 120,
      maxSize: 180,
      cell: ({ row }) => {
        const user = row.original
        const protectedAdmin = user.username === 'admin'

        return h('div', { class: 'flex justify-end gap-1' }, [
          h(
            Button,
            {
              variant: 'ghost',
              size: 'sm',
              class: 'h-8 px-2 text-xs',
              onClick: () => openEdit(user),
            },
            () => tr('menu.system.user-management.edit', '编辑'),
          ),
          h(
            Button,
            {
              variant: 'ghost',
              size: 'sm',
              class: 'h-8 px-2 text-xs text-destructive hover:text-destructive',
              disabled: protectedAdmin,
              title: protectedAdmin
                ? tr('pages.system.user-management.adminProtected', '内置管理员不能删除')
                : undefined,
              onClick: () => askDelete(user),
            },
            () => tr('menu.system.user-management.delete', '删除'),
          ),
        ])
      },
    }),
  ]
})

const table = useVueTable({
  get data() {
    return items.value
  },
  get columns() {
    return columns.value
  },
  getCoreRowModel: getCoreRowModel(),
})

</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">
          {{ tr('menu.system.user-management', t('pages.system.user-management.title')) }}
        </h2>
        <p class="text-sm text-muted-foreground">
          <template v-if="isLoading">
            {{ tr('pages.system.user-management.loading', '…') }}
          </template>
          <template v-else>
            {{ tr('pages.system.user-management.total', '共 {total} 个用户').replace('{total}', String(total)) }}
          </template>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <Button size="sm" :disabled="isLoading" @click="openCreate">
          <PlusIcon class="size-4" />
          <span class="ml-1">{{ tr('menu.system.user-management.add', '新建') }}</span>
        </Button>
        <Input
          v-model="keyword"
          :placeholder="tr('pages.system.user-management.searchPlaceholder', '搜索用户名')"
          class="h-8 w-52"
          @keyup.enter="search"
        />
        <Button variant="outline" size="sm" :disabled="isLoading" @click="search">
          <SearchIcon class="size-4" />
        </Button>
        <Button variant="outline" size="sm" :disabled="isLoading" @click="loadUsers">
          <RefreshCwIcon class="size-4" :class="{ 'animate-spin': isLoading }" />
        </Button>
      </div>
    </div>

    <div
      v-if="error"
      class="flex items-center justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
    >
      <span>{{ error }}</span>
      <Button variant="outline" size="sm" @click="loadUsers">
        {{ tr('pages.system.user-management.retry', '重试') }}
      </Button>
    </div>

    <UserTable
      :table="table"
      :loading="isLoading"
      :loading-text="tr('pages.system.user-management.loading', '…')"
      :empty-text="tr('pages.system.user-management.empty', '暂无用户数据')"
    />

    <div class="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
      <span>
        {{ tr('pages.system.user-management.total', '共 {total} 个用户').replace('{total}', String(total)) }}
      </span>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="isLoading || page <= 1"
          @click="goToPage(page - 1)"
        >
          {{ tr('pages.system.user-management.prev', '上一页') }}
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
          {{ tr('pages.system.user-management.next', '下一页') }}
        </Button>
      </div>
    </div>

    <UserFormSheet
      v-model:open="formOpen"
      :user="editingUser"
      @submitted="onSubmitted"
    />

    <Dialog :open="deleteOpen" @update:open="(v: boolean) => deleteOpen = v">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{ tr('pages.system.user-management.deleteTitle', '删除用户') }}
          </DialogTitle>
          <DialogDescription>
            {{ tr('pages.system.user-management.deleteDescription', '删除后不可恢复，确定删除该用户吗？') }}
            <span v-if="deleteTarget" class="mt-1 block font-mono text-xs text-foreground">
              {{ deleteTarget.username }}
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex-row justify-end gap-2">
          <Button variant="outline" :disabled="deleting" @click="deleteOpen = false">
            {{ tr('pages.system.user-management.cancel', '取消') }}
          </Button>
          <Button variant="destructive" :disabled="deleting" @click="confirmDelete">
            {{ deleting
              ? tr('pages.system.user-management.deleting', '删除中…')
              : tr('menu.system.user-management.delete', '删除') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
