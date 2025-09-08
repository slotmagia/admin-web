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
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: all 0.2s ease;
  position: relative;
}

.base-input:hover:not(.base-input--disabled) {
  border-color: var(--color-border-hover);
}

.base-input--focused {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.base-input--error {
  border-color: var(--color-error);
}

.base-input--error.base-input--focused {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.base-input--success {
  border-color: var(--color-success);
}

.base-input--success.base-input--focused {
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.base-input--disabled {
  background: var(--color-surface-disabled);
  cursor: not-allowed;
}

.base-input--readonly {
  background: var(--color-surface-disabled);
}

/* 尺寸变体 */
.base-input--sm {
  min-height: 32px;
}

.base-input--sm .base-input__field {
  padding: 6px 12px;
  font-size: var(--font-size-sm);
}

.base-input--md {
  min-height: 40px;
}

.base-input--md .base-input__field {
  padding: 8px 12px;
  font-size: var(--font-size-base);
}

.base-input--lg {
  min-height: 48px;
}

.base-input--lg .base-input__field {
  padding: 12px 16px;
  font-size: var(--font-size-lg);
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
  color: var(--color-text);
}

.base-input__field::placeholder {
  color: var(--color-text-muted);
}

.base-input__field:disabled {
  cursor: not-allowed;
  color: var(--color-text-disabled);
}

.base-input__prefix,
.base-input__suffix {
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.base-input__clear,
.base-input__password-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.base-input__clear:hover,
.base-input__password-toggle:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.base-input__errors {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.base-input__error {
  font-size: var(--font-size-xs);
  color: var(--color-error);
}
</style>
