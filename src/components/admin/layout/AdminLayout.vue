<script setup lang="ts">
import { ref, computed, provide, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import AdminSidebar from './AdminSidebar.vue'
import AdminHeader from './AdminHeader.vue'

interface Props {
  sidebarCollapsible?: boolean
  showBreadcrumb?: boolean
  fluid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sidebarCollapsible: true,
  showBreadcrumb: true,
  fluid: false
})

const uiStore = useUIStore()

// 布局状态
const sidebarWidth = ref(280)
const isResizing = ref(false)

// 计算属性
const layoutClasses = computed(() => [
  'admin-layout',
  {
    'admin-layout--sidebar-collapsed': uiStore.sidebarCollapsed,
    'admin-layout--fluid': props.fluid,
    'admin-layout--resizing': isResizing.value
  }
])

const mainContentStyles = computed(() => ({
  marginLeft: uiStore.sidebarCollapsed ? '64px' : `${sidebarWidth.value}px`
}))

// 布局上下文
const layoutContext = {
  sidebarWidth: computed(() => sidebarWidth.value),
  sidebarCollapsed: computed(() => uiStore.sidebarCollapsed),
  toggleSidebar: () => uiStore.toggleSidebar()
}

provide('layout', layoutContext)

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl/Cmd + B: 切换侧边栏
  if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
    event.preventDefault()
    uiStore.toggleSidebar()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  
  // 初始化布局尺寸
  sidebarWidth.value = uiStore.layoutConfig.sidebarWidth
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div :class="layoutClasses">
    <!-- 侧边栏 -->
    <AdminSidebar 
      :width="sidebarWidth"
      :collapsed="uiStore.sidebarCollapsed"
      :collapsible="sidebarCollapsible"
      class="admin-layout__sidebar"
    />
    
    <!-- 主内容区域 -->
    <div 
      class="admin-layout__main"
      :style="mainContentStyles"
    >
      <!-- 顶部导航 -->
      <AdminHeader class="admin-layout__header" />
      
      <!-- 内容区域 -->
      <main class="admin-layout__content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-background);
  position: relative;
  overflow: hidden;
}

.admin-layout--resizing {
  user-select: none;
  cursor: col-resize;
}

.admin-layout__sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  transition: width 0.3s ease, transform 0.3s ease;
}

.admin-layout--sidebar-collapsed .admin-layout__sidebar {
  width: 64px;
}

.admin-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin 0.3s ease;
  position: relative;
}

.admin-layout__header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(8px);
}

.admin-layout__content {
  flex: 1;
  padding: 24px;
  overflow: auto;
  position: relative;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .admin-layout__sidebar {
    transform: translateX(-100%);
  }
  
  .admin-layout__sidebar.open {
    transform: translateX(0);
  }
  
  .admin-layout__main {
    margin-left: 0 !important;
  }
}

/* 流体布局 */
.admin-layout--fluid .admin-layout__content {
  padding: 0;
}

/* 暗色主题适配 */
[data-theme="dark"] .admin-layout {
  background: var(--color-background-dark);
}

[data-theme="dark"] .admin-layout__header {
  background: var(--color-surface-dark);
  border-color: var(--color-border-dark);
}
</style>
