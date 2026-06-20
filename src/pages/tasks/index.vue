<script setup lang="ts">
import { BasicPage } from '@/components/main-layout'

import { columns } from './components/columns'
import DataTable from './components/data-table.vue'

import tasks from './data/tasks.json'
</script>

<template>
  <BasicPage
    title="Tasks"
    description="Tasks description"
    sticky
  >
    <template #actions>
      <!-- <TaskImport />
      <TaskCreate /> -->
    </template>
    <div class="overflow-x-auto">
      <DataTable :data="tasks" :columns="columns" />
    </div>
  </BasicPage>
</template>
