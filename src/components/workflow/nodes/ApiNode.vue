<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { Handle, Position } from '@vue-flow/core'
  import type { ApiNodeData } from '@/types'

  interface Props {
    id: string
    data: ApiNodeData
    selected?: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:data': [data: ApiNodeData]
    'node-click': [nodeId: string]
  }>()

  // 配置面板显示状态
  const showConfig = ref(false)

  // 节点样式
  const nodeClasses = computed(() => [
    'api-node',
    `api-node--${props.data.status || 'idle'}`,
    {
      'api-node--selected': props.selected,
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
        return '🌐'
    }
  })

  // HTTP方法颜色
  const methodColor = computed(() => {
    switch (props.data.method) {
      case 'GET':
        return 'var(--color-success)'
      case 'POST':
        return 'var(--color-primary)'
      case 'PUT':
        return 'var(--color-warning)'
      case 'DELETE':
        return 'var(--color-error)'
      case 'PATCH':
        return 'var(--color-info)'
      default:
        return 'var(--color-text-muted)'
    }
  })

  // 更新节点数据
  const updateData = (updates: Partial<ApiNodeData>) => {
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
  const handleInputChange = (key: keyof ApiNodeData, event: Event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    if (target) {
      updateData({ [key]: target.value })
    }
  }

  const handleNumberChange = (key: keyof ApiNodeData, event: Event) => {
    const target = event.target as HTMLInputElement
    if (target) {
      const value = parseInt(target.value)
      updateData({ [key]: value })
    }
  }

  // 处理headers更新
  const handleHeadersChange = (event: Event) => {
    const target = event.target as HTMLTextAreaElement
    try {
      const headers = JSON.parse(target.value || '{}')
      updateData({ headers })
    } catch (error) {
      // 如果JSON解析失败，不更新
    }
  }

  // 格式化headers显示
  const formattedHeaders = computed(() => {
    return JSON.stringify(props.data.headers || {}, null, 2)
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
        <div class="node-type">API调用</div>
      </div>
      <div class="node-actions">
        <button class="node-action-button" @click.stop="toggleConfig" title="配置">⚙️</button>
      </div>
    </div>

    <!-- 节点主体 -->
    <div class="node-body">
      <div class="api-info">
        <div class="method-url">
          <span class="method-badge" :style="{ backgroundColor: methodColor }">
            {{ data.method }}
          </span>
          <span class="url-display">
            {{ data.url ? data.url.slice(0, 30) + (data.url.length > 30 ? '...' : '') : '未设置URL' }}
          </span>
        </div>
        
        <div class="api-details">
          <div v-if="data.timeout" class="detail-item">
            超时: {{ data.timeout }}ms
          </div>
          <div v-if="data.retries" class="detail-item">
            重试: {{ data.retries }}次
          </div>
          <div v-if="data.headers && Object.keys(data.headers).length > 0" class="detail-item">
            Headers: {{ Object.keys(data.headers).length }}个
          </div>
        </div>
      </div>
    </div>

    <!-- 配置面板 -->
    <div v-if="showConfig" class="node-config-panel" @click.stop>
      <div class="config-header">
        <h4>API节点配置</h4>
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
          <label>HTTP方法:</label>
          <select
            :value="data.method"
            @change="handleInputChange('method', $event)"
            class="config-select"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>

        <div class="config-field">
          <label>URL:</label>
          <input
            :value="data.url"
            @input="handleInputChange('url', $event)"
            class="config-input"
            placeholder="https://api.example.com/endpoint"
          />
        </div>

        <div class="config-field">
          <label>请求头 (JSON格式):</label>
          <textarea
            :value="formattedHeaders"
            @input="handleHeadersChange"
            class="config-textarea"
            rows="4"
            placeholder='{"Content-Type": "application/json"}'
          />
        </div>

        <div v-if="['POST', 'PUT', 'PATCH'].includes(data.method)" class="config-field">
          <label>请求体:</label>
          <textarea
            :value="data.requestBody || ''"
            @input="handleInputChange('requestBody', $event)"
            class="config-textarea"
            rows="4"
            placeholder="JSON请求体内容"
          />
        </div>

        <div class="config-field">
          <label>超时时间 (毫秒):</label>
          <input
            :value="data.timeout || 5000"
            @input="handleNumberChange('timeout', $event)"
            type="number"
            min="1000"
            max="60000"
            class="config-input"
          />
        </div>

        <div class="config-field">
          <label>重试次数:</label>
          <input
            :value="data.retries || 0"
            @input="handleNumberChange('retries', $event)"
            type="number"
            min="0"
            max="5"
            class="config-input"
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
      id="output-success"
      type="source"
      :position="Position.Right"
      :style="{ top: '60%' }"
      class="node-handle node-handle--output node-handle--success"
    />
    <Handle
      id="output-error"
      type="source"
      :position="Position.Right"
      :style="{ top: '80%' }"
      class="node-handle node-handle--output node-handle--error"
    />
  </div>
</template>

<style scoped>
  .api-node {
    background: var(--vf-node-bg);
    border: 2px solid var(--color-success);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    min-width: 220px;
    max-width: 300px;
    transition: var(--transition-fast);
    position: relative;
    cursor: pointer;
  }

  /* .api-node:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
  } */

  .api-node--selected {
    border-color: var(--color-success);
    box-shadow: 0 0 0 2px var(--color-success), var(--shadow-lg);
  }

  .api-node--running {
    border-color: var(--color-warning);
    animation: pulse 2s infinite;
  }

  .api-node--success {
    border-color: var(--color-success);
  }

  .api-node--error {
    border-color: var(--color-error);
  }

  .node-header {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background: linear-gradient(135deg, var(--color-success), var(--color-success));
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

  .api-node:hover .node-actions {
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

  .api-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .method-url {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .method-badge {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    color: white;
    min-width: 50px;
    text-align: center;
  }

  .url-display {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    font-family: monospace;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .api-details {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .detail-item {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    background: var(--color-surface);
    padding: var(--spacing-xs);
    border-radius: var(--radius-sm);
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
    background: var(--color-success);
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
    max-height: 400px;
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
    font-family: monospace;
  }

  .config-input:focus,
  .config-select:focus,
  .config-textarea:focus {
    outline: none;
    border-color: var(--color-success);
    box-shadow: 0 0 0 1px var(--color-success);
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

  .node-handle--success {
    background: var(--color-success);
  }

  .node-handle--error {
    background: var(--color-error);
  }

  @keyframes pulse {
    0%, 100% {
      border-color: var(--color-success);
    }
    50% {
      border-color: var(--color-warning);
    }
  }
</style> 