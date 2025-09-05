<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { Handle, Position } from '@vue-flow/core'
  import type { AggregateNodeData } from '@/types'

  interface Props {
    id: string
    data: AggregateNodeData
    selected?: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:data': [data: AggregateNodeData]
    'node-click': [nodeId: string]
  }>()

  // 配置面板显示状态
  const showConfig = ref(false)

  // 节点样式
  const nodeClasses = computed(() => [
    'aggregate-node',
    `aggregate-node--${props.data.status || 'idle'}`,
    {
      'aggregate-node--selected': props.selected,
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
        return '📊'
    }
  })

  // 聚合类型图标
  const aggregationIcon = computed(() => {
    switch (props.data.aggregationType) {
      case 'sum':
        return '➕'
      case 'average':
        return '📈'
      case 'count':
        return '#️⃣'
      case 'max':
        return '⬆️'
      case 'min':
        return '⬇️'
      case 'concat':
        return '🔗'
      case 'merge':
        return '🔀'
      default:
        return '📊'
    }
  })

  // 聚合类型名称
  const aggregationName = computed(() => {
    const names = {
      sum: '求和',
      average: '平均值',
      count: '计数',
      max: '最大值',
      min: '最小值',
      concat: '连接',
      merge: '合并'
    }
    return names[props.data.aggregationType] || '聚合'
  })

  // 更新节点数据
  const updateData = (updates: Partial<AggregateNodeData>) => {
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
  const handleInputChange = (key: keyof AggregateNodeData, event: Event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    if (target) {
      updateData({ [key]: target.value })
    }
  }

  // 处理输入字段更新
  const handleInputFieldsChange = (event: Event) => {
    const target = event.target as HTMLTextAreaElement
    const fields = target.value.split('\n').filter(field => field.trim())
    updateData({ inputFields: fields })
  }

  // 格式化输入字段显示
  const formattedInputFields = computed(() => {
    return props.data.inputFields.join('\n')
  })
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
        <div class="node-type">聚合节点</div>
      </div>
      <div class="node-actions">
        <button class="node-action-button" @click.stop="toggleConfig" title="配置">⚙️</button>
      </div>
    </div>

    <!-- 节点主体 -->
    <div class="node-body">
      <div class="aggregation-info">
        <div class="aggregation-type">
          <span class="type-icon">{{ aggregationIcon }}</span>
          <span class="type-label">{{ aggregationName }}</span>
        </div>
        
        <div class="aggregation-details">
          <div class="detail-item">
            输出字段: {{ data.outputField }}
          </div>
          <div v-if="data.inputFields.length > 0" class="detail-item">
            输入字段: {{ data.inputFields.length }}个
          </div>
          <div v-if="data.groupBy" class="detail-item">
            分组: {{ data.groupBy }}
          </div>
        </div>
      </div>
    </div>

    <!-- 配置面板 -->
    <div v-if="showConfig" class="node-config-panel" @click.stop>
      <div class="config-header">
        <h4>聚合节点配置</h4>
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
          <label>聚合类型:</label>
          <select
            :value="data.aggregationType"
            @change="handleInputChange('aggregationType', $event)"
            class="config-select"
          >
            <option value="sum">求和</option>
            <option value="average">平均值</option>
            <option value="count">计数</option>
            <option value="max">最大值</option>
            <option value="min">最小值</option>
            <option value="concat">连接</option>
            <option value="merge">合并</option>
          </select>
        </div>

        <div class="config-field">
          <label>输入字段 (每行一个):</label>
          <textarea
            :value="formattedInputFields"
            @input="handleInputFieldsChange"
            class="config-textarea"
            rows="4"
            placeholder="field1&#10;field2&#10;field3"
          />
        </div>

        <div class="config-field">
          <label>输出字段名:</label>
          <input
            :value="data.outputField"
            @input="handleInputChange('outputField', $event)"
            class="config-input"
            placeholder="result"
          />
        </div>

        <div class="config-field">
          <label>分组字段 (可选):</label>
          <input
            :value="data.groupBy || ''"
            @input="handleInputChange('groupBy', $event)"
            class="config-input"
            placeholder="groupBy字段名"
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
      id="output"
      type="source"
      :position="Position.Right"
      class="node-handle node-handle--output"
    />
  </div>
</template>

<style scoped>
  .aggregate-node {
    background: var(--vf-node-bg);
    border: 2px solid var(--color-secondary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    min-width: 200px;
    max-width: 280px;
    transition: var(--transition-fast);
    position: relative;
    cursor: pointer;
  }

  /* .aggregate-node:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
  } */

  .aggregate-node--selected {
    border-color: var(--color-secondary);
    box-shadow: 0 0 0 2px var(--color-secondary), var(--shadow-lg);
  }

  .aggregate-node--running {
    border-color: var(--color-warning);
    animation: pulse 2s infinite;
  }

  .aggregate-node--success {
    border-color: var(--color-success);
  }

  .aggregate-node--error {
    border-color: var(--color-error);
  }

  .node-header {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary));
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

  .aggregate-node:hover .node-actions {
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

  .aggregation-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .aggregation-type {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .type-icon {
    font-size: var(--font-size-lg);
  }

  .type-label {
    font-weight: var(--font-weight-medium);
    color: var(--color-secondary);
  }

  .aggregation-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .detail-item {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
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
    background: var(--color-secondary);
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
    border-color: var(--color-secondary);
    box-shadow: 0 0 0 1px var(--color-secondary);
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
    background: var(--color-secondary);
  }

  @keyframes pulse {
    0%, 100% {
      border-color: var(--color-secondary);
    }
    50% {
      border-color: var(--color-warning);
    }
  }
</style> 