<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import type { LoginCredentials } from '@/types/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUIStore()

// 表单数据
const formData = reactive<LoginCredentials>({
  username: '',
  password: '',
  remember: false
})

// 表单验证错误
const errors = reactive({
  username: '',
  password: '',
  general: ''
})

// 组件状态
const isLoading = ref(false)
const showPassword = ref(false)

// 计算属性
const isFormValid = computed(() => {
  return formData.username.trim() !== '' && 
         formData.password.trim() !== '' && 
         !errors.username && 
         !errors.password
})

const redirectPath = computed(() => {
  return (route.query.redirect as string) || '/admin/dashboard'
})

// 验证函数
const validateUsername = () => {
  if (!formData.username.trim()) {
    errors.username = '请输入用户名'
    return false
  }
  if (formData.username.length < 3) {
    errors.username = '用户名至少3个字符'
    return false
  }
  errors.username = ''
  return true
}

const validatePassword = () => {
  if (!formData.password.trim()) {
    errors.password = '请输入密码'
    return false
  }
  if (formData.password.length < 6) {
    errors.password = '密码至少6个字符'
    return false
  }
  errors.password = ''
  return true
}

const validateForm = () => {
  const isUsernameValid = validateUsername()
  const isPasswordValid = validatePassword()
  return isUsernameValid && isPasswordValid
}

// 事件处理
const handleUsernameBlur = () => {
  validateUsername()
}

const handlePasswordBlur = () => {
  validatePassword()
}

const handleSubmit = async () => {
  // 清除之前的错误
  errors.general = ''
  
  // 验证表单
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  
  try {
    await authStore.login(formData)
    
    // 登录成功，重定向
    await router.push(redirectPath.value)
  } catch (error: any) {
    errors.general = error.message || '登录失败，请检查用户名和密码'
  } finally {
    isLoading.value = false
  }
}

const handleTogglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleToggleTheme = () => {
  uiStore.toggleTheme()
}

// 快速登录（演示用）
const handleQuickLogin = async (role: 'admin' | 'editor' | 'viewer') => {
  const credentials = {
    admin: { username: 'admin', password: 'admin123' },
    editor: { username: 'editor', password: 'editor123' },
    viewer: { username: 'viewer', password: 'viewer123' }
  }
  
  formData.username = credentials[role].username
  formData.password = credentials[role].password
  
  await handleSubmit()
}
</script>

<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="login-background">
      <div class="bg-pattern"></div>
      <div class="bg-gradient"></div>
    </div>
    
    <!-- 主题切换按钮 -->
    <button 
      @click="handleToggleTheme"
      class="theme-toggle"
      :title="uiStore.isDarkMode ? '切换到亮色主题' : '切换到暗色主题'"
    >
      {{ uiStore.isDarkMode ? '☀️' : '🌙' }}
    </button>
    
    <!-- 登录表单容器 -->
    <div class="login-container">
      <BaseCard class="login-card" shadow="xl" padding="xl">
        <!-- 头部 -->
        <div class="login-header">
          <div class="logo">
            <div class="logo-icon">🎛️</div>
            <div class="logo-text">
              <h1 class="logo-title">管理后台</h1>
              <p class="logo-subtitle">Admin Management System</p>
            </div>
          </div>
          <p class="login-description">
            欢迎使用基于Vue-Flow的智能工作流管理平台
          </p>
        </div>
        
        <!-- 登录表单 -->
        <form @submit.prevent="handleSubmit" class="login-form">
          <!-- 通用错误信息 -->
          <div v-if="errors.general" class="error-message">
            <span class="error-icon">⚠️</span>
            <span class="error-text">{{ errors.general }}</span>
          </div>
          
          <!-- 用户名输入 -->
          <div class="form-group">
            <label for="username" class="form-label">用户名</label>
            <BaseInput
              id="username"
              v-model="formData.username"
              type="text"
              placeholder="请输入用户名"
              :error="errors.username"
              :disabled="isLoading"
              size="lg"
              prefix="👤"
              @blur="handleUsernameBlur"
              @enter="handleSubmit"
            />
          </div>
          
          <!-- 密码输入 -->
          <div class="form-group">
            <label for="password" class="form-label">密码</label>
            <BaseInput
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              :error="errors.password"
              :disabled="isLoading"
              size="lg"
              prefix="🔒"
              :show-password="true"
              @blur="handlePasswordBlur"
              @enter="handleSubmit"
            />
          </div>
          
          <!-- 记住我 -->
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                v-model="formData.remember"
                type="checkbox"
                class="checkbox-input"
                :disabled="isLoading"
              />
              <span class="checkbox-text">记住我</span>
            </label>
          </div>
          
          <!-- 登录按钮 -->
          <div class="form-group">
            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              :loading="isLoading"
              :disabled="!isFormValid"
              block
            >
              {{ isLoading ? '登录中...' : '登录' }}
            </BaseButton>
          </div>
        </form>
        
        <!-- 快速登录（演示用） -->
        <div class="quick-login">
          <div class="divider">
            <span class="divider-text">演示账号</span>
          </div>
          
          <div class="quick-login-buttons">
            <BaseButton
              @click="handleQuickLogin('admin')"
              variant="outline"
              size="sm"
              :disabled="isLoading"
            >
              管理员登录
            </BaseButton>
            <BaseButton
              @click="handleQuickLogin('editor')"
              variant="outline"
              size="sm"
              :disabled="isLoading"
            >
              编辑者登录
            </BaseButton>
            <BaseButton
              @click="handleQuickLogin('viewer')"
              variant="outline"
              size="sm"
              :disabled="isLoading"
            >
              查看者登录
            </BaseButton>
          </div>
        </div>
        
        <!-- 底部链接 -->
        <div class="login-footer">
          <p class="footer-text">
            忘记密码？ 
            <a href="#" class="footer-link">点击重置</a>
          </p>
          <p class="footer-text">
            没有账号？ 
            <a href="#" class="footer-link">立即注册</a>
          </p>
        </div>
      </BaseCard>
    </div>
    
    <!-- 版权信息 -->
    <div class="login-copyright">
      <p>&copy; 2024 AI工作流管理系统. 保留所有权利.</p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  background-size: 100px 100px;
  animation: float 20s ease-in-out infinite;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    rgba(102, 126, 234, 0.8) 0%, 
    rgba(118, 75, 162, 0.8) 100%);
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 1000;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
}

.login-card {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.logo-text {
  text-align: left;
}

.logo-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 4px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
  font-weight: 500;
}

.login-description {
  color: var(--color-text-muted);
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: var(--color-error);
  font-size: var(--font-size-sm);
}

.error-icon {
  font-size: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
}

.checkbox-text {
  user-select: none;
}

.quick-login {
  margin-top: 24px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-border);
}

.divider-text {
  background: var(--color-surface);
  padding: 0 16px;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  position: relative;
}

.quick-login-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.footer-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

.login-copyright {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--font-size-xs);
  text-align: center;
  z-index: 10;
}

/* 响应式适配 */
@media (max-width: 480px) {
  .login-page {
    padding: 16px;
  }
  
  .logo {
    flex-direction: column;
    gap: 12px;
  }
  
  .logo-text {
    text-align: center;
  }
  
  .logo-title {
    font-size: 24px;
  }
  
  .quick-login-buttons {
    flex-direction: column;
  }
  
  .theme-toggle {
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
}

/* 暗色主题适配 */
[data-theme="dark"] .login-page {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

[data-theme="dark"] .login-card {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .bg-gradient {
  background: linear-gradient(45deg, 
    rgba(30, 41, 59, 0.8) 0%, 
    rgba(51, 65, 85, 0.8) 100%);
}

[data-theme="dark"] .divider-text {
  background: var(--color-surface-dark);
}
</style>
