<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { Handle, Position } from '@vue-flow/core'
  import type { LoopNodeData } from '@/types'

  interface Props {
    id: string
    data: LoopNodeData
    selected?: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:data': [data: LoopNodeData]
    'node-click': [nodeId: string]
  }>()

  // 配置面板显示状态
  const showConfig = ref(false)

  // 节点样式
  const nodeClasses = computed(() => [
    'loop-node',
    `loop-node--${props.data.status || 'idle'}`,
    {
      'loop-node--selected': props.selected,
    },
  ])

  // 状态图标
  const statusIcon = computed(() => {
    switch (props.data.status) {
      case 'running':
        return '⏳'
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return '🔄'
    }
  })

  // 循环类型图标
  const iterationIcon = computed(() => {
    switch (props.data.iterationType) {
      case 'count':
        return '🔢'
      case 'condition':
        return '❓'
      case 'array':
        return '📋'
      default:
        return '🔄'
    }
  })

  // 更新节点数据
  const updateData = (updates: Partial<LoopNodeData>) => {
    const newData = { ...props.data, ...updates }
    emit('update:data', newData)
  }

  // 处理节点点击
  const handleClick = () => {
    emit('node-click', props.id)
  }

  // 切换配置面板
  const toggleConfig = () => {
    showConfig.value = !showConfig.value
  }

  // 处理输入事件
  const handleInputChange = (key: keyof LoopNodeData, event: Event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    if (target) {
      updateData({ [key]: target.value })
    }
  }

  const handleNumberChange = (key: keyof LoopNodeData, event: Event) => {
    const target = event.target as HTMLInputElement
    if (target) {
      const value = parseInt(target.value)
      updateData({ [key]: value })
    }
  }
</script>

<template>
  <div :class="nodeClasses" @click="handleClick">
    <!-- 输入句柄 -->
    <Handle
      id="input"
      type="target"
      :position="Position.Left"
      class="node-handle node-handle--input"
    />

    <!-- 节点头部 -->
    <div class="node-header">
      <div class="node-status">{{ statusIcon }}</div>
      <div class="node-info">
        <div class="node-title">{{ data.label }}</div>
        <div class="node-type">循环节点</div>
      </div>
      <div class="node-actions">
        <button class="node-action-button" @click.stop="toggleConfig" title="配置">⚙️</button>
      </div>
    </div>

    <!-- 节点主体 -->
    <div class="node-body">
      <div class="iteration-info">
        <div class="iteration-type">
          <span class="type-icon">{{ iterationIcon }}</span>
          <span class="type-label">{{ data.iterationType === 'count' ? '计数循环' : data.iterationType === 'condition' ? '条件循环' : '数组循环' }}</span>
        </div>
        
        <div class="iteration-details">
          <div v-if="data.iterationType === 'count' && data.maxIterations" class="detail-item">
            最大次数: {{ data.maxIterations }}
          </div>
          <div v-if="data.iterationType === 'condition' && data.condition" class="detail-item">
            条件: {{ data.condition.slice(0, 20) + (data.condition.length > 20 ? '...' : '') }}
          </div>
          <div v-if="data.iterationType === 'array' && data.arrayPath" class="detail-item">
            数组路径: {{ data.arrayPath }}
          </div>
          <div v-if="data.currentIteration !== undefined" class="detail-item current">
            当前: {{ data.currentIteration }}
          </div>
        </div>
      </div>
    </div>

    <!-- 配置面板 -->
    <div v-if="showConfig" class="node-config-panel" @click.stop>
      <div class="config-header">
        <h4>循环节点配置</h4>
        <button @click="toggleConfig" class="config-close">✕</button>
      </div>

      <div class="config-content">
        <div class="config-field">
          <label>节点名称:</label>
          <input
            :value="data.label"
            @input="handleInputChange('label', $event)"
            class="config-input"
          />
        </div>

        <div class="config-field">
          <label>循环类型:</label>
          <select
            :value="data.iterationType"
            @change="handleInputChange('iterationType', $event)"
            class="config-select"
          >
            <option value="count">计数循环</option>
            <option value="condition">条件循环</option>
            <option value="array">数组循环</option>
          </select>
        </div>

        <div v-if="data.iterationType === 'count'" class="config-field">
          <label>最大迭代次数:</label>
          <input
            :value="data.maxIterations || 10"
            @input="handleNumberChange('maxIterations', $event)"
            type="number"
            min="1"
            max="10000"
            class="config-input"
          />
        </div>

        <div v-if="data.iterationType === 'condition'" class="config-field">
          <label>循环条件:</label>
          <textarea
            :value="data.condition || ''"
            @input="handleInputChange('condition', $event)"
            class="config-textarea"
            rows="3"
            placeholder="例如: counter < 100"
          />
        </div>

        <div v-if="data.iterationType === 'array'" class="config-field">
          <label>数组路径:</label>
          <input
            :value="data.arrayPath || ''"
            @input="handleInputChange('arrayPath', $event)"
            class="config-input"
            placeholder="例如: data.items"
          />
        </div>

        <div class="config-field">
          <label>描述:</label>
          <textarea
            :value="data.description || ''"
            @input="handleInputChange('description', $event)"
            class="config-textarea"
            rows="2"
            placeholder="节点功能描述"
          />
        </div>
      </div>
    </div>

    <!-- 错误信息 -->
    <div v-if="data.error" class="node-error">{{ data.error }}</div>

    <!-- 输出句柄 -->
    <Handle
      id="output-loop"
      type="source"
      :position="Position.Right"
      :style="{ top: '60%' }"
      class="node-handle node-handle--output node-handle--loop"
    />
    <Handle
      id="output-end"
      type="source"
      :position="Position.Right"
      :style="{ top: '80%' }"
      class="node-handle node-handle--output node-handle--end"
    />
  </div>
</template>

<style scoped>
  .loop-node {
    background: var(--vf-node-bg);
    border: 2px solid var(--color-info);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    min-width: 200px;
    max-width: 280px;
    transition: var(--transition-fast);
    position: relative;
    cursor: pointer;
  }

  /* .loop-node:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
  } */

  .loop-node--selected {
    border-color: var(--color-info);
    box-shadow: 0 0 0 2px var(--color-info), var(--shadow-lg);
  }

  .loop-node--running {
    border-color: var(--color-warning);
    animation: pulse 2s infinite;
  }

  .loop-node--success {
    border-color: var(--color-success);
  }

  .loop-node--error {
    border-color: var(--color-error);
  }

  .node-header {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background: linear-gradient(135deg, var(--color-info), var(--color-info));
    color: var(--color-text-inverse);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  .node-status {
    font-size: var(--font-size-lg);
    margin-right: var(--spacing-sm);
  }

  .node-info {
    flex: 1;
  }

  .node-title {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-sm);
    margin-bottom: 2px;
  }

  .node-type {
    font-size: var(--font-size-xs);
    opacity: 0.9;
  }

  .node-actions {
    opacity: 0;
    transition: var(--transition-fast);
  }

  .loop-node:hover .node-actions {
    opacity: 1;
  }

  .node-action-button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: var(--radius-sm);
    padding: var(--spacing-xs);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .node-action-button:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .node-body {
    padding: var(--spacing-md);
  }

  .iteration-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .iteration-type {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .type-icon {
    font-size: var(--font-size-lg);
  }

  .type-label {
    font-weight: var(--font-weight-medium);
    color: var(--color-info);
  }

  .iteration-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .detail-item {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .detail-item.current {
    color: var(--color-info);
    font-weight: var(--font-weight-medium);
  }

  .node-config-panel {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    z-index: 1000;
    margin-top: var(--spacing-sm);
  }

  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-info);
    color: var(--color-text-inverse);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  .config-header h4 {
    margin: 0;
    font-size: var(--font-size-sm);
  }

  .config-close {
    background: none;
    border: none;
    color: var(--color-text-inverse);
    cursor: pointer;
    font-size: var(--font-size-lg);
    padding: 0;
  }

  .config-content {
    padding: var(--spacing-md);
    max-height: 300px;
    overflow-y: auto;
  }

  .config-field {
    margin-bottom: var(--spacing-md);
  }

  .config-field label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
  }

  .config-input,
  .config-select,
  .config-textarea {
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    background: var(--color-background);
    color: var(--color-text);
  }

  .config-textarea {
    resize: vertical;
    min-height: 60px;
  }

  .config-input:focus,
  .config-select:focus,
  .config-textarea:focus {
    outline: none;
    border-color: var(--color-info);
    box-shadow: 0 0 0 1px var(--color-info);
  }

  .node-error {
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-error);
    color: var(--color-text-inverse);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    font-size: var(--font-size-xs);
  }

  .node-handle {
    width: 12px;
    height: 12px;
    background: var(--vf-handle);
    border: 2px solid var(--vf-node-bg);
    border-radius: 50%;
    transition: var(--transition-fast);
  }

  /* .node-handle:hover {
    background: var(--vf-handle-hover);
    transform: scale(1.2);
  } */

  .node-handle--input {
    left: -6px;
  }

  .node-handle--output {
    right: -6px;
  }

  .node-handle--loop {
    background: var(--color-info);
  }

  .node-handle--end {
    background: var(--color-success);
  }

  @keyframes pulse {
    0%, 100% {
      border-color: var(--color-info);
    }
    50% {
      border-color: var(--color-warning);
    }
  }
</style> 