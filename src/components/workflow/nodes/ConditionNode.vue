<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { Handle, Position } from '@vue-flow/core'
  import type { ConditionNodeData } from '@/types'

  interface Props {
    id: string
    data: ConditionNodeData
    selected?: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:data': [data: ConditionNodeData]
    'node-click': [nodeId: string]
  }>()

  // 配置面板显示状态
  const showConfig = ref(false)

  // 节点样式
  const nodeClasses = computed(() => [
    'condition-node',
    `condition-node--${props.data.status || 'idle'}`,
    {
      'condition-node--selected': props.selected,
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
        return '🔀'
    }
  })

  // 更新节点数据
  const updateData = (updates: Partial<ConditionNodeData>) => {
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
  const handleInputChange = (key: keyof ConditionNodeData, event: Event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement
    if (target) {
      updateData({ [key]: target.value })
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
      <div class="node-status">
        {{ statusIcon }}
      </div>
      <div class="node-info">
        <div class="node-title">{{ data.label }}</div>
        <div class="node-type">条件判断</div>
      </div>
      <div class="node-actions">
        <button class="node-action-button" @click.stop="toggleConfig" title="配置">⚙️</button>
      </div>
    </div>

    <!-- 节点主体 -->
    <div class="node-body">
      <div class="condition-preview">
        <div class="condition-label">条件:</div>
        <div class="condition-text">
          {{
            data.condition
              ? data.condition.slice(0, 30) + (data.condition.length > 30 ? '...' : '')
              : '未设置条件'
          }}
        </div>
      </div>

      <div class="paths-info">
        <div class="path-item true-path">
          <span class="path-icon">✓</span>
          <span class="path-label">真分支</span>
        </div>
        <div class="path-item false-path">
          <span class="path-icon">✗</span>
          <span class="path-label">假分支</span>
        </div>
      </div>
    </div>

    <!-- 配置面板 -->
    <div v-if="showConfig" class="node-config-panel" @click.stop>
      <div class="config-header">
        <h4>条件节点配置</h4>
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
          <label>条件表达式:</label>
          <textarea
            :value="data.condition"
            @input="handleInputChange('condition', $event)"
            class="config-textarea"
            rows="3"
            placeholder="例如: input.value > 100"
          />
        </div>

        <div class="config-field">
          <label>真分支路径:</label>
          <input
            :value="data.truePath || ''"
            @input="handleInputChange('truePath', $event)"
            class="config-input"
            placeholder="条件为真时的处理逻辑"
          />
        </div>

        <div class="config-field">
          <label>假分支路径:</label>
          <input
            :value="data.falsePath || ''"
            @input="handleInputChange('falsePath', $event)"
            class="config-input"
            placeholder="条件为假时的处理逻辑"
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
    <div v-if="data.error" class="node-error">
      {{ data.error }}
    </div>

    <!-- 输出句柄 -->
    <Handle
      id="output-true"
      type="source"
      :position="Position.Right"
      :style="{ top: '60%' }"
      class="node-handle node-handle--output node-handle--true"
    />
    <Handle
      id="output-false"
      type="source"
      :position="Position.Right"
      :style="{ top: '80%' }"
      class="node-handle node-handle--output node-handle--false"
    />
  </div>
</template>

<style scoped>
  .condition-node {
    background: var(--vf-node-bg);
    border: 2px solid var(--color-warning);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    min-width: 200px;
    max-width: 280px;
    transition: var(--transition-fast);
    position: relative;
    cursor: pointer;
  }

  /* .condition-node:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
  } */

  .condition-node--selected {
    border-color: var(--color-warning);
    box-shadow:
      0 0 0 2px var(--color-warning),
      var(--shadow-lg);
  }

  .condition-node--running {
    border-color: var(--color-info);
    animation: pulse 2s infinite;
  }

  .condition-node--success {
    border-color: var(--color-success);
  }

  .condition-node--error {
    border-color: var(--color-error);
  }

  .node-header {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background: linear-gradient(135deg, var(--color-warning), var(--color-warning));
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

  .condition-node:hover .node-actions {
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

  .condition-preview {
    margin-bottom: var(--spacing-sm);
  }

  .condition-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    margin-bottom: 2px;
  }

  .condition-text {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    font-style: italic;
    line-height: 1.4;
  }

  .paths-info {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-sm);
  }

  .path-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-xs);
  }

  .true-path {
    color: var(--color-success);
  }

  .false-path {
    color: var(--color-error);
  }

  .path-icon {
    font-weight: bold;
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
    background: var(--color-warning);
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
  .config-textarea:focus {
    outline: none;
    border-color: var(--color-warning);
    box-shadow: 0 0 0 1px var(--color-warning);
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

  .node-handle--true {
    background: var(--color-success);
  }

  .node-handle--false {
    background: var(--color-error);
  }

  @keyframes pulse {
    0%,
    100% {
      border-color: var(--color-info);
    }
    50% {
      border-color: var(--color-warning);
    }
  }
</style>
