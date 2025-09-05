<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit' | 'reset'
  }

  interface Emits {
    click: [event: MouseEvent]
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    type: 'button',
  })

  const emit = defineEmits<Emits>()

  const isDisabled = computed(() => Boolean(props.disabled || props.loading))
  const buttonType = computed(() => props.type || 'button')

  const buttonClasses = computed(() => [
    'base-button',
    `base-button--${props.variant}`,
    `base-button--${props.size}`,
    {
      'base-button--disabled': props.disabled,
      'base-button--loading': props.loading,
    },
  ])

  const handleClick = (event: MouseEvent) => {
    if (!isDisabled.value) {
      emit('click', event)
    }
  }
</script>

<template>
  <button :type="buttonType" :disabled="isDisabled" :class="buttonClasses" @click="handleClick">
    <span v-if="loading" class="loading-spinner" />
    <slot />
  </button>
</template>

<style scoped>
  .base-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: var(--radius-md);
    font-weight: var(--font-weight-medium);
    transition: var(--transition-fast);
    cursor: pointer;
    border: none;
    outline: none;
  }

  .base-button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .base-button--sm {
    padding: 0.375rem 0.75rem;
    font-size: var(--font-size-sm);
  }

  .base-button--md {
    padding: 0.5rem 1rem;
    font-size: var(--font-size-base);
  }

  .base-button--lg {
    padding: 0.75rem 1.5rem;
    font-size: var(--font-size-lg);
  }

  .base-button--primary {
    background-color: var(--color-primary);
    color: var(--color-text-inverse);
  }

  .base-button--primary:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
  }

  .base-button--primary:active:not(:disabled) {
    background-color: var(--color-primary-active);
  }

  .base-button--secondary {
    background-color: var(--color-secondary);
    color: var(--color-text-inverse);
  }

  .base-button--secondary:hover:not(:disabled) {
    opacity: 0.9;
  }

  .base-button--outline {
    border: 1px solid var(--color-primary);
    background-color: transparent;
    color: var(--color-primary);
  }

  .base-button--outline:hover:not(:disabled) {
    background-color: var(--color-primary);
    color: var(--color-text-inverse);
  }

  .base-button--ghost {
    background-color: transparent;
    color: var(--color-primary);
  }

  .base-button--ghost:hover:not(:disabled) {
    background-color: var(--color-primary);
    color: var(--color-text-inverse);
  }

  .base-button--danger {
    background-color: var(--color-error);
    color: var(--color-text-inverse);
  }

  .base-button--danger:hover:not(:disabled) {
    opacity: 0.9;
  }

  .base-button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .base-button--loading {
    cursor: wait;
  }

  .loading-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
