# Vue-Flow 后台管理系统组件开发指南

## 📋 目录

1. [组件开发概述](#组件开发概述)
2. [基础组件开发](#基础组件开发)
3. [Vue-Flow节点组件](#vue-flow节点组件)
4. [管理面板组件](#管理面板组件)
5. [布局组件系统](#布局组件系统)
6. [表单组件开发](#表单组件开发)
7. [数据可视化组件](#数据可视化组件)
8. [组件测试指南](#组件测试指南)

---

## 🎯 组件开发概述

### 设计原则

#### 1. 单一职责原则
每个组件应该只负责一个特定的功能或UI片段：

```vue
<!-- ✅ 好的例子：专注于用户头像显示 -->
<script setup lang="ts">
interface Props {
  user: User
  size?: 'small' | 'medium' | 'large'
  showStatus?: boolean
}
</script>

<!-- ❌ 避免：一个组件包含过多功能 -->
<script setup lang="ts">
// UserProfileComponent - 包含头像、信息、编辑、权限等所有功能
</script>
```

#### 2. 组合优于继承
使用组合模式构建复杂组件：

```vue
<!-- AdminUserCard.vue -->
<template>
  <BaseCard>
    <UserAvatar :user="user" />
    <UserInfo :user="user" />
    <UserActions :user="user" @edit="handleEdit" />
  </BaseCard>
</template>
```

#### 3. 可复用性设计
组件应该易于在不同上下文中复用：

```typescript
// 通过props配置不同的行为
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
}
```

### 组件分类

#### 基础组件 (Base Components)
- 按钮、输入框、选择器等基础UI元素
- 不包含业务逻辑，高度可复用
- 命名以`Base`开头

#### 业务组件 (Business Components)
- 包含特定业务逻辑的组件
- 用户管理、工作流编辑等功能组件
- 命名反映具体业务功能

#### 布局组件 (Layout Components)
- 页面结构和布局相关组件
- 侧边栏、头部、面板等
- 命名以功能区域命名

#### Vue-Flow组件 (Flow Components)
- 基于@vue-flow/core的节点和连线组件
- 数据源、处理器、输出等节点
- 命名以节点类型命名

---

## 🧱 基础组件开发

### 按钮组件

```vue
<!-- components/base/BaseButton.vue -->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  block: false,
  iconPosition: 'left'
})

interface Emits {
  click: [event: MouseEvent]
}

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => [
  'base-button',
  `base-button--${props.variant}`,
  `base-button--${props.size}`,
  {
    'base-button--loading': props.loading,
    'base-button--disabled': props.disabled,
    'base-button--block': props.block,
    'base-button--icon-only': props.icon && !$slots.default
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- 加载状态 -->
    <div v-if="loading" class="base-button__loading">
      <svg class="base-button__spinner" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" fill="none" />
      </svg>
    </div>
    
    <!-- 左侧图标 -->
    <span 
      v-if="icon && iconPosition === 'left' && !loading" 
      class="base-button__icon base-button__icon--left"
    >
      {{ icon }}
    </span>
    
    <!-- 按钮内容 -->
    <span v-if="$slots.default" class="base-button__content">
      <slot />
    </span>
    
    <!-- 右侧图标 -->
    <span 
      v-if="icon && iconPosition === 'right' && !loading" 
      class="base-button__icon base-button__icon--right"
    >
      {{ icon }}
    </span>
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
  text-decoration: none;
  user-select: none;
}

.base-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* 尺寸变体 */
.base-button--xs {
  padding: 4px 8px;
  font-size: 12px;
  min-height: 24px;
}

.base-button--sm {
  padding: 6px 12px;
  font-size: 13px;
  min-height: 32px;
}

.base-button--md {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 40px;
}

.base-button--lg {
  padding: 10px 20px;
  font-size: 16px;
  min-height: 48px;
}

.base-button--xl {
  padding: 12px 24px;
  font-size: 18px;
  min-height: 56px;
}

/* 颜色变体 */
.base-button--primary {
  background: #3b82f6;
  color: white;
}

.base-button--primary:hover:not(.base-button--disabled) {
  background: #2563eb;
}

.base-button--secondary {
  background: #6b7280;
  color: white;
}

.base-button--secondary:hover:not(.base-button--disabled) {
  background: #4b5563;
}

.base-button--success {
  background: #10b981;
  color: white;
}

.base-button--success:hover:not(.base-button--disabled) {
  background: #059669;
}

.base-button--warning {
  background: #f59e0b;
  color: white;
}

.base-button--warning:hover:not(.base-button--disabled) {
  background: #d97706;
}

.base-button--danger {
  background: #ef4444;
  color: white;
}

.base-button--danger:hover:not(.base-button--disabled) {
  background: #dc2626;
}

.base-button--ghost {
  background: transparent;
  color: #374151;
  border: 1px solid #d1d5db;
}

.base-button--ghost:hover:not(.base-button--disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* 状态变体 */
.base-button--loading {
  cursor: not-allowed;
  opacity: 0.8;
}

.base-button--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.base-button--block {
  width: 100%;
}

.base-button--icon-only {
  aspect-ratio: 1;
  padding: 8px;
}

/* 图标样式 */
.base-button__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
}

.base-button__loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.base-button__spinner {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.base-button__content {
  display: flex;
  align-items: center;
}
</style>
```

### 输入框组件

```vue
<!-- components/base/BaseInput.vue -->
<script setup lang="ts">
import { ref, computed, useSlots } from 'vue'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string | string[]
  success?: boolean
  size?: 'sm' | 'md' | 'lg'
  prefix?: string
  suffix?: string
  clearable?: boolean
  showPassword?: boolean
  maxlength?: number
  minlength?: number
  min?: number
  max?: number
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  clearable: false,
  showPassword: false
})

interface Emits {
  'update:modelValue': [value: string | number]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  'input': [event: InputEvent]
  'change': [event: Event]
  'clear': []
  'enter': [event: KeyboardEvent]
}

const emit = defineEmits<Emits>()

const slots = useSlots()
const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)
const showPasswordValue = ref(false)

const inputType = computed(() => {
  if (props.type === 'password' && props.showPassword && showPasswordValue.value) {
    return 'text'
  }
  return props.type
})

const hasError = computed(() => {
  return Boolean(props.error && (Array.isArray(props.error) ? props.error.length > 0 : props.error))
})

const errorMessages = computed(() => {
  if (!props.error) return []
  return Array.isArray(props.error) ? props.error : [props.error]
})

const inputClasses = computed(() => [
  'base-input',
  `base-input--${props.size}`,
  {
    'base-input--focused': isFocused.value,
    'base-input--error': hasError.value,
    'base-input--success': props.success,
    'base-input--disabled': props.disabled,
    'base-input--readonly': props.readonly,
    'base-input--has-prefix': props.prefix || slots.prefix,
    'base-input--has-suffix': props.suffix || slots.suffix || props.clearable || (props.type === 'password' && props.showPassword)
  }
])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  
  if (props.type === 'number') {
    value = target.valueAsNumber || 0
  }
  
  emit('update:modelValue', value)
  emit('input', event as InputEvent)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleChange = (event: Event) => {
  emit('change', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    emit('enter', event)
  }
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

const togglePasswordVisibility = () => {
  showPasswordValue.value = !showPasswordValue.value
}

const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

defineExpose({
  focus,
  blur,
  inputRef
})
</script>

<template>
  <div class="base-input-wrapper">
    <div :class="inputClasses">
      <!-- 前缀 -->
      <div v-if="prefix || $slots.prefix" class="base-input__prefix">
        <slot name="prefix">
          <span>{{ prefix }}</span>
        </slot>
      </div>
      
      <!-- 输入框 -->
      <input
        ref="inputRef"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :minlength="minlength"
        :min="min"
        :max="max"
        :step="step"
        class="base-input__field"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        @keydown="handleKeydown"
      />
      
      <!-- 后缀 -->
      <div v-if="suffix || $slots.suffix || clearable || (type === 'password' && showPassword)" class="base-input__suffix">
        <!-- 清除按钮 -->
        <button
          v-if="clearable && modelValue && !disabled && !readonly"
          type="button"
          class="base-input__clear"
          @click="handleClear"
        >
          ✕
        </button>
        
        <!-- 密码显示切换 -->
        <button
          v-if="type === 'password' && showPassword"
          type="button"
          class="base-input__password-toggle"
          @click="togglePasswordVisibility"
        >
          {{ showPasswordValue ? '🙈' : '👁️' }}
        </button>
        
        <!-- 自定义后缀 -->
        <slot name="suffix">
          <span v-if="suffix">{{ suffix }}</span>
        </slot>
      </div>
    </div>
    
    <!-- 错误信息 -->
    <div v-if="hasError" class="base-input__errors">
      <div 
        v-for="(error, index) in errorMessages" 
        :key="index"
        class="base-input__error"
      >
        {{ error }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.base-input {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  transition: all 0.2s ease;
  position: relative;
}

.base-input:hover:not(.base-input--disabled) {
  border-color: #9ca3af;
}

.base-input--focused {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.base-input--error {
  border-color: #ef4444;
}

.base-input--error.base-input--focused {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.base-input--success {
  border-color: #10b981;
}

.base-input--success.base-input--focused {
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.base-input--disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.base-input--readonly {
  background: #f9fafb;
}

/* 尺寸变体 */
.base-input--sm {
  min-height: 32px;
}

.base-input--sm .base-input__field {
  padding: 6px 12px;
  font-size: 13px;
}

.base-input--md {
  min-height: 40px;
}

.base-input--md .base-input__field {
  padding: 8px 12px;
  font-size: 14px;
}

.base-input--lg {
  min-height: 48px;
}

.base-input--lg .base-input__field {
  padding: 12px 16px;
  font-size: 16px;
}

/* 前后缀调整 */
.base-input--has-prefix .base-input__field {
  padding-left: 0;
}

.base-input--has-suffix .base-input__field {
  padding-right: 0;
}

.base-input__field {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #374151;
}

.base-input__field::placeholder {
  color: #9ca3af;
}

.base-input__field:disabled {
  cursor: not-allowed;
  color: #9ca3af;
}

.base-input__prefix,
.base-input__suffix {
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: #6b7280;
  font-size: 14px;
}

.base-input__clear,
.base-input__password-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.base-input__clear:hover,
.base-input__password-toggle:hover {
  background: #f3f4f6;
  color: #374151;
}

.base-input__errors {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.base-input__error {
  font-size: 12px;
  color: #ef4444;
}
</style>
```

---

## 🔗 Vue-Flow节点组件

### 数据源节点

```vue
<!-- components/admin/nodes/DataSourceNode.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import type { AdminModule } from '@/types/admin'

interface Props extends NodeProps<AdminModule> {}

const props = defineProps<Props>()

interface Emits {
  'update:data': [data: AdminModule]
  'configure': [moduleId: string]
  'execute': [moduleId: string]
  'delete': [moduleId: string]
}

const emit = defineEmits<Emits>()

// 本地状态
const isConfiguring = ref(false)
const executionProgress = ref(0)
const lastExecutionTime = ref<Date | null>(null)

// 计算属性
const statusColor = computed(() => {
  switch (props.data.status) {
    case 'active': return '#10b981'
    case 'inactive': return '#6b7280'
    case 'error': return '#ef4444'
    case 'configuring': return '#f59e0b'
    default: return '#6b7280'
  }
})

const statusIcon = computed(() => {
  switch (props.data.status) {
    case 'active': return '✅'
    case 'inactive': return '⭕'
    case 'error': return '❌'
    case 'configuring': return '⚙️'
    default: return '⭕'
  }
})

const connectionInfo = computed(() => {
  const config = props.data.config
  if (config.type === 'database') {
    return `${config.database}@${config.host}`
  } else if (config.type === 'api') {
    return config.endpoint
  } else if (config.type === 'file') {
    return config.filePath
  }
  return 'Unknown'
})

const dataStats = computed(() => {
  const stats = props.data.metadata?.stats || {}
  return {
    recordCount: stats.recordCount || 0,
    lastUpdate: stats.lastUpdate ? new Date(stats.lastUpdate) : null,
    dataSize: stats.dataSize || 0
  }
})

// 事件处理
const handleConfigure = () => {
  isConfiguring.value = true
  emit('configure', props.id)
}

const handleExecute = async () => {
  try {
    emit('execute', props.id)
    // 模拟执行进度
    executionProgress.value = 0
    const interval = setInterval(() => {
      executionProgress.value += 10
      if (executionProgress.value >= 100) {
        clearInterval(interval)
        lastExecutionTime.value = new Date()
        setTimeout(() => {
          executionProgress.value = 0
        }, 2000)
      }
    }, 200)
  } catch (error) {
    console.error('Execution failed:', error)
  }
}

const handleDelete = () => {
  emit('delete', props.id)
}

const updateConfig = (newConfig: Partial<AdminModule['config']>) => {
  const updatedData = {
    ...props.data,
    config: { ...props.data.config, ...newConfig },
    updatedAt: new Date()
  }
  emit('update:data', updatedData)
}

// 监听配置变化
watch(() => props.data.config, (newConfig) => {
  // 配置变化时的副作用处理
}, { deep: true })
</script>

<template>
  <div class="data-source-node" :class="{ 'node-selected': selected }">
    <!-- 输出连接点 -->
    <Handle
      id="output"
      type="source"
      :position="Position.Right"
      class="node-handle output-handle"
      :style="{ background: statusColor }"
    />
    
    <!-- 节点头部 -->
    <div class="node-header">
      <div class="node-icon">
        <span class="icon-emoji">📊</span>
      </div>
      <div class="node-title-section">
        <h3 class="node-title">{{ data.displayName || data.name }}</h3>
        <div class="node-subtitle">数据源</div>
      </div>
      <div class="node-status">
        <span class="status-indicator" :style="{ color: statusColor }">
          {{ statusIcon }}
        </span>
      </div>
    </div>
    
    <!-- 节点内容 -->
    <div class="node-content">
      <!-- 连接信息 -->
      <div class="connection-info">
        <div class="info-label">连接:</div>
        <div class="info-value" :title="connectionInfo">
          {{ connectionInfo }}
        </div>
      </div>
      
      <!-- 数据统计 -->
      <div class="data-stats">
        <div class="stat-item">
          <span class="stat-label">记录数:</span>
          <span class="stat-value">{{ dataStats.recordCount.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">大小:</span>
          <span class="stat-value">{{ formatBytes(dataStats.dataSize) }}</span>
        </div>
      </div>
      
      <!-- 执行进度 -->
      <div v-if="executionProgress > 0" class="execution-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${executionProgress}%` }"
          ></div>
        </div>
        <div class="progress-text">{{ executionProgress }}%</div>
      </div>
      
      <!-- 最后执行时间 -->
      <div v-if="lastExecutionTime" class="last-execution">
        <span class="execution-label">最后执行:</span>
        <span class="execution-time">{{ formatTime(lastExecutionTime) }}</span>
      </div>
    </div>
    
    <!-- 节点操作 -->
    <div class="node-actions">
      <button 
        @click="handleConfigure"
        class="action-button configure-button"
        title="配置数据源"
        :disabled="data.status === 'configuring'"
      >
        ⚙️
      </button>
      <button 
        @click="handleExecute"
        class="action-button execute-button"
        title="执行数据获取"
        :disabled="data.status !== 'active' || executionProgress > 0"
      >
        ▶️
      </button>
      <button 
        @click="handleDelete"
        class="action-button delete-button"
        title="删除节点"
      >
        🗑️
      </button>
    </div>
    
    <!-- 配置面板 -->
    <div v-if="isConfiguring" class="config-overlay">
      <div class="config-panel">
        <h4>数据源配置</h4>
        <DataSourceConfigForm 
          :config="data.config"
          @update="updateConfig"
          @close="isConfiguring = false"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-source-node {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 16px;
  min-width: 280px;
  max-width: 320px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
}

.data-source-node:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.node-selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.node-icon {
  width: 32px;
  height: 32px;
  background: #0ea5e9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.icon-emoji {
  filter: grayscale(1) brightness(0) invert(1);
}

.node-title-section {
  flex: 1;
  min-width: 0;
}

.node-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-subtitle {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.node-status {
  display: flex;
  align-items: center;
}

.status-indicator {
  font-size: 16px;
}

.node-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.connection-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.info-label {
  color: #64748b;
  font-weight: 500;
}

.info-value {
  color: #0f172a;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.data-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
}

.stat-label {
  font-size: 10px;
  color: #64748b;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
}

.execution-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
}

.last-execution {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #64748b;
}

.execution-label {
  font-weight: 500;
}

.node-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.action-button {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.action-button:hover:not(:disabled) {
  background: white;
  transform: scale(1.1);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.configure-button:hover {
  color: #f59e0b;
}

.execute-button:hover {
  color: #10b981;
}

.delete-button:hover {
  color: #ef4444;
}

.node-handle {
  width: 12px;
  height: 12px;
  border: 2px solid white;
  border-radius: 50%;
}

.output-handle {
  right: -6px;
}

.config-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.config-panel {
  background: white;
  border-radius: 8px;
  padding: 16px;
  max-width: 300px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.config-panel h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}
</style>
```

### 数据处理器节点

```vue
<!-- components/admin/nodes/DataProcessorNode.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import type { AdminModule } from '@/types/admin'

interface Props extends NodeProps<AdminModule> {}

const props = defineProps<Props>()

interface Emits {
  'update:data': [data: AdminModule]
  'configure': [moduleId: string]
  'execute': [moduleId: string]
  'delete': [moduleId: string]
}

const emit = defineEmits<Emits>()

// 本地状态
const isProcessing = ref(false)
const processingProgress = ref(0)
const processedCount = ref(0)
const errorCount = ref(0)

// 计算属性
const processorType = computed(() => props.data.config.processorType || 'unknown')

const processorIcon = computed(() => {
  switch (processorType.value) {
    case 'transform': return '🔄'
    case 'filter': return '🔍'
    case 'validate': return '✅'
    case 'enrich': return '➕'
    case 'aggregate': return '📊'
    case 'sort': return '📈'
    default: return '⚙️'
  }
})

const processorColor = computed(() => {
  switch (props.data.status) {
    case 'active': return '#8b5cf6'
    case 'inactive': return '#6b7280'
    case 'error': return '#ef4444'
    case 'configuring': return '#f59e0b'
    default: return '#6b7280'
  }
})

const performanceStats = computed(() => {
  const stats = props.data.metadata?.performance || {}
  return {
    avgProcessingTime: stats.avgProcessingTime || 0,
    throughput: stats.throughput || 0,
    successRate: stats.successRate || 0
  }
})

const processingRules = computed(() => {
  return props.data.config.rules || []
})

// 事件处理
const handleConfigure = () => {
  emit('configure', props.id)
}

const handleExecute = async () => {
  if (isProcessing.value) return
  
  isProcessing.value = true
  processingProgress.value = 0
  processedCount.value = 0
  errorCount.value = 0
  
  emit('execute', props.id)
  
  // 模拟处理进度
  const interval = setInterval(() => {
    processingProgress.value += Math.random() * 15
    processedCount.value += Math.floor(Math.random() * 10) + 1
    
    if (Math.random() < 0.1) {
      errorCount.value += 1
    }
    
    if (processingProgress.value >= 100) {
      clearInterval(interval)
      processingProgress.value = 100
      setTimeout(() => {
        isProcessing.value = false
        processingProgress.value = 0
      }, 1000)
    }
  }, 300)
}

const handleDelete = () => {
  emit('delete', props.id)
}

const updateProcessorConfig = (newConfig: any) => {
  const updatedData = {
    ...props.data,
    config: { ...props.data.config, ...newConfig },
    updatedAt: new Date()
  }
  emit('update:data', updatedData)
}
</script>

<template>
  <div class="data-processor-node" :class="{ 'node-selected': selected, 'processing': isProcessing }">
    <!-- 输入连接点 -->
    <Handle
      id="input"
      type="target"
      :position="Position.Left"
      class="node-handle input-handle"
    />
    
    <!-- 输出连接点 -->
    <Handle
      id="output"
      type="source"
      :position="Position.Right"
      class="node-handle output-handle"
      :style="{ background: processorColor }"
    />
    
    <!-- 节点头部 -->
    <div class="node-header">
      <div class="node-icon" :style="{ background: processorColor }">
        <span class="icon-emoji">{{ processorIcon }}</span>
      </div>
      <div class="node-title-section">
        <h3 class="node-title">{{ data.displayName || data.name }}</h3>
        <div class="node-subtitle">{{ processorType }} 处理器</div>
      </div>
      <div class="node-status">
        <div 
          class="status-dot" 
          :style="{ background: processorColor }"
          :class="{ 'pulsing': isProcessing }"
        ></div>
      </div>
    </div>
    
    <!-- 节点内容 -->
    <div class="node-content">
      <!-- 处理规则 -->
      <div v-if="processingRules.length > 0" class="processing-rules">
        <div class="rules-label">处理规则:</div>
        <div class="rules-list">
          <div 
            v-for="(rule, index) in processingRules.slice(0, 2)" 
            :key="index"
            class="rule-item"
          >
            {{ rule.name || `规则 ${index + 1}` }}
          </div>
          <div v-if="processingRules.length > 2" class="rule-more">
            +{{ processingRules.length - 2 }} 更多
          </div>
        </div>
      </div>
      
      <!-- 性能统计 -->
      <div class="performance-stats">
        <div class="stat-grid">
          <div class="stat-item">
            <div class="stat-value">{{ performanceStats.avgProcessingTime }}ms</div>
            <div class="stat-label">平均耗时</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ performanceStats.throughput }}/s</div>
            <div class="stat-label">吞吐量</div>
          </div>
        </div>
        <div class="success-rate">
          <div class="rate-label">成功率:</div>
          <div class="rate-bar">
            <div 
              class="rate-fill" 
              :style="{ width: `${performanceStats.successRate}%` }"
            ></div>
          </div>
          <div class="rate-text">{{ performanceStats.successRate }}%</div>
        </div>
      </div>
      
      <!-- 处理进度 -->
      <div v-if="isProcessing" class="processing-status">
        <div class="progress-section">
          <div class="progress-label">处理进度</div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${processingProgress}%` }"
            ></div>
          </div>
          <div class="progress-text">{{ Math.round(processingProgress) }}%</div>
        </div>
        
        <div class="processing-stats">
          <div class="processing-stat">
            <span class="stat-icon">✅</span>
            <span class="stat-count">{{ processedCount }}</span>
          </div>
          <div v-if="errorCount > 0" class="processing-stat error">
            <span class="stat-icon">❌</span>
            <span class="stat-count">{{ errorCount }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 节点操作 -->
    <div class="node-actions">
      <button 
        @click="handleConfigure"
        class="action-button configure-button"
        title="配置处理器"
      >
        ⚙️
      </button>
      <button 
        @click="handleExecute"
        class="action-button execute-button"
        title="执行处理"
        :disabled="data.status !== 'active' || isProcessing"
      >
        {{ isProcessing ? '⏸️' : '▶️' }}
      </button>
      <button 
        @click="handleDelete"
        class="action-button delete-button"
        title="删除节点"
      >
        🗑️
      </button>
    </div>
  </div>
</template>

<style scoped>
.data-processor-node {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border: 2px solid #8b5cf6;
  border-radius: 12px;
  padding: 16px;
  min-width: 300px;
  max-width: 350px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
}

.data-processor-node:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.data-processor-node.processing {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.node-selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.node-icon {
  width: 32px;
  height: 32px;
  background: #8b5cf6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.icon-emoji {
  filter: grayscale(1) brightness(0) invert(1);
}

.node-title-section {
  flex: 1;
  min-width: 0;
}

.node-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-subtitle {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.node-status {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8b5cf6;
}

.status-dot.pulsing {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

.node-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.processing-rules {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rules-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.rules-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.rule-item {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.rule-more {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

.performance-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
}

.stat-value {
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
}

.stat-label {
  font-size: 9px;
  color: #64748b;
  margin-top: 2px;
}

.success-rate {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
}

.rate-label {
  color: #64748b;
  font-weight: 500;
}

.rate-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
  overflow: hidden;
}

.rate-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.rate-text {
  color: #0f172a;
  font-weight: 500;
}

.processing-status {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  padding: 8px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #8b5cf6;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 10px;
  color: #0f172a;
  font-weight: 500;
}

.processing-stats {
  display: flex;
  gap: 12px;
}

.processing-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}

.processing-stat.error .stat-icon {
  color: #ef4444;
}

.stat-icon {
  font-size: 12px;
}

.stat-count {
  font-weight: 600;
  color: #0f172a;
}

.node-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.action-button {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.action-button:hover:not(:disabled) {
  background: white;
  transform: scale(1.1);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.configure-button:hover {
  color: #f59e0b;
}

.execute-button:hover {
  color: #10b981;
}

.delete-button:hover {
  color: #ef4444;
}

.node-handle {
  width: 12px;
  height: 12px;
  border: 2px solid white;
  border-radius: 50%;
}

.input-handle {
  left: -6px;
  background: #f59e0b;
}

.output-handle {
  right: -6px;
}
</style>
```

---

## 📊 管理面板组件

### 用户管理面板

```vue
<!-- components/admin/panels/UserManagementPanel.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/admin/users'
import { useUIStore } from '@/stores/ui'
import type { AdminUser, UserRole, UserStatus } from '@/types/admin'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import UserListItem from './UserListItem.vue'
import UserCreateModal from './UserCreateModal.vue'
import UserEditModal from './UserEditModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

// Store实例
const userStore = useUserStore()
const uiStore = useUIStore()

// 本地状态
const searchQuery = ref('')
const selectedRole = ref<UserRole | 'all'>('all')
const selectedStatus = ref<UserStatus | 'all'>('all')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const editingUser = ref<AdminUser | null>(null)
const deletingUser = ref<AdminUser | null>(null)

// 计算属性
const filteredUsers = computed(() => {
  let users = userStore.users
  
  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    users = users.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.firstName && user.firstName.toLowerCase().includes(query)) ||
      (user.lastName && user.lastName.toLowerCase().includes(query))
    )
  }
  
  // 角色过滤
  if (selectedRole.value !== 'all') {
    users = users.filter(user => user.role === selectedRole.value)
  }
  
  // 状态过滤
  if (selectedStatus.value !== 'all') {
    users = users.filter(user => user.status === selectedStatus.value)
  }
  
  return users
})

const userStats = computed(() => ({
  total: userStore.users.length,
  active: userStore.activeUsers.length,
  inactive: userStore.inactiveUsers.length,
  suspended: userStore.suspendedUsers.length,
  byRole: userStore.usersByRole
}))

const hasSelection = computed(() => userStore.selectedUsers.length > 0)

const canBulkDelete = computed(() => {
  return userStore.selectedUserObjects.every(user => 
    user.role !== 'super_admin' && user.id !== userStore.currentUser?.id
  )
})

// 生命周期
onMounted(async () => {
  await userStore.fetchUsers()
})

// 监听搜索查询变化
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    userStore.searchUsers(newQuery)
  } else {
    userStore.fetchUsers()
  }
}, { debounce: 300 })

// 事件处理
const handleCreateUser = () => {
  showCreateModal.value = true
}

const handleUserCreated = async (userData: any) => {
  try {
    await userStore.createUser(userData)
    showCreateModal.value = false
    uiStore.showSuccess('创建成功', `用户 "${userData.username}" 已创建`)
  } catch (error) {
    uiStore.showError('创建失败', error.message)
  }
}

const handleEditUser = (user: AdminUser) => {
  editingUser.value = user
  showEditModal.value = true
}

const handleUserUpdated = async (userData: any) => {
  if (!editingUser.value) return
  
  try {
    await userStore.updateUser(editingUser.value.id, userData)
    showEditModal.value = false
    editingUser.value = null
    uiStore.showSuccess('更新成功', '用户信息已更新')
  } catch (error) {
    uiStore.showError('更新失败', error.message)
  }
}

const handleDeleteUser = (user: AdminUser) => {
  deletingUser.value = user
  showDeleteConfirm.value = true
}

const confirmDeleteUser = async () => {
  if (!deletingUser.value) return
  
  try {
    await userStore.deleteUser(deletingUser.value.id)
    showDeleteConfirm.value = false
    deletingUser.value = null
    uiStore.showSuccess('删除成功', '用户已删除')
  } catch (error) {
    uiStore.showError('删除失败', error.message)
  }
}

const handleBulkDelete = () => {
  if (!canBulkDelete.value) return
  
  uiStore.showConfirmDialog(
    '批量删除用户',
    `确定要删除选中的 ${userStore.selectedUsers.length} 个用户吗？此操作不可撤销。`,
    async () => {
      try {
        await userStore.deleteUsers(userStore.selectedUsers)
        uiStore.showSuccess('删除成功', `已删除 ${userStore.selectedUsers.length} 个用户`)
      } catch (error) {
        uiStore.showError('删除失败', error.message)
      }
    }
  )
}

const handleUserStatusChange = async (user: AdminUser, newStatus: UserStatus) => {
  try {
    await userStore.updateUserStatus(user.id, newStatus)
    uiStore.showSuccess('状态更新', `用户状态已更新为 ${newStatus}`)
  } catch (error) {
    uiStore.showError('状态更新失败', error.message)
  }
}

const handleResetPassword = async (user: AdminUser) => {
  try {
    const tempPassword = await userStore.resetUserPassword(user.id)
    uiStore.showSuccess(
      '密码重置成功', 
      `临时密码: ${tempPassword}，请通知用户尽快修改密码`
    )
  } catch (error) {
    uiStore.showError('密码重置失败', error.message)
  }
}

const handleSelectAll = () => {
  if (userStore.selectedUsers.length === filteredUsers.value.length) {
    userStore.clearSelection()
  } else {
    userStore.clearSelection()
    filteredUsers.value.forEach(user => {
      userStore.selectUser(user.id)
    })
  }
}

const handleRoleFilter = (role: UserRole | 'all') => {
  selectedRole.value = role
}

const handleStatusFilter = (status: UserStatus | 'all') => {
  selectedStatus.value = status
}
</script>

<template>
  <div class="user-management-panel">
    <!-- 面板头部 -->
    <div class="panel-header">
      <div class="header-left">
        <h2 class="panel-title">用户管理</h2>
        <div class="user-count">{{ userStats.total }} 个用户</div>
      </div>
      <div class="header-right">
        <BaseButton
          variant="primary"
          icon="➕"
          @click="handleCreateUser"
        >
          新建用户
        </BaseButton>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.total }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </div>
        
        <div class="stat-card active">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.active }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </div>
        
        <div class="stat-card inactive">
          <div class="stat-icon">⭕</div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.inactive }}</div>
            <div class="stat-label">非活跃用户</div>
          </div>
        </div>
        
        <div class="stat-card suspended">
          <div class="stat-icon">🚫</div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.suspended }}</div>
            <div class="stat-label">已暂停</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 过滤和搜索 -->
    <div class="filters-section">
      <div class="filters-row">
        <!-- 搜索框 -->
        <div class="search-box">
          <BaseInput
            v-model="searchQuery"
            placeholder="搜索用户名、邮箱..."
            prefix="🔍"
            clearable
            class="search-input"
          />
        </div>
        
        <!-- 角色过滤 -->
        <div class="filter-group">
          <label class="filter-label">角色:</label>
          <select 
            v-model="selectedRole" 
            class="filter-select"
            @change="handleRoleFilter(selectedRole)"
          >
            <option value="all">所有角色</option>
            <option value="super_admin">超级管理员</option>
            <option value="admin">管理员</option>
            <option value="editor">编辑者</option>
            <option value="viewer">查看者</option>
          </select>
        </div>
        
        <!-- 状态过滤 -->
        <div class="filter-group">
          <label class="filter-label">状态:</label>
          <select 
            v-model="selectedStatus" 
            class="filter-select"
            @change="handleStatusFilter(selectedStatus)"
          >
            <option value="all">所有状态</option>
            <option value="active">活跃</option>
            <option value="inactive">非活跃</option>
            <option value="suspended">已暂停</option>
            <option value="pending">待激活</option>
          </select>
        </div>
      </div>
      
      <!-- 批量操作 -->
      <div v-if="hasSelection" class="bulk-actions">
        <div class="selection-info">
          已选择 {{ userStore.selectedUsers.length }} 个用户
        </div>
        <div class="bulk-buttons">
          <BaseButton
            variant="danger"
            size="sm"
            icon="🗑️"
            :disabled="!canBulkDelete"
            @click="handleBulkDelete"
          >
            批量删除
          </BaseButton>
          <BaseButton
            variant="secondary"
            size="sm"
            @click="userStore.clearSelection"
          >
            取消选择
          </BaseButton>
        </div>
      </div>
    </div>
    
    <!-- 用户列表 -->
    <div class="users-section">
      <!-- 列表头部 -->
      <div class="list-header">
        <div class="header-cell checkbox-cell">
          <input
            type="checkbox"
            :checked="userStore.selectedUsers.length === filteredUsers.length && filteredUsers.length > 0"
            :indeterminate="userStore.selectedUsers.length > 0 && userStore.selectedUsers.length < filteredUsers.length"
            @change="handleSelectAll"
            class="header-checkbox"
          />
        </div>
        <div class="header-cell user-cell">用户</div>
        <div class="header-cell role-cell">角色</div>
        <div class="header-cell status-cell">状态</div>
        <div class="header-cell date-cell">创建时间</div>
        <div class="header-cell actions-cell">操作</div>
      </div>
      
      <!-- 用户列表 -->
      <div class="user-list">
        <UserListItem
          v-for="user in filteredUsers"
          :key="user.id"
          :user="user"
          :selected="userStore.selectedUsers.includes(user.id)"
          @select="userStore.toggleUserSelection(user.id)"
          @edit="handleEditUser"
          @delete="handleDeleteUser"
          @status-change="handleUserStatusChange"
          @reset-password="handleResetPassword"
        />
        
        <!-- 空状态 -->
        <div v-if="filteredUsers.length === 0" class="empty-state">
          <div class="empty-icon">👤</div>
          <div class="empty-title">没有找到用户</div>
          <div class="empty-description">
            {{ searchQuery ? '尝试调整搜索条件' : '点击上方按钮创建第一个用户' }}
          </div>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="userStore.loading" class="loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>
    </div>
    
    <!-- 分页 -->
    <div v-if="userStore.pagination.totalPages > 1" class="pagination-section">
      <div class="pagination-info">
        显示第 {{ (userStore.pagination.page - 1) * userStore.pagination.pageSize + 1 }} - 
        {{ Math.min(userStore.pagination.page * userStore.pagination.pageSize, userStore.pagination.total) }} 条，
        共 {{ userStore.pagination.total }} 条
      </div>
      <div class="pagination-controls">
        <BaseButton
          variant="ghost"
          size="sm"
          :disabled="!userStore.hasPreviousPage"
          @click="userStore.previousPage"
        >
          上一页
        </BaseButton>
        <span class="page-info">
          {{ userStore.pagination.page }} / {{ userStore.pagination.totalPages }}
        </span>
        <BaseButton
          variant="ghost"
          size="sm"
          :disabled="!userStore.hasNextPage"
          @click="userStore.nextPage"
        >
          下一页
        </BaseButton>
      </div>
    </div>
    
    <!-- 模态框 -->
    <UserCreateModal
      v-if="showCreateModal"
      @created="handleUserCreated"
      @cancel="showCreateModal = false"
    />
    
    <UserEditModal
      v-if="showEditModal && editingUser"
      :user="editingUser"
      @updated="handleUserUpdated"
      @cancel="showEditModal = false; editingUser = null"
    />
    
    <ConfirmDialog
      v-if="showDeleteConfirm && deletingUser"
      title="删除用户"
      :content="`确定要删除用户 "${deletingUser.username}" 吗？此操作不可撤销。`"
      confirm-text="删除"
      cancel-text="取消"
      variant="danger"
      @confirm="confirmDeleteUser"
      @cancel="showDeleteConfirm = false; deletingUser = null"
    />
  </div>
</template>

<style scoped>
.user-management-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.panel-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.user-count {
  font-size: 14px;
  color: #6b7280;
}

.stats-section {
  padding: 0 24px 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid;
}

.stat-card.total {
  background: #f8fafc;
  border-left-color: #64748b;
}

.stat-card.active {
  background: #f0fdf4;
  border-left-color: #10b981;
}

.stat-card.inactive {
  background: #f9fafb;
  border-left-color: #6b7280;
}

.stat-card.suspended {
  background: #fef2f2;
  border-left-color: #ef4444;
}

.stat-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.filters-section {
  padding: 0 24px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.filters-row {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.search-box {
  flex: 1;
  max-width: 300px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.filter-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  min-width: 120px;
}

.bulk-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
}

.selection-info {
  font-size: 14px;
  color: #0369a1;
  font-weight: 500;
}

.bulk-buttons {
  display: flex;
  gap: 8px;
}

.users-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.list-header {
  display: grid;
  grid-template-columns: 40px 1fr 120px 100px 120px 120px;
  gap: 16px;
  padding: 16px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-cell {
  display: flex;
  align-items: center;
}

.header-checkbox {
  width: 16px;
  height: 16px;
}

.user-list {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #6b7280;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #6b7280;
}

.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
}

.pagination-info {
  font-size: 14px;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-info {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}
</style>
```

---

## 📝 组件测试指南

### 单元测试示例

```typescript
// tests/components/base/BaseButton.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '@/components/base/BaseButton.vue'

describe('BaseButton', () => {
  describe('渲染测试', () => {
    it('应该正确渲染按钮文本', () => {
      const wrapper = mount(BaseButton, {
        slots: {
          default: 'Click me'
        }
      })
      
      expect(wrapper.text()).toContain('Click me')
    })
    
    it('应该应用正确的变体类名', () => {
      const wrapper = mount(BaseButton, {
        props: {
          variant: 'danger',
          size: 'lg'
        }
      })
      
      expect(wrapper.classes()).toContain('base-button--danger')
      expect(wrapper.classes()).toContain('base-button--lg')
    })
    
    it('应该显示加载状态', () => {
      const wrapper = mount(BaseButton, {
        props: {
          loading: true
        }
      })
      
      expect(wrapper.find('.base-button__loading').exists()).toBe(true)
      expect(wrapper.find('.base-button__spinner').exists()).toBe(true)
    })
  })
  
  describe('交互测试', () => {
    it('应该触发点击事件', async () => {
      const wrapper = mount(BaseButton)
      
      await wrapper.trigger('click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })
    
    it('禁用状态下不应该触发点击事件', async () => {
      const wrapper = mount(BaseButton, {
        props: {
          disabled: true
        }
      })
      
      await wrapper.trigger('click')
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })
    
    it('加载状态下不应该触发点击事件', async () => {
      const wrapper = mount(BaseButton, {
        props: {
          loading: true
        }
      })
      
      await wrapper.trigger('click')
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })
  
  describe('可访问性测试', () => {
    it('应该设置正确的disabled属性', () => {
      const wrapper = mount(BaseButton, {
        props: {
          disabled: true
        }
      })
      
      expect(wrapper.attributes('disabled')).toBeDefined()
    })
    
    it('应该支持键盘导航', async () => {
      const wrapper = mount(BaseButton)
      
      await wrapper.trigger('keydown.enter')
      // 测试键盘事件处理
    })
  })
})
```

### Vue-Flow组件测试

```typescript
// tests/components/admin/nodes/DataSourceNode.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DataSourceNode from '@/components/admin/nodes/DataSourceNode.vue'
import type { AdminModule } from '@/types/admin'

// Mock vue-flow
vi.mock('@vue-flow/core', () => ({
  Handle: {
    name: 'Handle',
    template: '<div class="mock-handle"></div>'
  },
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom'
  }
}))

const mockModule: AdminModule = {
  id: 'test-node',
  name: 'Test Data Source',
  displayName: 'Test Data Source',
  type: 'data-source',
  category: 'input',
  version: '1.0.0',
  config: {
    type: 'database',
    host: 'localhost',
    database: 'test_db'
  },
  position: { x: 0, y: 0 },
  size: { width: 200, height: 100 },
  status: 'active',
  connections: [],
  metadata: {
    stats: {
      recordCount: 1000,
      dataSize: 1024000,
      lastUpdate: new Date().toISOString()
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
}

describe('DataSourceNode', () => {
  describe('渲染测试', () => {
    it('应该正确渲染节点信息', () => {
      const wrapper = mount(DataSourceNode, {
        props: {
          id: 'test-node',
          data: mockModule,
          selected: false
        }
      })
      
      expect(wrapper.text()).toContain('Test Data Source')
      expect(wrapper.text()).toContain('数据源')
      expect(wrapper.text()).toContain('test_db@localhost')
    })
    
    it('应该显示正确的状态指示器', () => {
      const wrapper = mount(DataSourceNode, {
        props: {
          id: 'test-node',
          data: { ...mockModule, status: 'error' },
          selected: false
        }
      })
      
      expect(wrapper.text()).toContain('❌')
    })
    
    it('应该显示数据统计', () => {
      const wrapper = mount(DataSourceNode, {
        props: {
          id: 'test-node',
          data: mockModule,
          selected: false
        }
      })
      
      expect(wrapper.text()).toContain('1,000')
      expect(wrapper.text()).toContain('1.0 MB')
    })
  })
  
  describe('交互测试', () => {
    it('应该触发配置事件', async () => {
      const wrapper = mount(DataSourceNode, {
        props: {
          id: 'test-node',
          data: mockModule,
          selected: false
        }
      })
      
      await wrapper.find('.configure-button').trigger('click')
      
      expect(wrapper.emitted('configure')).toBeTruthy()
      expect(wrapper.emitted('configure')[0]).toEqual(['test-node'])
    })
    
    it('应该触发执行事件', async () => {
      const wrapper = mount(DataSourceNode, {
        props: {
          id: 'test-node',
          data: mockModule,
          selected: false
        }
      })
      
      await wrapper.find('.execute-button').trigger('click')
      
      expect(wrapper.emitted('execute')).toBeTruthy()
      expect(wrapper.emitted('execute')[0]).toEqual(['test-node'])
    })
    
    it('应该触发删除事件', async () => {
      const wrapper = mount(DataSourceNode, {
        props: {
          id: 'test-node',
          data: mockModule,
          selected: false
        }
      })
      
      await wrapper.find('.delete-button').trigger('click')
      
      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')[0]).toEqual(['test-node'])
    })
  })
  
  describe('状态测试', () => {
    it('非活跃状态下执行按钮应该被禁用', () => {
      const wrapper = mount(DataSourceNode, {
        props: {
          id: 'test-node',
          data: { ...mockModule, status: 'inactive' },
          selected: false
        }
      })
      
      const executeButton = wrapper.find('.execute-button')
      expect(executeButton.attributes('disabled')).toBeDefined()
    })
    
    it('配置状态下配置按钮应该被禁用', () => {
      const wrapper = mount(DataSourceNode, {
        props: {
          id: 'test-node',
          data: { ...mockModule, status: 'configuring' },
          selected: false
        }
      })
      
      const configureButton = wrapper.find('.configure-button')
      expect(configureButton.attributes('disabled')).toBeDefined()
    })
  })
})
```

### 集成测试示例

```typescript
// tests/integration/UserManagement.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UserManagementPanel from '@/components/admin/panels/UserManagementPanel.vue'
import { useUserStore } from '@/stores/admin/users'

// Mock API
vi.mock('@/services/admin/userService', () => ({
  userService: {
    getUsers: vi.fn().mockResolvedValue({
      data: [
        {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1
      }
    }),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn()
  }
}))

describe('UserManagement Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('应该正确加载和显示用户列表', async () => {
    const wrapper = mount(UserManagementPanel)
    const userStore = useUserStore()
    
    // 等待数据加载
    await userStore.fetchUsers()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('admin')
    expect(wrapper.text()).toContain('admin@example.com')
  })
  
  it('应该能够搜索用户', async () => {
    const wrapper = mount(UserManagementPanel)
    const userStore = useUserStore()
    
    await userStore.fetchUsers()
    await wrapper.vm.$nextTick()
    
    // 输入搜索关键词
    const searchInput = wrapper.find('.search-input input')
    await searchInput.setValue('admin')
    
    // 验证搜索结果
    expect(wrapper.text()).toContain('admin')
  })
  
  it('应该能够过滤用户角色', async () => {
    const wrapper = mount(UserManagementPanel)
    const userStore = useUserStore()
    
    await userStore.fetchUsers()
    await wrapper.vm.$nextTick()
    
    // 选择角色过滤
    const roleSelect = wrapper.find('.filter-select')
    await roleSelect.setValue('admin')
    
    // 验证过滤结果
    expect(wrapper.text()).toContain('admin')
  })
})
```

---

## 📋 组件开发检查清单

### 开发前准备
- [ ] 确定组件职责和API设计
- [ ] 选择合适的组件类型（基础/业务/布局/Flow）
- [ ] 设计Props和Events接口
- [ ] 考虑可访问性要求

### 组件实现
- [ ] 使用TypeScript定义所有类型
- [ ] 实现响应式数据绑定
- [ ] 添加适当的错误处理
- [ ] 优化组件性能
- [ ] 实现键盘导航支持

### 样式开发
- [ ] 使用CSS变量保持一致性
- [ ] 实现响应式设计
- [ ] 添加交互状态样式
- [ ] 考虑暗色主题支持
- [ ] 优化动画性能

### 测试覆盖
- [ ] 编写单元测试
- [ ] 测试所有Props和Events
- [ ] 测试错误状态处理
- [ ] 测试可访问性
- [ ] 添加集成测试

### 文档完善
- [ ] 编写组件使用文档
- [ ] 提供代码示例
- [ ] 记录Props和Events
- [ ] 添加最佳实践说明
- [ ] 更新Storybook（如果使用）

这份组件开发指南为vue-flow后台管理系统提供了全面的组件开发规范，确保组件的质量、一致性和可维护性。
