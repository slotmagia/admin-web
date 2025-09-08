<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface Column {
  key: string
  title: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  fixed?: 'left' | 'right'
  render?: (value: any, row: any, index: number) => string
}

interface Props {
  columns: Column[]
  data: any[]
  loading?: boolean
  bordered?: boolean
  striped?: boolean
  hoverable?: boolean
  size?: 'small' | 'medium' | 'large'
  showHeader?: boolean
  emptyText?: string
  rowKey?: string | ((row: any) => string)
  selectedRows?: any[]
  selectable?: boolean
  checkboxColumn?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  bordered: true,
  striped: false,
  hoverable: true,
  size: 'medium',
  showHeader: true,
  emptyText: '暂无数据',
  selectable: false,
  checkboxColumn: false
})

interface Emits {
  'selection-change': [selectedRows: any[]]
  'row-click': [row: any, index: number]
  'sort-change': [column: Column, order: 'asc' | 'desc' | null]
}

const emit = defineEmits<Emits>()
const slots = useSlots()

// 计算属性
const tableClasses = computed(() => [
  'base-table',
  `base-table--${props.size}`,
  {
    'base-table--bordered': props.bordered,
    'base-table--striped': props.striped,
    'base-table--hoverable': props.hoverable,
    'base-table--loading': props.loading
  }
])

const allSelected = computed(() => {
  if (!props.selectable || props.data.length === 0) return false
  return props.selectedRows?.length === props.data.length
})

const indeterminate = computed(() => {
  if (!props.selectable) return false
  const selectedCount = props.selectedRows?.length || 0
  return selectedCount > 0 && selectedCount < props.data.length
})

// 方法
const getRowKey = (row: any, index: number): string => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }
  if (typeof props.rowKey === 'string') {
    return row[props.rowKey]
  }
  return String(index)
}

const isRowSelected = (row: any, index: number): boolean => {
  if (!props.selectable || !props.selectedRows) return false
  const rowKey = getRowKey(row, index)
  return props.selectedRows.some(selectedRow => 
    getRowKey(selectedRow, -1) === rowKey
  )
}

const handleSelectAll = (checked: boolean) => {
  if (!props.selectable) return
  emit('selection-change', checked ? [...props.data] : [])
}

const handleRowSelect = (row: any, index: number, checked: boolean) => {
  if (!props.selectable || !props.selectedRows) return
  
  const rowKey = getRowKey(row, index)
  let newSelection = [...props.selectedRows]
  
  if (checked) {
    if (!newSelection.some(selectedRow => getRowKey(selectedRow, -1) === rowKey)) {
      newSelection.push(row)
    }
  } else {
    newSelection = newSelection.filter(selectedRow => 
      getRowKey(selectedRow, -1) !== rowKey
    )
  }
  
  emit('selection-change', newSelection)
}

const handleRowClick = (row: any, index: number) => {
  emit('row-click', row, index)
}

const getCellValue = (row: any, column: Column, index: number) => {
  const value = row[column.key]
  if (column.render) {
    return column.render(value, row, index)
  }
  return value
}

const getColumnStyle = (column: Column) => {
  const style: any = {}
  if (column.width) {
    style.width = typeof column.width === 'number' ? `${column.width}px` : column.width
  }
  if (column.align) {
    style.textAlign = column.align
  }
  return style
}
</script>

<template>
  <div class="base-table-wrapper">
    <div :class="tableClasses">
      <!-- 表格头部 -->
      <div v-if="showHeader" class="base-table__header">
        <div class="base-table__header-row">
          <!-- 选择列 -->
          <div 
            v-if="checkboxColumn" 
            class="base-table__header-cell base-table__checkbox-cell"
          >
            <input
              type="checkbox"
              :checked="allSelected"
              :indeterminate="indeterminate"
              @change="handleSelectAll($event.target.checked)"
              class="base-table__checkbox"
            />
          </div>
          
          <!-- 数据列 -->
          <div
            v-for="column in columns"
            :key="column.key"
            class="base-table__header-cell"
            :style="getColumnStyle(column)"
          >
            <span class="base-table__header-title">{{ column.title }}</span>
            <span v-if="column.sortable" class="base-table__sort-icon">⇅</span>
          </div>
        </div>
      </div>
      
      <!-- 表格主体 -->
      <div class="base-table__body">
        <!-- 加载状态 -->
        <div v-if="loading" class="base-table__loading">
          <div class="loading-spinner"></div>
          <span class="loading-text">加载中...</span>
        </div>
        
        <!-- 空数据状态 -->
        <div v-else-if="data.length === 0" class="base-table__empty">
          <div class="empty-icon">📋</div>
          <div class="empty-text">{{ emptyText }}</div>
        </div>
        
        <!-- 数据行 -->
        <div
          v-else
          v-for="(row, index) in data"
          :key="getRowKey(row, index)"
          class="base-table__row"
          :class="{ 'base-table__row--selected': isRowSelected(row, index) }"
          @click="handleRowClick(row, index)"
        >
          <!-- 选择列 -->
          <div 
            v-if="checkboxColumn" 
            class="base-table__cell base-table__checkbox-cell"
            @click.stop
          >
            <input
              type="checkbox"
              :checked="isRowSelected(row, index)"
              @change="handleRowSelect(row, index, $event.target.checked)"
              class="base-table__checkbox"
            />
          </div>
          
          <!-- 数据列 -->
          <div
            v-for="column in columns"
            :key="column.key"
            class="base-table__cell"
            :style="getColumnStyle(column)"
          >
            <slot 
              :name="column.key" 
              :row="row" 
              :column="column" 
              :index="index"
              :value="row[column.key]"
            >
              {{ getCellValue(row, column, index) }}
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.base-table-wrapper {
  width: 100%;
  overflow: auto;
}

.base-table {
  width: 100%;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
}

.base-table--bordered {
  border: 1px solid var(--color-border);
}

.base-table--loading {
  pointer-events: none;
}

/* 表格头部 */
.base-table__header {
  background: var(--color-surface-hover);
  border-bottom: 1px solid var(--color-border);
}

.base-table__header-row {
  display: flex;
  align-items: center;
  min-height: 48px;
}

.base-table__header-cell {
  flex: 1;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 8px;
  border-right: 1px solid var(--color-border);
}

.base-table__header-cell:last-child {
  border-right: none;
}

.base-table__checkbox-cell {
  flex: 0 0 48px;
  justify-content: center;
}

.base-table__header-title {
  flex: 1;
}

.base-table__sort-icon {
  color: var(--color-text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.base-table__sort-icon:hover {
  color: var(--color-primary);
}

/* 表格主体 */
.base-table__body {
  position: relative;
}

.base-table__row {
  display: flex;
  align-items: center;
  min-height: 52px;
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.base-table__row:last-child {
  border-bottom: none;
}

.base-table--hoverable .base-table__row:hover {
  background: var(--color-surface-hover);
}

.base-table--striped .base-table__row:nth-child(even) {
  background: rgba(0, 0, 0, 0.02);
}

.base-table__row--selected {
  background: rgba(59, 130, 246, 0.08);
}

.base-table__cell {
  flex: 1;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-text);
  border-right: 1px solid var(--color-border);
  word-break: break-word;
}

.base-table__cell:last-child {
  border-right: none;
}

/* 复选框 */
.base-table__checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

/* 尺寸变体 */
.base-table--small .base-table__header-row {
  min-height: 40px;
}

.base-table--small .base-table__header-cell,
.base-table--small .base-table__cell {
  padding: 8px 12px;
  font-size: 13px;
}

.base-table--small .base-table__row {
  min-height: 44px;
}

.base-table--large .base-table__header-row {
  min-height: 56px;
}

.base-table--large .base-table__header-cell,
.base-table--large .base-table__cell {
  padding: 16px 20px;
  font-size: 15px;
}

.base-table--large .base-table__row {
  min-height: 60px;
}

/* 加载状态 */
.base-table__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  min-height: 200px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.loading-text {
  font-size: 14px;
  color: var(--color-text-muted);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空数据状态 */
.base-table__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 200px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  color: var(--color-text-muted);
  font-size: 16px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .base-table__header-cell,
  .base-table__cell {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .base-table__checkbox-cell {
    flex: 0 0 40px;
  }
}

/* 暗色主题适配 */
[data-theme="dark"] .base-table {
  background: var(--color-surface-dark);
  border-color: var(--color-border-dark);
}

[data-theme="dark"] .base-table__header {
  background: var(--color-surface-hover-dark);
}

[data-theme="dark"] .base-table__row {
  border-color: var(--color-border-dark);
}

[data-theme="dark"] .base-table__cell {
  border-color: var(--color-border-dark);
}

[data-theme="dark"] .base-table__loading {
  background: rgba(0, 0, 0, 0.8);
}
</style>
