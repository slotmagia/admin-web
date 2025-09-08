<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUIStore()

// 计算属性
const currentUser = computed(() => authStore.user)
const userName = computed(() => authStore.userName)
const userAvatar = computed(() => authStore.userAvatar)

// 面包屑导航
const breadcrumbs = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
  const crumbs = []
  
  let currentPath = ''
  for (const segment of pathSegments) {
    currentPath += `/${segment}`
    
    // 根据路径生成面包屑标题
    let title = segment
    switch (segment) {
      case 'admin':
        title = '管理后台'
        break
      case 'dashboard':
        title = '仪表板'
        break
      case 'users':
        title = '用户管理'
        break
      case 'workflows':
        title = '工作流管理'
        break
      case 'monitoring':
        title = '监控中心'
        break
      case 'settings':
        title = '系统设置'
        break
      default:
        title = segment.charAt(0).toUpperCase() + segment.slice(1)
    }
    
    crumbs.push({
      title,
      path: currentPath,
      active: currentPath === route.path
    })
  }
  
  return crumbs
})

// 方法
const handleToggleSidebar = () => {
  uiStore.toggleSidebar()
}

const handleToggleTheme = () => {
  uiStore.toggleTheme()
}

const handleUserMenuClick = (action: string) => {
  switch (action) {
    case 'profile':
      router.push('/admin/profile')
      break
    case 'settings':
      router.push('/admin/settings')
      break
    case 'logout':
      handleLogout()
      break
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="admin-header">
    <div class="header-left">
      <!-- 侧边栏切换按钮 -->
      <button 
        @click="handleToggleSidebar"
        class="sidebar-toggle"
        title="切换侧边栏"
      >
        ☰
      </button>
      
      <!-- 面包屑导航 -->
      <nav class="breadcrumb">
        <div 
          v-for="(crumb, index) in breadcrumbs" 
          :key="crumb.path"
          class="breadcrumb-item"
        >
          <router-link 
            v-if="!crumb.active"
            :to="crumb.path"
            class="breadcrumb-link"
          >
            {{ crumb.title }}
          </router-link>
          <span v-else class="breadcrumb-current">
            {{ crumb.title }}
          </span>
          <span 
            v-if="index < breadcrumbs.length - 1" 
            class="breadcrumb-separator"
          >
            /
          </span>
        </div>
      </nav>
    </div>
    
    <div class="header-right">
      <!-- 搜索框 -->
      <div class="search-box">
        <input 
          type="text" 
          placeholder="搜索..."
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>
      
      <!-- 通知 -->
      <button class="header-action" title="通知">
        <span class="action-icon">🔔</span>
        <span class="notification-badge">3</span>
      </button>
      
      <!-- 主题切换 -->
      <button 
        @click="handleToggleTheme"
        class="header-action" 
        title="切换主题"
      >
        <span class="action-icon">
          {{ uiStore.isDarkMode ? '☀️' : '🌙' }}
        </span>
      </button>
      
      <!-- 用户菜单 -->
      <div class="user-menu">
        <div class="user-trigger">
          <img 
            :src="userAvatar" 
            :alt="userName"
            class="user-avatar"
          />
          <div class="user-info">
            <div class="user-name">{{ userName }}</div>
            <div class="user-role">{{ currentUser?.role }}</div>
          </div>
          <span class="dropdown-arrow">▼</span>
        </div>
        
        <!-- 下拉菜单 -->
        <div class="user-dropdown">
          <div class="dropdown-header">
            <img 
              :src="userAvatar" 
              :alt="userName"
              class="dropdown-avatar"
            />
            <div class="dropdown-user-info">
              <div class="dropdown-name">{{ userName }}</div>
              <div class="dropdown-email">{{ currentUser?.email }}</div>
            </div>
          </div>
          
          <div class="dropdown-divider"></div>
          
          <div class="dropdown-menu">
            <button 
              @click="handleUserMenuClick('profile')"
              class="dropdown-item"
            >
              <span class="item-icon">👤</span>
              <span class="item-text">个人资料</span>
            </button>
            <button 
              @click="handleUserMenuClick('settings')"
              class="dropdown-item"
            >
              <span class="item-icon">⚙️</span>
              <span class="item-text">账户设置</span>
            </button>
            
            <div class="dropdown-divider"></div>
            
            <button 
              @click="handleUserMenuClick('logout')"
              class="dropdown-item logout"
            >
              <span class="item-icon">🚪</span>
              <span class="item-text">退出登录</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-text);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
}

.sidebar-toggle:hover {
  background: var(--color-surface-hover);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-sm);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-link {
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--color-primary);
}

.breadcrumb-current {
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
}

.breadcrumb-separator {
  color: var(--color-text-muted);
  font-size: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 240px;
  height: 36px;
  padding: 0 36px 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-icon {
  position: absolute;
  right: 12px;
  color: var(--color-text-muted);
  font-size: 14px;
  pointer-events: none;
}

.header-action {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--color-text);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-action:hover {
  background: var(--color-surface-hover);
}

.action-icon {
  font-size: 16px;
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--color-error);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  line-height: 1;
}

.user-menu {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-trigger:hover {
  background: var(--color-surface-hover);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  line-height: 1.2;
}

.user-role {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  line-height: 1.2;
}

.dropdown-arrow {
  font-size: 10px;
  color: var(--color-text-muted);
  transition: transform 0.2s ease;
}

.user-menu:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  min-width: 240px;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: all 0.2s ease;
}

.user-menu:hover .user-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.dropdown-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.dropdown-user-info {
  flex: 1;
}

.dropdown-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: 2px;
}

.dropdown-email {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0 16px;
}

.dropdown-menu {
  padding: 8px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--color-text);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-sm);
}

.dropdown-item:hover {
  background: var(--color-surface-hover);
}

.dropdown-item.logout {
  color: var(--color-error);
}

.dropdown-item.logout:hover {
  background: rgba(239, 68, 68, 0.1);
}

.item-icon {
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.item-text {
  flex: 1;
  text-align: left;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .admin-header {
    padding: 0 16px;
  }
  
  .search-box {
    display: none;
  }
  
  .user-info {
    display: none;
  }
  
  .breadcrumb {
    display: none;
  }
}

/* 暗色主题适配 */
[data-theme="dark"] .admin-header {
  background: var(--color-surface-dark);
  border-color: var(--color-border-dark);
}

[data-theme="dark"] .search-input {
  background: var(--color-background-dark);
  border-color: var(--color-border-dark);
  color: var(--color-text-dark);
}

[data-theme="dark"] .user-dropdown {
  background: var(--color-surface-dark);
  border-color: var(--color-border-dark);
}
</style>
