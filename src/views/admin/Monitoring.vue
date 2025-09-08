<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
</script>

<template>
  <div class="monitoring-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">监控中心</h1>
        <p class="page-description">实时监控系统状态和性能指标</p>
      </div>
    </div>
    
    <BaseCard title="系统监控">
      <div class="empty-state">
        <div class="empty-icon">📈</div>
        <div class="empty-text">监控中心功能开发中...</div>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.monitoring-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 16px;
  color: var(--color-text-muted);
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  color: var(--color-text-muted);
  font-size: 16px;
}
</style>
