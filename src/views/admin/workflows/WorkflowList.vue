<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWorkflowManagementStore } from '@/stores/workflow'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseTable from '@/components/base/BaseTable.vue'

const workflowStore = useWorkflowManagementStore()

const isLoading = ref(true)
const selectedWorkflows = ref([])

// 表格列定义
const columns = [
  {
    key: 'name',
    title: '工作流名称',
    width: '200px'
  },
  {
    key: 'status',
    title: '状态',
    width: '100px',
    align: 'center' as const
  },
  {
    key: 'creator',
    title: '创建者',
    width: '120px'
  },
  {
    key: 'executionCount',
    title: '执行次数',
    width: '100px',
    align: 'center' as const
  },
  {
    key: 'successRate',
    title: '成功率',
    width: '100px',
    align: 'center' as const
  },
  {
    key: 'lastExecuted',
    title: '最后执行',
    width: '150px'
  },
  {
    key: 'actions',
    title: '操作',
    width: '150px',
    align: 'center' as const
  }
]

// 计算属性
const tableData = computed(() => {
  return workflowStore.workflows
})

// 方法
const handleSelectionChange = (selection: any[]) => {
  selectedWorkflows.value = selection
}

const handleRowClick = (row: any) => {
  console.log('点击工作流:', row)
}

const handleExecute = (workflow: any) => {
  workflowStore.executeWorkflow(workflow.id)
}

const handleEdit = (workflow: any) => {
  console.log('编辑工作流:', workflow)
}

const handleDelete = (workflow: any) => {
  workflowStore.deleteWorkflow(workflow.id)
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': '运行中',
    'inactive': '已停止',
    'running': '执行中',
    'error': '错误'
  }
  return statusMap[status] || status
}

const formatLastExecuted = (date: Date | undefined) => {
  if (!date) return '从未执行'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatSuccessRate = (rate: number) => {
  return `${rate.toFixed(1)}%`
}

onMounted(async () => {
  try {
    await workflowStore.fetchWorkflows()
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="workflow-list-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">工作流管理</h1>
        <p class="page-description">管理和监控所有工作流程</p>
      </div>
      <div class="header-actions">
        <BaseButton variant="primary">
          创建工作流
        </BaseButton>
      </div>
    </div>
    
    <BaseCard title="工作流列表">
      <BaseTable
        :columns="columns"
        :data="tableData"
        :loading="isLoading"
        :selected-rows="selectedWorkflows"
        checkbox-column
        hoverable
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <!-- 工作流名称列 -->
        <template #name="{ row }">
          <div class="workflow-info">
            <div class="workflow-name">{{ row.name }}</div>
            <div class="workflow-description">{{ row.description }}</div>
          </div>
        </template>
        
        <!-- 状态列 -->
        <template #status="{ row }">
          <span 
            class="status-badge"
            :class="`status-badge--${row.status}`"
          >
            <span class="status-dot"></span>
            {{ getStatusText(row.status) }}
          </span>
        </template>
        
        <!-- 执行次数列 -->
        <template #executionCount="{ row }">
          <span class="execution-count">{{ row.executionCount }}</span>
        </template>
        
        <!-- 成功率列 -->
        <template #successRate="{ row }">
          <div class="success-rate">
            <div class="rate-bar">
              <div 
                class="rate-fill" 
                :style="{ width: `${row.successRate}%` }"
                :class="{
                  'rate-fill--high': row.successRate >= 90,
                  'rate-fill--medium': row.successRate >= 70 && row.successRate < 90,
                  'rate-fill--low': row.successRate < 70
                }"
              ></div>
            </div>
            <span class="rate-text">{{ formatSuccessRate(row.successRate) }}</span>
          </div>
        </template>
        
        <!-- 最后执行列 -->
        <template #lastExecuted="{ row }">
          {{ formatLastExecuted(row.lastExecuted) }}
        </template>
        
        <!-- 操作列 -->
        <template #actions="{ row }">
          <div class="action-buttons">
            <BaseButton 
              variant="primary" 
              size="sm"
              :disabled="row.status === 'running'"
              @click.stop="handleExecute(row)"
            >
              {{ row.status === 'running' ? '执行中' : '执行' }}
            </BaseButton>
            <BaseButton 
              variant="ghost" 
              size="sm"
              @click.stop="handleEdit(row)"
            >
              编辑
            </BaseButton>
            <BaseButton 
              variant="ghost" 
              size="sm"
              @click.stop="handleDelete(row)"
            >
              删除
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </BaseCard>
  </div>
</template>

<style scoped>
.workflow-list-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 16px;
  color: var(--color-text-muted);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 工作流信息样式 */
.workflow-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.workflow-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 14px;
}

.workflow-description {
  font-size: 12px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 状态徽章 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-badge--active {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-badge--active .status-dot {
  background: #10b981;
}

.status-badge--inactive {
  background: rgba(107, 114, 128, 0.1);
  color: #4b5563;
}

.status-badge--inactive .status-dot {
  background: #6b7280;
}

.status-badge--running {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.status-badge--running .status-dot {
  background: #3b82f6;
  animation: pulse 2s infinite;
}

.status-badge--error {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.status-badge--error .status-dot {
  background: #ef4444;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 执行次数 */
.execution-count {
  font-weight: 600;
  color: var(--color-text);
}

/* 成功率样式 */
.success-rate {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.rate-bar {
  width: 60px;
  height: 6px;
  background: var(--color-surface-hover);
  border-radius: 3px;
  overflow: hidden;
}

.rate-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.rate-fill--high {
  background: #10b981;
}

.rate-fill--medium {
  background: #f59e0b;
}

.rate-fill--low {
  background: #ef4444;
}

.rate-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 6px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .workflow-info {
    gap: 2px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
