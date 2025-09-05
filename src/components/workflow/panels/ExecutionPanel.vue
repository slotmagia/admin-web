<script setup lang="ts">
  import { computed, watch } from 'vue'
  import { useWorkflowStore } from '@/stores/workflow'
  import { useWorkflowExecution } from '@/composables/useWorkflowExecution'
  import BaseButton from '@/components/base/BaseButton.vue'
  import type { WorkflowNode, WorkflowEdge } from '@/types'

  // 状态管理
  const workflowStore = useWorkflowStore()
  const execution = useWorkflowExecution()

  // 执行工作流
  const handleExecute = async () => {
    try {
      await execution.executeWorkflow(
        workflowStore.nodes as WorkflowNode[],
        workflowStore.edges as WorkflowEdge[]
      )
    } catch (error) {
      console.error('Failed to execute workflow:', error)
    }
  }

  // 格式化执行时间
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  // 格式化时间戳
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString()
  }

  // 执行状态颜色
  const statusColor = computed(() => {
    switch (execution.executionStatus.value) {
      case 'running':
        return 'var(--color-info)'
      case 'completed':
        return 'var(--color-success)'
      case 'failed':
        return 'var(--color-error)'
      case 'paused':
        return 'var(--color-warning)'
      default:
        return 'var(--color-text-muted)'
    }
  })

  // 执行状态文本
  const statusText = computed(() => {
    switch (execution.executionStatus.value) {
      case 'idle':
        return '就绪'
      case 'running':
        return '执行中'
      case 'paused':
        return '已暂停'
      case 'completed':
        return '已完成'
      case 'failed':
        return '执行失败'
      default:
        return '未知状态'
    }
  })

  // 监听当前执行节点，更新节点状态
  watch(
    () => execution.currentExecutingNode.value,
    (nodeId, oldNodeId) => {
      if (oldNodeId) {
        workflowStore.updateNodeData(oldNodeId, { status: 'idle' })
      }
      if (nodeId) {
        workflowStore.updateNodeData(nodeId, { status: 'running' })
      }
    }
  )

  // 监听执行完成，更新所有节点状态
  watch(
    () => execution.executionStatus.value,
    (status, oldStatus) => {
      if (status === 'completed' && oldStatus === 'running') {
        // 标记所有节点为成功
        workflowStore.nodes.forEach(node => {
          workflowStore.updateNodeData(node.id, { status: 'success' })
        })
      } else if (status === 'failed') {
        // 保持失败节点状态，其他设为idle
        if (execution.currentExecutingNode.value) {
          workflowStore.updateNodeData(execution.currentExecutingNode.value, {
            status: 'error',
          })
        }
      } else if (status === 'idle') {
        // 重置所有节点状态
        workflowStore.nodes.forEach(node => {
          workflowStore.updateNodeData(node.id, { status: 'idle' })
        })
      }
    }
  )
</script>

<template>
  <div class="execution-panel">
    <div class="panel-header">
      <h3 class="panel-title">执行控制</h3>
      <div class="execution-status" :style="{ color: statusColor }">
        {{ statusText }}
      </div>
    </div>

    <div class="panel-content">
      <!-- 执行控制按钮 -->
      <div class="control-buttons">
        <BaseButton
          variant="primary"
          size="sm"
          :disabled="!execution.canExecute.value"
          :loading="execution.isExecuting.value"
          @click="handleExecute"
        >
          ▶️ 运行
        </BaseButton>

        <BaseButton
          variant="outline"
          size="sm"
          :disabled="!execution.canPause.value"
          @click="execution.pauseExecution"
        >
          ⏸️ 暂停
        </BaseButton>

        <BaseButton
          variant="outline"
          size="sm"
          :disabled="!execution.canResume.value"
          @click="execution.resumeExecution"
        >
          ▶️ 恢复
        </BaseButton>

        <BaseButton
          variant="outline"
          size="sm"
          :disabled="!execution.isExecuting.value && execution.executionStatus.value !== 'paused'"
          @click="execution.stopExecution"
        >
          ⏹️ 停止
        </BaseButton>
      </div>

      <!-- 执行进度 -->
      <div v-if="execution.isExecuting.value" class="progress-section">
        <div class="progress-header">
          <span class="progress-label">执行进度</span>
          <span class="progress-value">{{ Math.round(execution.executionProgress.value) }}%</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${execution.executionProgress.value}%` }"
          ></div>
        </div>
        <div v-if="execution.currentExecutingNode.value" class="current-node">
          正在执行: {{ execution.currentExecutingNode.value }}
        </div>
      </div>

      <!-- 工作流统计 -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ workflowStore.workflowStats.nodeCount }}</div>
            <div class="stat-label">节点数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ workflowStore.workflowStats.edgeCount }}</div>
            <div class="stat-label">连线数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ workflowStore.workflowStats.selectedCount }}</div>
            <div class="stat-label">已选择</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">
              {{ workflowStore.workflowIsValid ? '✓' : '✗' }}
            </div>
            <div class="stat-label">有效性</div>
          </div>
        </div>
      </div>

      <!-- 执行结果 -->
      <div v-if="execution.executionResult.value" class="result-section">
        <div class="result-header">
          <h4>执行结果</h4>
          <span class="result-time">
            {{ formatTime(execution.executionResult.value.startTime) }}
          </span>
        </div>
        <div class="result-details">
          <div class="result-item">
            <span class="result-label">状态:</span>
            <span class="result-value" :class="`result-${execution.executionResult.value.status}`">
              {{ execution.executionResult.value.status }}
            </span>
          </div>
          <div class="result-item">
            <span class="result-label">耗时:</span>
            <span class="result-value">
              {{
                execution.executionResult.value.duration
                  ? formatDuration(execution.executionResult.value.duration)
                  : '-'
              }}
            </span>
          </div>
          <div
            v-if="
              execution.executionResult.value.errors &&
              execution.executionResult.value.errors.length > 0
            "
            class="result-item"
          >
            <span class="result-label">错误:</span>
            <span class="result-value result-error">
              {{ execution.executionResult.value.errors.length }} 个错误
            </span>
          </div>
        </div>
      </div>

      <!-- 工作流操作 -->
      <div class="workflow-actions">
        <BaseButton
          variant="outline"
          size="sm"
          :disabled="!workflowStore.canUndo"
          @click="workflowStore.undo"
        >
          ↶ 撤销
        </BaseButton>
        <BaseButton
          variant="outline"
          size="sm"
          :disabled="!workflowStore.canRedo"
          @click="workflowStore.redo"
        >
          ↷ 重做
        </BaseButton>
        <BaseButton variant="ghost" size="sm" @click="workflowStore.clearSelection">
          清除选择
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .execution-panel {
    width: 100%;
    height: 100%;
    background: var(--color-surface);
    border-left: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-background);
  }

  .panel-title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
  }

  .execution-status {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  .panel-content {
    flex: 1;
    padding: var(--spacing-md);
    overflow-y: auto;
  }

  .control-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
  }

  .progress-section {
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-md);
    background: var(--color-background);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
  }

  .progress-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .progress-value {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-primary);
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: var(--color-border);
    border-radius: var(--radius-full);
    overflow: hidden;
    margin-bottom: var(--spacing-sm);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-primary), var(--color-info));
    transition: width var(--transition-normal);
  }

  .current-node {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    font-style: italic;
  }

  .stats-section {
    margin-bottom: var(--spacing-lg);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
  }

  .stat-item {
    text-align: center;
    padding: var(--spacing-sm);
    background: var(--color-background);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .stat-value {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-primary);
    margin-bottom: var(--spacing-xs);
  }

  .stat-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .result-section {
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-md);
    background: var(--color-background);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
  }

  .result-header h4 {
    margin: 0;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  .result-time {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .result-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .result-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
  }

  .result-value {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
  }

  .result-completed {
    color: var(--color-success);
  }

  .result-failed {
    color: var(--color-error);
  }

  .result-error {
    color: var(--color-error);
  }

  .workflow-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);
  }

  .workflow-actions :nth-child(3) {
    grid-column: 1 / -1;
  }

  /* 滚动条样式 */
  .panel-content::-webkit-scrollbar {
    width: 6px;
  }

  .panel-content::-webkit-scrollbar-track {
    background: var(--color-surface);
  }

  .panel-content::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: var(--radius-full);
  }

  .panel-content::-webkit-scrollbar-thumb:hover {
    background: var(--color-text-muted);
  }
</style>
