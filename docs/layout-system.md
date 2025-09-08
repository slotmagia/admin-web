# Vue-Flow 后台管理系统布局系统设计

## 📋 目录

1. [布局系统概述](#布局系统概述)
2. [响应式布局设计](#响应式布局设计)
3. [主布局组件](#主布局组件)
4. [侧边栏系统](#侧边栏系统)
5. [内容区域布局](#内容区域布局)
6. [面板系统](#面板系统)
7. [移动端适配](#移动端适配)
8. [布局主题系统](#布局主题系统)

---

## 🎯 布局系统概述

### 设计理念

基于vue-flow的后台管理系统采用现代化的布局设计，提供灵活、响应式和可定制的用户界面。布局系统遵循以下原则：

- **模块化设计**: 每个布局组件独立可复用
- **响应式优先**: 移动端和桌面端完美适配
- **可定制性**: 支持主题切换和布局调整
- **性能优化**: 高效的渲染和交互体验
- **可访问性**: 符合WCAG标准的无障碍设计

### 布局架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Admin Layout                         │
│  ┌─────────────┐  ┌─────────────────────┐  ┌─────────────┐  │
│  │             │  │                     │  │             │  │
│  │   Sidebar   │  │    Main Content     │  │ Properties  │  │
│  │             │  │                     │  │   Panel     │  │
│  │   - Menu    │  │  ┌───────────────┐  │  │             │  │
│  │   - Nav     │  │  │    Header     │  │  │ - Settings  │  │
│  │   - User    │  │  └───────────────┘  │  │ - Details   │  │
│  │             │  │  ┌───────────────┐  │  │ - Actions   │  │
│  │             │  │  │  Breadcrumb   │  │  │             │  │
│  │             │  │  └───────────────┘  │  │             │  │
│  │             │  │  ┌───────────────┐  │  │             │  │
│  │             │  │  │               │  │  │             │  │
│  │             │  │  │  Vue-Flow     │  │  │             │  │
│  │             │  │  │   Canvas      │  │  │             │  │
│  │             │  │  │               │  │  │             │  │
│  │             │  │  └───────────────┘  │  │             │  │
│  └─────────────┘  └─────────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 响应式布局设计

### 断点系统

```scss
// styles/breakpoints.scss
$breakpoints: (
  'xs': 0,
  'sm': 576px,
  'md': 768px,
  'lg': 992px,
  'xl': 1200px,
  'xxl': 1400px
);

// 响应式混合器
@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

// 使用示例
.admin-layout {
  display: flex;
  flex-direction: column;
  
  @include respond-to('md') {
    flex-direction: row;
  }
}
```

### 布局容器

```vue
<!-- components/admin/layout/ResponsiveContainer.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  maxWidth?: string
  padding?: string
  fluid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: '1200px',
  padding: '24px',
  fluid: false
})

const containerRef = ref<HTMLElement>()
const screenSize = ref<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>('lg')

const containerClasses = computed(() => [
  'responsive-container',
  `responsive-container--${screenSize.value}`,
  {
    'responsive-container--fluid': props.fluid
  }
])

const containerStyles = computed(() => ({
  maxWidth: props.fluid ? '100%' : props.maxWidth,
  padding: props.padding
}))

const updateScreenSize = () => {
  const width = window.innerWidth
  
  if (width < 576) {
    screenSize.value = 'xs'
  } else if (width < 768) {
    screenSize.value = 'sm'
  } else if (width < 992) {
    screenSize.value = 'md'
  } else if (width < 1200) {
    screenSize.value = 'lg'
  } else if (width < 1400) {
    screenSize.value = 'xl'
  } else {
    screenSize.value = 'xxl'
  }
}

onMounted(() => {
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})

defineExpose({
  screenSize: readonly(screenSize)
})
</script>

<template>
  <div 
    ref="containerRef"
    :class="containerClasses"
    :style="containerStyles"
  >
    <slot :screen-size="screenSize" />
  </div>
</template>

<style scoped>
.responsive-container {
  width: 100%;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.responsive-container--fluid {
  max-width: none !important;
}

/* 不同屏幕尺寸的特定样式 */
.responsive-container--xs {
  padding: 12px;
}

.responsive-container--sm {
  padding: 16px;
}

.responsive-container--md {
  padding: 20px;
}

.responsive-container--lg {
  padding: 24px;
}

.responsive-container--xl {
  padding: 32px;
}

.responsive-container--xxl {
  padding: 40px;
}
</style>
```

---

## 🏗️ 主布局组件

### 管理后台主布局

```vue
<!-- components/admin/layout/AdminLayout.vue -->
<script setup lang="ts">
import { ref, computed, provide, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import AdminSidebar from './AdminSidebar.vue'
import AdminHeader from './AdminHeader.vue'
import AdminBreadcrumb from './AdminBreadcrumb.vue'
import AdminFooter from './AdminFooter.vue'
import ResizeHandle from './ResizeHandle.vue'

interface Props {
  sidebarCollapsible?: boolean
  showBreadcrumb?: boolean
  showFooter?: boolean
  fluid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sidebarCollapsible: true,
  showBreadcrumb: true,
  showFooter: false,
  fluid: false
})

const uiStore = useUIStore()

// 布局状态
const sidebarWidth = ref(280)
const propertiesPanelWidth = ref(320)
const isResizingSidebar = ref(false)
const isResizingProperties = ref(false)

// 计算属性
const layoutClasses = computed(() => [
  'admin-layout',
  {
    'admin-layout--sidebar-collapsed': uiStore.sidebarCollapsed,
    'admin-layout--properties-collapsed': uiStore.propertiesPanelCollapsed,
    'admin-layout--fluid': props.fluid,
    'admin-layout--resizing': isResizingSidebar.value || isResizingProperties.value
  }
])

const mainContentStyles = computed(() => ({
  marginLeft: uiStore.sidebarCollapsed ? '64px' : `${sidebarWidth.value}px`,
  marginRight: uiStore.propertiesPanelCollapsed ? '0' : `${propertiesPanelWidth.value}px`
}))

// 布局上下文
const layoutContext = {
  sidebarWidth: readonly(sidebarWidth),
  propertiesPanelWidth: readonly(propertiesPanelWidth),
  sidebarCollapsed: computed(() => uiStore.sidebarCollapsed),
  propertiesPanelCollapsed: computed(() => uiStore.propertiesPanelCollapsed),
  toggleSidebar: () => uiStore.toggleSidebar(),
  togglePropertiesPanel: () => uiStore.togglePropertiesPanel()
}

provide('layout', layoutContext)

// 侧边栏调整大小
const handleSidebarResize = (delta: number) => {
  const newWidth = Math.max(200, Math.min(400, sidebarWidth.value + delta))
  sidebarWidth.value = newWidth
  uiStore.setSidebarWidth(newWidth)
}

const handleSidebarResizeStart = () => {
  isResizingSidebar.value = true
}

const handleSidebarResizeEnd = () => {
  isResizingSidebar.value = false
}

// 属性面板调整大小
const handlePropertiesResize = (delta: number) => {
  const newWidth = Math.max(250, Math.min(500, propertiesPanelWidth.value - delta))
  propertiesPanelWidth.value = newWidth
  uiStore.setPropertiesPanelWidth(newWidth)
}

const handlePropertiesResizeStart = () => {
  isResizingProperties.value = true
}

const handlePropertiesResizeEnd = () => {
  isResizingProperties.value = false
}

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl/Cmd + B: 切换侧边栏
  if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
    event.preventDefault()
    uiStore.toggleSidebar()
  }
  
  // Ctrl/Cmd + Shift + P: 切换属性面板
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
    event.preventDefault()
    uiStore.togglePropertiesPanel()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  
  // 初始化布局尺寸
  sidebarWidth.value = uiStore.layoutConfig.sidebarWidth
  propertiesPanelWidth.value = uiStore.layoutConfig.propertiesPanelWidth
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
    
    <!-- 侧边栏调整手柄 -->
    <ResizeHandle
      v-if="!uiStore.sidebarCollapsed"
      direction="vertical"
      :position="sidebarWidth"
      class="admin-layout__sidebar-resize"
      @resize="handleSidebarResize"
      @resize-start="handleSidebarResizeStart"
      @resize-end="handleSidebarResizeEnd"
    />
    
    <!-- 主内容区域 -->
    <div 
      class="admin-layout__main"
      :style="mainContentStyles"
    >
      <!-- 顶部导航 -->
      <AdminHeader class="admin-layout__header" />
      
      <!-- 面包屑导航 -->
      <AdminBreadcrumb 
        v-if="showBreadcrumb"
        class="admin-layout__breadcrumb" 
      />
      
      <!-- 内容区域 -->
      <main class="admin-layout__content">
        <slot />
      </main>
      
      <!-- 底部 -->
      <AdminFooter 
        v-if="showFooter"
        class="admin-layout__footer" 
      />
    </div>
    
    <!-- 属性面板调整手柄 -->
    <ResizeHandle
      v-if="!uiStore.propertiesPanelCollapsed"
      direction="vertical"
      :position="propertiesPanelWidth"
      class="admin-layout__properties-resize"
      @resize="handlePropertiesResize"
      @resize-start="handlePropertiesResizeStart"
      @resize-end="handlePropertiesResizeEnd"
    />
    
    <!-- 属性面板 -->
    <div 
      v-if="!uiStore.propertiesPanelCollapsed"
      class="admin-layout__properties"
      :style="{ width: `${propertiesPanelWidth}px` }"
    >
      <slot name="properties" />
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

.admin-layout__sidebar-resize {
  position: fixed;
  top: 0;
  z-index: 999;
  width: 4px;
  height: 100vh;
  cursor: col-resize;
  background: transparent;
  transition: left 0.3s ease;
}

.admin-layout__sidebar-resize:hover {
  background: var(--color-primary);
  opacity: 0.5;
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

.admin-layout__breadcrumb {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-light);
  padding: 12px 24px;
}

.admin-layout__content {
  flex: 1;
  padding: 24px;
  overflow: auto;
  position: relative;
}

.admin-layout__footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 16px 24px;
}

.admin-layout__properties-resize {
  position: fixed;
  top: 0;
  right: var(--properties-panel-width, 320px);
  z-index: 999;
  width: 4px;
  height: 100vh;
  cursor: col-resize;
  background: transparent;
  transition: right 0.3s ease;
}

.admin-layout__properties-resize:hover {
  background: var(--color-primary);
  opacity: 0.5;
}

.admin-layout__properties {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  z-index: 998;
  overflow-y: auto;
  transition: width 0.3s ease;
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
    margin-right: 0 !important;
  }
  
  .admin-layout__properties {
    transform: translateX(100%);
  }
  
  .admin-layout__properties.open {
    transform: translateX(0);
  }
  
  .admin-layout__sidebar-resize,
  .admin-layout__properties-resize {
    display: none;
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

[data-theme="dark"] .admin-layout__header,
[data-theme="dark"] .admin-layout__breadcrumb,
[data-theme="dark"] .admin-layout__footer,
[data-theme="dark"] .admin-layout__properties {
  background: var(--color-surface-dark);
  border-color: var(--color-border-dark);
}
</style>
```

### 调整大小手柄组件

```vue
<!-- components/admin/layout/ResizeHandle.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  direction: 'horizontal' | 'vertical'
  position: number
  minSize?: number
  maxSize?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  minSize: 100,
  maxSize: 800,
  disabled: false
})

interface Emits {
  'resize': [delta: number]
  'resize-start': []
  'resize-end': []
}

const emit = defineEmits<Emits>()

const isResizing = ref(false)
const startPosition = ref(0)
const currentPosition = ref(0)

const handleClasses = computed(() => [
  'resize-handle',
  `resize-handle--${props.direction}`,
  {
    'resize-handle--resizing': isResizing.value,
    'resize-handle--disabled': props.disabled
  }
])

const handleStyles = computed(() => {
  if (props.direction === 'vertical') {
    return {
      left: `${props.position}px`
    }
  } else {
    return {
      top: `${props.position}px`
    }
  }
})

const startResize = (event: MouseEvent) => {
  if (props.disabled) return
  
  event.preventDefault()
  isResizing.value = true
  
  if (props.direction === 'vertical') {
    startPosition.value = event.clientX
  } else {
    startPosition.value = event.clientY
  }
  
  currentPosition.value = startPosition.value
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', endResize)
  document.body.style.cursor = props.direction === 'vertical' ? 'col-resize' : 'row-resize'
  document.body.style.userSelect = 'none'
  
  emit('resize-start')
}

const handleResize = (event: MouseEvent) => {
  if (!isResizing.value) return
  
  const newPosition = props.direction === 'vertical' ? event.clientX : event.clientY
  const delta = newPosition - currentPosition.value
  
  currentPosition.value = newPosition
  emit('resize', delta)
}

const endResize = () => {
  if (!isResizing.value) return
  
  isResizing.value = false
  
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', endResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  
  emit('resize-end')
}

// 键盘支持
const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return
  
  let delta = 0
  const step = event.shiftKey ? 10 : 1
  
  if (props.direction === 'vertical') {
    if (event.key === 'ArrowLeft') {
      delta = -step
    } else if (event.key === 'ArrowRight') {
      delta = step
    }
  } else {
    if (event.key === 'ArrowUp') {
      delta = -step
    } else if (event.key === 'ArrowDown') {
      delta = step
    }
  }
  
  if (delta !== 0) {
    event.preventDefault()
    emit('resize', delta)
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', endResize)
})
</script>

<template>
  <div
    :class="handleClasses"
    :style="handleStyles"
    @mousedown="startResize"
    tabindex="0"
    role="separator"
    :aria-orientation="direction === 'vertical' ? 'vertical' : 'horizontal'"
    :aria-disabled="disabled"
  >
    <div class="resize-handle__indicator">
      <div class="resize-handle__line"></div>
      <div class="resize-handle__line"></div>
      <div class="resize-handle__line"></div>
    </div>
  </div>
</template>

<style scoped>
.resize-handle {
  position: absolute;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: background-color 0.2s ease;
}

.resize-handle:hover:not(.resize-handle--disabled) {
  background: var(--color-primary);
  opacity: 0.3;
}

.resize-handle:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.resize-handle--vertical {
  width: 8px;
  height: 100%;
  cursor: col-resize;
}

.resize-handle--horizontal {
  width: 100%;
  height: 8px;
  cursor: row-resize;
}

.resize-handle--resizing {
  background: var(--color-primary);
  opacity: 0.5;
}

.resize-handle--disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

.resize-handle__indicator {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.resize-handle:hover .resize-handle__indicator,
.resize-handle:focus .resize-handle__indicator,
.resize-handle--resizing .resize-handle__indicator {
  opacity: 1;
}

.resize-handle--vertical .resize-handle__indicator {
  flex-direction: column;
}

.resize-handle--horizontal .resize-handle__indicator {
  flex-direction: row;
}

.resize-handle__line {
  background: var(--color-text-inverse);
  border-radius: 1px;
}

.resize-handle--vertical .resize-handle__line {
  width: 2px;
  height: 12px;
}

.resize-handle--horizontal .resize-handle__line {
  width: 12px;
  height: 2px;
}
</style>
```

---

## 🗂️ 侧边栏系统

### 可折叠导航侧边栏

```vue
<!-- components/admin/layout/AdminSidebar.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import SidebarMenuItem from './SidebarMenuItem.vue'
import UserProfile from './UserProfile.vue'

interface Props {
  width: number
  collapsed: boolean
  collapsible: boolean
}

const props = defineProps<Props>()

interface Emits {
  'toggle': []
  'item-click': [item: MenuItem]
}

const emit = defineEmits<Emits>()

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

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
        path: '/admin/users/list'
      },
      {
        id: 'user-roles',
        label: '角色管理',
        icon: '🎭',
        path: '/admin/users/roles'
      },
      {
        id: 'user-permissions',
        label: '权限管理',
        icon: '🔐',
        path: '/admin/users/permissions'
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
        path: '/admin/workflows/list'
      },
      {
        id: 'workflow-templates',
        label: '模板管理',
        icon: '📄',
        path: '/admin/workflows/templates'
      },
      {
        id: 'workflow-execution',
        label: '执行历史',
        icon: '⏱️',
        path: '/admin/workflows/execution'
      }
    ]
  },
  {
    id: 'monitoring',
    label: '监控中心',
    icon: '📈',
    children: [
      {
        id: 'system-monitor',
        label: '系统监控',
        icon: '💻',
        path: '/admin/monitoring/system'
      },
      {
        id: 'performance',
        label: '性能分析',
        icon: '⚡',
        path: '/admin/monitoring/performance'
      },
      {
        id: 'logs',
        label: '日志管理',
        icon: '📜',
        path: '/admin/monitoring/logs'
      },
      {
        id: 'alerts',
        label: '告警管理',
        icon: '🚨',
        path: '/admin/monitoring/alerts',
        badge: adminStore.unreadAlertsCount
      }
    ]
  },
  {
    id: 'data',
    label: '数据管理',
    icon: '🗄️',
    children: [
      {
        id: 'data-sources',
        label: '数据源',
        icon: '🔌',
        path: '/admin/data/sources'
      },
      {
        id: 'data-backup',
        label: '备份管理',
        icon: '💾',
        path: '/admin/data/backup'
      },
      {
        id: 'data-import',
        label: '数据导入',
        icon: '📥',
        path: '/admin/data/import'
      },
      {
        id: 'data-export',
        label: '数据导出',
        icon: '📤',
        path: '/admin/data/export'
      }
    ]
  },
  {
    id: 'settings',
    label: '系统设置',
    icon: '⚙️',
    children: [
      {
        id: 'general',
        label: '常规设置',
        icon: '🔧',
        path: '/admin/settings/general'
      },
      {
        id: 'security',
        label: '安全设置',
        icon: '🛡️',
        path: '/admin/settings/security'
      },
      {
        id: 'integrations',
        label: '集成配置',
        icon: '🔗',
        path: '/admin/settings/integrations'
      },
      {
        id: 'appearance',
        label: '外观设置',
        icon: '🎨',
        path: '/admin/settings/appearance'
      }
    ]
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

const currentUser = computed(() => adminStore.currentUser)

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
  emit('item-click', item)
  
  if (item.path) {
    router.push(item.path)
  } else if (item.children) {
    toggleExpand(item.id)
  }
}

const handleToggle = () => {
  emit('toggle')
}

// 监听路由变化，自动展开相关菜单
watch(() => route.path, (newPath) => {
  menuItems.value.forEach(item => {
    if (item.children) {
      const hasActiveChild = item.children.some(child => 
        child.path && newPath.startsWith(child.path)
      )
      if (hasActiveChild && !isExpanded(item.id)) {
        expandedItems.value.push(item.id)
      }
    }
  })
}, { immediate: true })
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
        <SidebarMenuItem
          v-for="item in menuItems"
          :key="item.id"
          :item="item"
          :collapsed="collapsed"
          :active="isActive(item)"
          :expanded="isExpanded(item.id)"
          @click="handleItemClick"
          @toggle="toggleExpand(item.id)"
        />
      </div>
    </nav>
    
    <!-- 用户信息 -->
    <div class="sidebar-footer">
      <UserProfile 
        v-if="currentUser"
        :user="currentUser"
        :collapsed="collapsed"
        class="user-profile"
      />
      
      <!-- 快捷操作 -->
      <div v-if="!collapsed" class="quick-actions">
        <button class="quick-action-button" title="帮助文档">
          ❓
        </button>
        <button class="quick-action-button" title="反馈建议">
          💬
        </button>
        <button class="quick-action-button" title="设置">
          ⚙️
        </button>
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

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
}

.user-profile {
  margin-bottom: 12px;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.quick-action-button {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
}

.quick-action-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
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
```

### 侧边栏菜单项组件

```vue
<!-- components/admin/layout/SidebarMenuItem.vue -->
<script setup lang="ts">
import { computed } from 'vue'

interface MenuItem {
  id: string
  label: string
  icon: string
  path?: string
  children?: MenuItem[]
  badge?: string | number
  disabled?: boolean
}

interface Props {
  item: MenuItem
  collapsed: boolean
  active: boolean
  expanded: boolean
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 0
})

interface Emits {
  'click': [item: MenuItem]
  'toggle': [itemId: string]
}

const emit = defineEmits<Emits>()

const itemClasses = computed(() => [
  'sidebar-menu-item',
  `sidebar-menu-item--level-${props.level}`,
  {
    'sidebar-menu-item--active': props.active,
    'sidebar-menu-item--expanded': props.expanded,
    'sidebar-menu-item--disabled': props.item.disabled,
    'sidebar-menu-item--has-children': props.item.children && props.item.children.length > 0,
    'sidebar-menu-item--collapsed': props.collapsed
  }
])

const handleClick = () => {
  if (props.item.disabled) return
  
  if (props.item.children && props.item.children.length > 0) {
    emit('toggle', props.item.id)
  } else {
    emit('click', props.item)
  }
}

const handleChildClick = (child: MenuItem) => {
  emit('click', child)
}

const handleChildToggle = (childId: string) => {
  emit('toggle', childId)
}
</script>

<template>
  <div class="sidebar-menu-item-wrapper">
    <!-- 主菜单项 -->
    <div 
      :class="itemClasses"
      @click="handleClick"
      :title="collapsed ? item.label : undefined"
    >
      <!-- 图标 -->
      <div class="menu-item-icon">
        <span class="icon-emoji">{{ item.icon }}</span>
      </div>
      
      <!-- 标签和徽章 -->
      <div v-if="!collapsed" class="menu-item-content">
        <span class="menu-item-label">{{ item.label }}</span>
        
        <!-- 徽章 -->
        <span 
          v-if="item.badge" 
          class="menu-item-badge"
        >
          {{ item.badge }}
        </span>
      </div>
      
      <!-- 展开箭头 -->
      <div 
        v-if="!collapsed && item.children && item.children.length > 0"
        class="menu-item-arrow"
        :class="{ 'menu-item-arrow--expanded': expanded }"
      >
        ▼
      </div>
    </div>
    
    <!-- 子菜单 -->
    <div 
      v-if="!collapsed && item.children && item.children.length > 0"
      class="menu-item-children"
      :class="{ 'menu-item-children--expanded': expanded }"
    >
      <SidebarMenuItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :collapsed="false"
        :active="false"
        :expanded="false"
        :level="level + 1"
        @click="handleChildClick"
        @toggle="handleChildToggle"
      />
    </div>
    
    <!-- 折叠状态下的子菜单提示 -->
    <div 
      v-if="collapsed && item.children && item.children.length > 0"
      class="collapsed-children-indicator"
    >
      <div class="indicator-dot"></div>
    </div>
  </div>
</template>

<style scoped>
.sidebar-menu-item-wrapper {
  position: relative;
}

.sidebar-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  margin: 2px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-height: 40px;
}

.sidebar-menu-item:hover:not(.sidebar-menu-item--disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-menu-item--active {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.sidebar-menu-item--active::before {
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

.sidebar-menu-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sidebar-menu-item--collapsed {
  justify-content: center;
  padding: 8px;
}

.sidebar-menu-item--level-1 {
  padding-left: 24px;
}

.sidebar-menu-item--level-2 {
  padding-left: 36px;
}

.menu-item-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.icon-emoji {
  filter: grayscale(1) brightness(0) invert(1);
}

.sidebar-menu-item--active .icon-emoji {
  filter: none;
}

.menu-item-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
}

.menu-item-label {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-item-badge {
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  line-height: 1.2;
}

.menu-item-arrow {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.menu-item-arrow--expanded {
  transform: rotate(180deg);
}

.menu-item-children {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.menu-item-children--expanded {
  max-height: 500px;
}

.collapsed-children-indicator {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
}

.indicator-dot {
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
}

/* 子菜单项样式 */
.sidebar-menu-item--level-1 {
  background: rgba(0, 0, 0, 0.1);
}

.sidebar-menu-item--level-1:hover {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-menu-item--level-1.sidebar-menu-item--active {
  background: rgba(59, 130, 246, 0.15);
}

.sidebar-menu-item--level-2 {
  background: rgba(0, 0, 0, 0.15);
}

.sidebar-menu-item--level-2:hover {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-menu-item--level-2.sidebar-menu-item--active {
  background: rgba(59, 130, 246, 0.1);
}

/* 动画效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.menu-item-children--expanded .sidebar-menu-item {
  animation: slideIn 0.2s ease forwards;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .sidebar-menu-item {
    padding: 12px 16px;
    min-height: 48px;
  }
  
  .menu-item-label {
    font-size: 16px;
  }
}
</style>
```

---

## 📋 布局开发检查清单

### 设计阶段
- [ ] 确定布局结构和组件层次
- [ ] 设计响应式断点和适配策略
- [ ] 规划主题系统和样式变量
- [ ] 考虑可访问性和键盘导航

### 实现阶段
- [ ] 创建主布局组件
- [ ] 实现侧边栏和导航系统
- [ ] 开发响应式容器组件
- [ ] 添加调整大小功能
- [ ] 实现面板系统

### 交互优化
- [ ] 添加平滑过渡动画
- [ ] 实现键盘快捷键
- [ ] 优化触摸设备体验
- [ ] 添加拖拽和调整功能

### 性能优化
- [ ] 优化布局重排和重绘
- [ ] 实现虚拟滚动（如需要）
- [ ] 添加懒加载机制
- [ ] 优化CSS和JavaScript性能

### 测试验证
- [ ] 跨浏览器兼容性测试
- [ ] 响应式设计测试
- [ ] 可访问性测试
- [ ] 性能基准测试
- [ ] 用户体验测试

这份布局系统设计文档为vue-flow后台管理系统提供了完整的布局解决方案，确保系统具有良好的用户体验和可维护性。
