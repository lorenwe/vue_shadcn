<script setup lang="ts">
import {
  FlexRender,
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  useVueTable,
  type ExpandedState,
  type Row,
} from '@tanstack/vue-table'
import { Text, h, ref } from 'vue'
import DataTable from './components/table.vue'
type Person = {
  firstName: string
  lastName: string
  age: number
  visits: number
  status: string
  progress: number
}
const defaultData: Person[] = [
  {
    firstName: 'tanner',
    lastName: 'linsley',
    age: 24,
    visits: 100,
    status: 'In Relationship',
    progress: 50,
  },
  {
    firstName: 'tandy',
    lastName: 'miller',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    firstName: 'joe',
    lastName: 'dirte',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
]
const columnHelper = createColumnHelper<Person>()
function renderExpanded(row: Row<Person>) {
  if (!row.getCanExpand()) {
    return h(Text, '🔵')
  }
  return h(
    'button',
    {
      onClick: row.getToggleExpandedHandler(),
      style: { cursor: 'pointer' },
    },
    row.getIsExpanded() ? '👇' : '👉',
  )
}
const columns = [
  columnHelper.group({
    header: 'Name',
    footer: (props) => props.column.id,
    columns: [
      columnHelper.display({
        id: 'expander',
        header: () => null,
        cell: ({ row }) => renderExpanded(row),
      }),
      columnHelper.accessor('firstName', {
        footer: (props) => props.column.id,
      }),
      columnHelper.accessor((row) => row.lastName, {
        id: 'lastName',
        cell: (info) => info.getValue(),
        header: () => 'Last Name',
        footer: (props) => props.column.id,
      }),
    ],
  }),
  columnHelper.group({
    header: 'Info',
    footer: (props) => props.column.id,
    columns: [
      columnHelper.accessor('age', {
        header: () => 'Age',
        footer: (props) => props.column.id,
      }),
      columnHelper.group({
        header: 'More Info',
        columns: [
          columnHelper.accessor('visits', {
            header: () => 'Visits',
            footer: (props) => props.column.id,
          }),
          columnHelper.accessor('status', {
            header: 'Status',
            footer: (props) => props.column.id,
          }),
          columnHelper.accessor('progress', {
            header: 'Profile Progress',
            footer: (props) => props.column.id,
          }),
        ],
      }),
    ],
  }),
]
const data = ref(defaultData)
const expanded = ref<ExpandedState>({})
const rerender = () => {
  data.value = defaultData
}
const table = useVueTable({
  get data() {
    return data.value
  },
  state: {
    get expanded() {
      return expanded.value
    },
  },
  columns,
  getRowCanExpand: () => true,
  getCoreRowModel: getCoreRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onExpandedChange: (updaterOrValue) => {
    expanded.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(expanded.value)
        : updaterOrValue
  },
})
</script>
<template>
  <div class="overflow-x-auto">
    <DataTable
      :data="data"
      :columns="columns"
      :table="table"
    >
    </DataTable>
  </div>
</template>