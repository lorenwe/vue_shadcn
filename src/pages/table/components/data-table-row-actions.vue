<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'
import type { Task } from '@/validators/task.validator'
import { TaskSchema } from '@/validators/task.validator'

const props = defineProps<DataTableRowActionsProps>()

interface DataTableRowActionsProps {
  row: Row<Task>
}
const task = computed(() => TaskSchema.parse(props.row.original))

const taskLabel = ref(task.value.label)

const showComponent = shallowRef<Component | null>(null)
const isOpen = ref(false)

type TCommand = 'edit' | 'create' | 'delete'

// const componentLoader: Record<TCommand, () => Promise<{ default: Component }>> = {
// //   edit: () => import('./task-resource-dialog.vue'),
// //   create: () => import('./task-resource-dialog.vue'),
// //   delete: () => import('./task-delete.vue'),
// }

async function handleSelect(command: TCommand) {
//   try {
//     const { default: component } = await componentLoader[command]()
//     showComponent.value = component
//     isOpen.value = true
//   }
//   catch (e) {
//     console.error(`Failed to load component for "${command}"`, e)
//   }
}
</script>

<template>
  操作
</template>
