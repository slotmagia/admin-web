<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface Props {
  width: number
  collapsed: boolean
  collapsible: boolean
}

const props = defineProps<Props>()

interface Emits {
  'toggle': []
}

const emit = defineEmits<Emits>()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 菜单项定义
interface MenuItem {
  id: string
  label: string
  icon: string
  path?: string
  children?: MenuItem[]
  badge?: string | number
  disabled?: boolean
  permission?: string
}

const menuItems = ref<MenuItem[]>([
  {
    id: 'dashboard',
    label: '仪表板',
    icon: '📊',
    path: '/admin/dashboard'
  },
  {
    id: 'users',
    label: '用户管理',
    icon: '👥',
    children: [
      {
        id: 'user-list',
        label: '用户列表',
        icon: '📋',
        path: '/admin/users'
      },
      {
        id: 'user-roles',
        label: '角色管理',
        icon: '🎭',
        path: '/admin/users/roles'
      }
    ]
  },
  {
    id: 'workflows',
    label: '工作流管理',
    icon: '🔄',
    children: [
      {
        id: 'workflow-list',
        label: '工作流列表',
        icon: '📝',
        path: '/admin/workflows'
      },
      {
        id: 'workflow-templates',
        label: '模板管理',
        icon: '📄',
        path: '/admin/workflows/templates'
      }
    ]
  },
  {
    id: 'monitoring',
    label: '监控中心',
    icon: '📈',
    path: '/admin/monitoring'
  },
  {
    id: 'settings',
    label: '系统设置',
    icon: '⚙️',
    path: '/admin/settings'
  }
])

// 展开的菜单项
const expandedItems = ref<string[]>(['users', 'workflows'])

// 计算属性
const sidebarClasses = computed(() => [
  'admin-sidebar',
  {
    'admin-sidebar--collapsed': props.collapsed,
    'admin-sidebar--collapsible': props.collapsible
  }
])

const sidebarStyles = computed(() => ({
  width: props.collapsed ? '64px' : `${props.width}px`
}))

const currentUser = computed(() => authStore.user)

// 方法
const isActive = (item: MenuItem): boolean => {
  if (item.path) {
    return route.path === item.path || route.path.startsWith(item.path + '/')
  }
  return false
}

const isExpanded = (itemId: string): boolean => {
  return expandedItems.value.includes(itemId)
}

const toggleExpand = (itemId: string) => {
  const index = expandedItems.value.indexOf(itemId)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(itemId)
  }
}

const handleItemClick = (item: MenuItem) => {
  if (item.path) {
    router.push(item.path)
  } else if (item.children) {
    toggleExpand(item.id)
  }
}

const handleToggle = () => {
  emit('toggle')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <aside 
    :class="sidebarClasses"
    :style="sidebarStyles"
  >
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <div class="logo-section">
        <div class="logo-icon">🎛️</div>
        <div v-if="!collapsed" class="logo-text">
          <div class="logo-title">管理后台</div>
          <div class="logo-subtitle">Admin Panel</div>
        </div>
      </div>
      
      <button
        v-if="collapsible"
        @click="handleToggle"
        class="collapse-button"
        :title="collapsed ? '展开侧边栏' : '收起侧边栏'"
      >
        {{ collapsed ? '▶️' : '◀️' }}
      </button>
    </div>
    
    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div 
          v-for="item in menuItems"
          :key="item.id"
          class="nav-item"
        >
          <!-- 主菜单项 -->
          <div 
            class="nav-link"
            :class="{ 
              active: isActive(item),
              'has-children': item.children && item.children.length > 0
            }"
            @click="handleItemClick(item)"
            :title="collapsed ? item.label : undefined"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
            <span 
              v-if="!collapsed && item.children && item.children.length > 0"
              class="nav-arrow"
              :class="{ expanded: isExpanded(item.id) }"
            >
              ▼
            </span>
          </div>
          
          <!-- 子菜单 -->
          <div 
            v-if="!collapsed && item.children && item.children.length > 0"
            class="nav-children"
            :class="{ expanded: isExpanded(item.id) }"
          >
            <div
              v-for="child in item.children"
              :key="child.id"
              class="nav-child-link"
              :class="{ active: isActive(child) }"
              @click="handleItemClick(child)"
            >
              <span class="child-icon">{{ child.icon }}</span>
              <span class="child-label">{{ child.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- 用户信息 -->
    <div class="sidebar-footer">
      <div v-if="currentUser" class="user-profile">
        <div class="user-avatar">
          <img 
            v-if="currentUser.avatar" 
            :src="currentUser.avatar" 
            :alt="authStore.userName"
            class="avatar-image"
          />
          <span v-else class="avatar-text">
            {{ authStore.userName.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div v-if="!collapsed" class="user-info">
          <div class="user-name">{{ authStore.userName }}</div>
          <div class="user-role">{{ currentUser.role }}</div>
        </div>
        <div v-if="!collapsed" class="user-actions">
          <button 
            @click="handleLogout"
            class="logout-button"
            title="退出登录"
          >
            🚪
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.admin-sidebar--collapsed {
  width: 64px !important;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 80px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.logo-icon {
  font-size: 24px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.logo-title {
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logo-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapse-button {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.collapse-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 0;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 8px;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 12px;
  margin: 2px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-height: 40px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: #3b82f6;
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  font-size: 18px;
  min-width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-arrow {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.nav-arrow.expanded {
  transform: rotate(180deg);
}

.nav-children {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin-top: 4px;
}

.nav-children.expanded {
  max-height: 200px;
}

.nav-child-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 8px 40px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 13px;
}

.nav-child-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-child-link.active {
  background: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.child-icon {
  font-size: 14px;
  min-width: 16px;
}

.child-label {
  flex: 1;
}

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-actions {
  flex-shrink: 0;
}

.logout-button {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

/* 滚动条样式 */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1001;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .admin-sidebar.open {
    transform: translateX(0);
  }
}

/* 暗色主题适配 */
[data-theme="dark"] .admin-sidebar {
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
}
</style>
