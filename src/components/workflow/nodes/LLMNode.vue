<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { Handle, Position } from '@vue-flow/core'
  import type { AINodeData } from '@/types'

  interface Props {
    id: string
    data: AINodeData
    selected?: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:data': [data: AINodeData]
    'node-click': [nodeId: string]
  }>()

  // 配置面板显示状态
  const showConfig = ref(false)

  // 节点样式
  const nodeClasses = computed(() => [
    'llm-node',
    `llm-node--${props.data.status || 'idle'}`,
    {
      'llm-node--selected': props.selected,
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
        return '🤖'
    }
  })

  // 提供商图标
  const providerIcon = computed(() => {
    switch (props.data.provider) {
      case 'openai':
        return '🧠'
      case 'anthropic':
        return '🔮'
      case 'local':
        return '💻'
      default:
        return '🤖'
    }
  })

  // 更新节点数据
  const updateData = (updates: Partial<AINodeData>) => {
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
  const handleInputChange = (key: keyof AINodeData, event: Event) => {
    const target = event.target as HTMLInputElement
    if (target) {
      updateData({ [key]: target.value })
    }
  }

  const handleNumberChange = (key: keyof AINodeData, event: Event) => {
    const target = event.target as HTMLInputElement
    if (target) {
      const value = key === 'temperature' ? parseFloat(target.value) : parseInt(target.value)
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
      <div class="node-status">
        {{ statusIcon }}
      </div>
      <div class="node-info">
        <div class="node-title">{{ data.label }}</div>
        <div class="node-provider">{{ providerIcon }} {{ data.provider }}</div>
      </div>
      <div class="node-actions">
        <button class="node-action-button" @click.stop="toggleConfig" title="配置">⚙️</button>
      </div>
    </div>

    <!-- 节点主体 -->
    <div class="node-body">
      <div class="node-model">
        <span class="model-label">模型:</span>
        <span class="model-name">{{ data.model }}</span>
      </div>

      <div class="node-prompt">
        <div class="prompt-label">提示词:</div>
        <div class="prompt-preview">
          {{
            data.prompt
              ? data.prompt.slice(0, 50) + (data.prompt.length > 50 ? '...' : '')
              : '未设置'
          }}
        </div>
      </div>

      <div v-if="data.temperature !== undefined" class="node-params">
        <span class="param-item">温度: {{ data.temperature }}</span>
        <span v-if="data.maxTokens" class="param-item">tokens: {{ data.maxTokens }}</span>
      </div>
    </div>

    <!-- 配置面板 -->
    <div v-if="showConfig" class="node-config-panel" @click.stop>
      <div class="config-header">
        <h4>LLM节点配置</h4>
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
          <label>提供商:</label>
          <select
            :value="data.provider"
            @change="handleInputChange('provider', $event)"
            class="config-select"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="local">本地模型</option>
          </select>
        </div>

        <div class="config-field">
          <label>模型:</label>
          <input
            :value="data.model"
            @input="handleInputChange('model', $event)"
            class="config-input"
            placeholder="gpt-4, claude-3, etc."
          />
        </div>

        <div class="config-field">
          <label>提示词:</label>
          <textarea
            :value="data.prompt"
            @input="handleInputChange('prompt', $event)"
            class="config-textarea"
            rows="3"
            placeholder="输入提示词..."
          />
        </div>

        <div class="config-field">
          <label>温度 (0-1):</label>
          <input
            :value="data.temperature || 0.7"
            @input="handleNumberChange('temperature', $event)"
            type="number"
            min="0"
            max="1"
            step="0.1"
            class="config-input"
          />
        </div>

        <div class="config-field">
          <label>最大Token数:</label>
          <input
            :value="data.maxTokens || 2000"
            @input="handleNumberChange('maxTokens', $event)"
            type="number"
            min="1"
            max="100000"
            class="config-input"
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
      id="output"
      type="source"
      :position="Position.Right"
      class="node-handle node-handle--output"
    />
  </div>
</template>

<style scoped>
  .llm-node {
    background: var(--vf-node-bg);
    border: 2px solid var(--color-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    min-width: 240px;
    max-width: 320px;
    transition: var(--transition-fast);
    position: relative;
    cursor: pointer;
  }

  /* .llm-node:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
  } */

  .llm-node--selected {
    border-color: var(--color-primary);
    box-shadow:
      0 0 0 2px var(--color-primary),
      var(--shadow-lg);
  }

  .llm-node--running {
    border-color: var(--color-info);
    animation: pulse 2s infinite;
  }

  .llm-node--success {
    border-color: var(--color-success);
  }

  .llm-node--error {
    border-color: var(--color-error);
  }

  .node-header {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
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

  .node-provider {
    font-size: var(--font-size-xs);
    opacity: 0.9;
  }

  .node-actions {
    opacity: 0;
    transition: var(--transition-fast);
  }

  .llm-node:hover .node-actions {
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

  .node-model {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }

  .model-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .model-name {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-primary);
  }

  .node-prompt {
    margin-bottom: var(--spacing-sm);
  }

  .prompt-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    margin-bottom: 2px;
  }

  .prompt-preview {
    font-size: var(--font-size-xs);
    line-height: 1.4;
    color: var(--color-text-secondary);
    font-style: italic;
  }

  .node-params {
    display: flex;
    gap: var(--spacing-md);
  }

  .param-item {
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
    background: var(--color-primary);
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
    border-color: var(--color-primary);
    box-shadow: 0 0 0 1px var(--color-primary);
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

  @keyframes pulse {
    0%,
    100% {
      border-color: var(--color-info);
    }
    50% {
      border-color: var(--color-primary);
    }
  }
</style>
