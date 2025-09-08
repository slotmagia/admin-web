<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface Props {
  title?: string
  subtitle?: string
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  hoverable?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  shadow: 'md',
  padding: 'md',
  border: true,
  hoverable: false,
  loading: false
})

const slots = useSlots()

const cardClasses = computed(() => [
  'base-card',
  `base-card--shadow-${props.shadow}`,
  `base-card--padding-${props.padding}`,
  {
    'base-card--border': props.border,
    'base-card--hoverable': props.hoverable,
    'base-card--loading': props.loading
  }
])

const hasHeader = computed(() => {
  return props.title || props.subtitle || slots.header || slots.extra
})
</script>

<template>
  <div :class="cardClasses">
    <!-- 加载状态 -->
    <div v-if="loading" class="base-card__loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>
    
    <!-- 卡片头部 -->
    <div v-if="hasHeader" class="base-card__header">
      <div class="base-card__header-content">
        <slot name="header">
          <div v-if="title || subtitle" class="base-card__title-section">
            <h3 v-if="title" class="base-card__title">{{ title }}</h3>
            <p v-if="subtitle" class="base-card__subtitle">{{ subtitle }}</p>
          </div>
        </slot>
      </div>
      <div v-if="$slots.extra" class="base-card__extra">
        <slot name="extra" />
      </div>
    </div>
    
    <!-- 卡片内容 -->
    <div class="base-card__content">
      <slot />
    </div>
    
    <!-- 卡片底部 -->
    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.base-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.base-card--border {
  border: 1px solid var(--color-border);
}

.base-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 阴影变体 */
.base-card--shadow-none {
  box-shadow: none;
}

.base-card--shadow-sm {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.base-card--shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.base-card--shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.base-card--shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* 内边距变体 */
.base-card--padding-none {
  padding: 0;
}

.base-card--padding-sm .base-card__header,
.base-card--padding-sm .base-card__content,
.base-card--padding-sm .base-card__footer {
  padding: 12px;
}

.base-card--padding-md .base-card__header,
.base-card--padding-md .base-card__content,
.base-card--padding-md .base-card__footer {
  padding: 16px;
}

.base-card--padding-lg .base-card__header,
.base-card--padding-lg .base-card__content,
.base-card--padding-lg .base-card__footer {
  padding: 24px;
}

.base-card--padding-xl .base-card__header,
.base-card--padding-xl .base-card__content,
.base-card--padding-xl .base-card__footer {
  padding: 32px;
}

.base-card__loading {
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
  backdrop-filter: blur(2px);
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
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.base-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0;
}

.base-card__header-content {
  flex: 1;
  min-width: 0;
}

.base-card__title-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.base-card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
  line-height: 1.4;
}

.base-card__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.4;
}

.base-card__extra {
  flex-shrink: 0;
  margin-left: 16px;
}

.base-card__content {
  flex: 1;
}

.base-card__footer {
  border-top: 1px solid var(--color-border);
  padding-top: 0;
}

/* 无内边距时的特殊处理 */
.base-card--padding-none .base-card__header {
  padding: 16px 16px 0;
}

.base-card--padding-none .base-card__footer {
  padding: 0 16px 16px;
}

/* 暗色主题适配 */
[data-theme="dark"] .base-card {
  background: var(--color-surface-dark);
  border-color: var(--color-border-dark);
}

[data-theme="dark"] .base-card__header,
[data-theme="dark"] .base-card__footer {
  border-color: var(--color-border-dark);
}

[data-theme="dark"] .base-card__loading {
  background: rgba(0, 0, 0, 0.8);
}
</style>
