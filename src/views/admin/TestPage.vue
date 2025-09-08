<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const adminStore = useAdminStore()
const testMessage = ref('系统测试页面')

onMounted(() => {
  console.log('TestPage mounted successfully')
  console.log('AdminStore:', adminStore)
})

const testFunction = () => {
  testMessage.value = '测试按钮点击成功！'
}
</script>

<template>
  <div class="test-page">
    <div class="page-header">
      <h1 class="page-title">系统测试页面</h1>
      <p class="page-description">验证后台管理系统是否正常工作</p>
    </div>
    
    <BaseCard title="测试组件">
      <div class="test-content">
        <p>{{ testMessage }}</p>
        <BaseButton @click="testFunction" variant="primary">
          测试按钮
        </BaseButton>
      </div>
    </BaseCard>
    
    <BaseCard title="系统信息">
      <div class="system-info">
        <div class="info-item">
          <span class="info-label">Vue版本:</span>
          <span class="info-value">3.5.18</span>
        </div>
        <div class="info-item">
          <span class="info-label">路由状态:</span>
          <span class="info-value">正常</span>
        </div>
        <div class="info-item">
          <span class="info-label">状态管理:</span>
          <span class="info-value">Pinia</span>
        </div>
        <div class="info-item">
          <span class="info-label">Mock数据:</span>
          <span class="info-value">已启用</span>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.test-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  margin-bottom: 24px;
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

.test-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: var(--color-text);
}

.info-value {
  color: var(--color-text-muted);
}
</style>
