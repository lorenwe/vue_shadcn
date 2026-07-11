<script setup lang="ts" generic="T">
import type { Column } from '@tanstack/vue-table'
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from '@lucide/vue'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface DataTableColumnHeaderProps {
  column: Column<T, any>
  title: string
}

const props = defineProps<DataTableColumnHeaderProps>()
const canSorted = computed(() => props.column.getCanSort())
</script>

<template>
  <div
    v-if="canSorted"
    :class="cn('flex items-center cursor-pointer select-none', $attrs.class ?? '')"
    @click="props.column.toggleSorting(undefined, true)"
  >
    <span>{{ title }}</span>
    <ArrowDownIcon v-if="props.column.getIsSorted() === 'desc'" class="ml-2 size-4" />
    <ArrowUpIcon v-else-if="props.column.getIsSorted() === 'asc'" class="ml-2 size-4" />
    <ChevronsUpDownIcon v-else class="ml-2 size-4 text-muted-foreground/50" />
  </div>
  <div v-else :class="$attrs?.class ?? ''">
    {{ title }}
  </div>
</template>
