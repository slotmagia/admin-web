<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'

const router = useRouter()

const goHome = () => {
  router.push('/admin/dashboard')
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <BaseCard class="not-found-card" shadow="xl" padding="xl">
        <div class="not-found-content">
          <!-- 404图标 -->
          <div class="error-icon">
            <span class="error-number">404</span>
            <div class="error-emoji">😵</div>
          </div>
          
          <!-- 错误信息 -->
          <div class="error-info">
            <h1 class="error-title">页面未找到</h1>
            <p class="error-description">
              抱歉，您访问的页面不存在或已被移除。
              <br>
              请检查URL是否正确，或返回首页继续浏览。
            </p>
          </div>
          
          <!-- 操作按钮 -->
          <div class="error-actions">
            <BaseButton
              @click="goHome"
              variant="primary"
              size="lg"
            >
              返回首页
            </BaseButton>
            <BaseButton
              @click="goBack"
              variant="outline"
              size="lg"
            >
              返回上页
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.not-found-container {
  width: 100%;
  max-width: 500px;
}

.not-found-card {
  text-align: center;
}

.not-found-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.error-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-number {
  font-size: 120px;
  font-weight: 900;
  color: var(--color-text-muted);
  opacity: 0.3;
  line-height: 1;
}

.error-emoji {
  position: absolute;
  font-size: 48px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.error-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.error-description {
  font-size: 16px;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0;
}

.error-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

/* 响应式适配 */
@media (max-width: 480px) {
  .not-found-page {
    padding: 16px;
  }
  
  .error-number {
    font-size: 80px;
  }
  
  .error-emoji {
    font-size: 32px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-description {
    font-size: 14px;
  }
  
  .error-actions {
    flex-direction: column;
    width: 100%;
  }
}

/* 暗色主题适配 */
[data-theme="dark"] .not-found-page {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}
</style>
