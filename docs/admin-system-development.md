# Vue-Flow 后台管理系统开发文档

## 📋 目录

1. [项目概述](#项目概述)
2. [MVVM架构设计](#mvvm架构设计)
3. [核心组件开发](#核心组件开发)
4. [布局系统设计](#布局系统设计)
5. [数据流管理](#数据流管理)
6. [状态管理规范](#状态管理规范)
7. [组件开发规范](#组件开发规范)
8. [最佳实践指南](#最佳实践指南)

---

## 🎯 项目概述

### 技术栈
- **前端框架**: Vue 3.5+ (Composition API)
- **流程图引擎**: @vue-flow/core ^1.45.0
- **状态管理**: Pinia 2.0+
- **构建工具**: Vite 7.0+
- **类型系统**: TypeScript 5.0+
- **UI框架**: 基于vue-flow的自定义组件

### 项目特色
基于现有的AI工作流编辑器项目，我们将vue-flow的强大可视化能力应用到后台管理系统中，创建一个具有以下特点的管理平台：

- 🎨 **可视化管理界面**: 使用vue-flow构建直观的管理流程
- 🔄 **动态工作流**: 管理流程可视化配置
- 📊 **数据流监控**: 实时查看数据处理流程
- 🎛️ **模块化设计**: 基于节点的功能模块
- 🚀 **高性能渲染**: 大规模数据的流畅展示

---

## 🏗️ MVVM架构设计

### 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                        View Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────┐ │
│  │  Admin Layout   │  │  Flow Canvas    │  │  Panels  │ │
│  │  Components     │  │  Components     │  │          │ │
│  └─────────────────┘  └─────────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    ViewModel Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────┐ │
│  │  Admin Store    │  │  Flow Store     │  │ UI Store │ │
│  │  (Pinia)        │  │  (Pinia)        │  │ (Pinia)  │ │
│  └─────────────────┘  └─────────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                      Model Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────┐ │
│  │   Admin API     │  │   Data Models   │  │ Services │ │
│  │   Services      │  │   & Types       │  │          │ │
│  └─────────────────┘  └─────────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────┘
```

### MVVM层级职责

#### Model层 (数据模型)
```typescript
// types/admin.ts
export interface AdminUser {
  id: string
  username: string
  email: string
  role: UserRole
  permissions: Permission[]
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  updatedAt: Date
}

export interface AdminModule {
  id: string
  name: string
  type: 'data-source' | 'processor' | 'output' | 'monitor'
  config: ModuleConfig
  position: { x: number; y: number }
  connections: Connection[]
}

export interface AdminWorkflow {
  id: string
  name: string
  description: string
  modules: AdminModule[]
  connections: AdminConnection[]
  status: 'draft' | 'active' | 'paused'
}
```

#### ViewModel层 (状态管理)
```typescript
// stores/admin.ts
export const useAdminStore = defineStore('admin', () => {
  // 状态
  const users = ref<AdminUser[]>([])
  const currentUser = ref<AdminUser | null>(null)
  const workflows = ref<AdminWorkflow[]>([])
  const modules = ref<AdminModule[]>([])
  
  // 计算属性
  const activeUsers = computed(() => 
    users.value.filter(user => user.status === 'active')
  )
  
  const workflowStats = computed(() => ({
    total: workflows.value.length,
    active: workflows.value.filter(w => w.status === 'active').length,
    draft: workflows.value.filter(w => w.status === 'draft').length
  }))
  
  // Actions
  const fetchUsers = async () => {
    const response = await adminApi.getUsers()
    users.value = response.data
  }
  
  const createWorkflow = async (workflow: CreateWorkflowRequest) => {
    const response = await adminApi.createWorkflow(workflow)
    workflows.value.push(response.data)
    return response.data
  }
  
  return {
    // 状态
    users: readonly(users),
    currentUser: readonly(currentUser),
    workflows: readonly(workflows),
    modules: readonly(modules),
    
    // 计算属性
    activeUsers,
    workflowStats,
    
    // 方法
    fetchUsers,
    createWorkflow
  }
})
```

#### View层 (组件)
```vue
<!-- components/admin/AdminDashboard.vue -->
<script setup lang="ts">
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { useAdminStore } from '@/stores/admin'
import AdminModuleNode from './AdminModuleNode.vue'
import AdminConnectionEdge from './AdminConnectionEdge.vue'

const adminStore = useAdminStore()
const { nodes, edges, onConnect, addNodes, addEdges } = useVueFlow()

// 响应式绑定
watchEffect(() => {
  nodes.value = adminStore.modules.map(module => ({
    id: module.id,
    type: 'admin-module',
    position: module.position,
    data: module
  }))
})
</script>

<template>
  <div class="admin-dashboard">
    <VueFlow 
      v-model:nodes="nodes" 
      v-model:edges="edges"
      @connect="onConnect"
      class="admin-flow"
    >
      <template #node-admin-module="props">
        <AdminModuleNode v-bind="props" />
      </template>
      
      <template #edge-admin-connection="props">
        <AdminConnectionEdge v-bind="props" />
      </template>
    </VueFlow>
  </div>
</template>
```

---

## 🧩 核心组件开发

### 管理模块节点组件

#### 数据源节点
```vue
<!-- components/admin/nodes/DataSourceNode.vue -->
<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import type { AdminModule } from '@/types/admin'

interface Props extends NodeProps<AdminModule> {}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:data': [data: AdminModule]
  'configure': [moduleId: string]
}>()

const handleConfigure = () => {
  emit('configure', props.id)
}

const statusColors = {
  active: '#10b981',
  inactive: '#6b7280',
  error: '#ef4444'
}
</script>

<template>
  <div class="data-source-node">
    <!-- 输出连接点 -->
    <Handle
      id="output"
      type="source"
      :position="Position.Right"
      class="node-handle"
    />
    
    <!-- 节点头部 -->
    <div class="node-header">
      <div class="node-icon">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
        </svg>
      </div>
      <h3 class="node-title">{{ data.name }}</h3>
      <div 
        class="status-indicator"
        :style="{ backgroundColor: statusColors[data.status] }"
      />
    </div>
    
    <!-- 节点内容 -->
    <div class="node-content">
      <div class="config-summary">
        <div class="config-item">
          <span class="label">类型:</span>
          <span class="value">{{ data.config.type }}</span>
        </div>
        <div class="config-item">
          <span class="label">连接:</span>
          <span class="value">{{ data.config.connectionString }}</span>
        </div>
      </div>
    </div>
    
    <!-- 节点操作 -->
    <div class="node-actions">
      <button 
        @click="handleConfigure"
        class="action-button"
        title="配置"
      >
        ⚙️
      </button>
    </div>
  </div>
</template>

<style scoped>
.data-source-node {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  min-width: 200px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.data-source-node:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.node-icon {
  color: #3b82f6;
}

.node-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.node-content {
  margin-bottom: 12px;
}

.config-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.label {
  color: #6b7280;
}

.value {
  color: #1f2937;
  font-weight: 500;
}

.node-actions {
  display: flex;
  justify-content: flex-end;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #f3f4f6;
}

.node-handle {
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border: 2px solid white;
}
</style>
```

#### 处理器节点
```vue
<!-- components/admin/nodes/ProcessorNode.vue -->
<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import type { AdminModule } from '@/types/admin'

interface Props extends NodeProps<AdminModule> {}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:data': [data: AdminModule]
  'configure': [moduleId: string]
  'execute': [moduleId: string]
}>()

const processingStatus = ref<'idle' | 'processing' | 'completed' | 'error'>('idle')
const processedCount = ref(0)

const handleExecute = () => {
  emit('execute', props.id)
}
</script>

<template>
  <div class="processor-node">
    <!-- 输入连接点 -->
    <Handle
      id="input"
      type="target"
      :position="Position.Left"
      class="node-handle input-handle"
    />
    
    <!-- 输出连接点 -->
    <Handle
      id="output"
      type="source"
      :position="Position.Right"
      class="node-handle output-handle"
    />
    
    <!-- 节点头部 -->
    <div class="node-header">
      <div class="node-icon">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h3 class="node-title">{{ data.name }}</h3>
      <div 
        class="processing-indicator"
        :class="{ 'processing': processingStatus === 'processing' }"
      />
    </div>
    
    <!-- 节点内容 -->
    <div class="node-content">
      <div class="processor-info">
        <div class="info-item">
          <span class="label">处理器:</span>
          <span class="value">{{ data.config.processorType }}</span>
        </div>
        <div class="info-item">
          <span class="label">已处理:</span>
          <span class="value">{{ processedCount }}</span>
        </div>
      </div>
      
      <!-- 处理进度 -->
      <div v-if="processingStatus === 'processing'" class="progress-bar">
        <div class="progress-fill" :style="{ width: '60%' }"></div>
      </div>
    </div>
    
    <!-- 节点操作 -->
    <div class="node-actions">
      <button 
        @click="emit('configure', props.id)"
        class="action-button"
        title="配置"
      >
        ⚙️
      </button>
      <button 
        @click="handleExecute"
        class="action-button execute-button"
        title="执行"
        :disabled="processingStatus === 'processing'"
      >
        ▶️
      </button>
    </div>
  </div>
</template>

<style scoped>
.processor-node {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 2px solid #4c51bf;
  border-radius: 12px;
  padding: 16px;
  min-width: 220px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.processing-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #10b981;
}

.processing-indicator.processing {
  animation: pulse 1.5s infinite;
  background-color: #f59e0b;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background-color: #10b981;
  transition: width 0.3s ease;
}

.execute-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-handle {
  background: #10b981;
}

.output-handle {
  background: #3b82f6;
}
</style>
```

### 管理面板组件

#### 用户管理面板
```vue
<!-- components/admin/panels/UserManagementPanel.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import type { AdminUser, UserRole } from '@/types/admin'

const adminStore = useAdminStore()

const searchQuery = ref('')
const selectedRole = ref<UserRole | 'all'>('all')
const showCreateModal = ref(false)

const filteredUsers = computed(() => {
  let users = adminStore.users
  
  if (searchQuery.value) {
    users = users.filter(user => 
      user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (selectedRole.value !== 'all') {
    users = users.filter(user => user.role === selectedRole.value)
  }
  
  return users
})

const userStats = computed(() => ({
  total: adminStore.users.length,
  active: adminStore.users.filter(u => u.status === 'active').length,
  inactive: adminStore.users.filter(u => u.status === 'inactive').length,
  suspended: adminStore.users.filter(u => u.status === 'suspended').length
}))

onMounted(() => {
  adminStore.fetchUsers()
})

const handleCreateUser = () => {
  showCreateModal.value = true
}

const handleEditUser = (user: AdminUser) => {
  // 实现编辑用户逻辑
}

const handleDeleteUser = (userId: string) => {
  // 实现删除用户逻辑
}
</script>

<template>
  <div class="user-management-panel">
    <!-- 面板头部 -->
    <div class="panel-header">
      <h2 class="panel-title">用户管理</h2>
      <button 
        @click="handleCreateUser"
        class="create-button"
      >
        + 新建用户
      </button>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ userStats.total }}</div>
        <div class="stat-label">总用户数</div>
      </div>
      <div class="stat-card active">
        <div class="stat-value">{{ userStats.active }}</div>
        <div class="stat-label">活跃用户</div>
      </div>
      <div class="stat-card inactive">
        <div class="stat-value">{{ userStats.inactive }}</div>
        <div class="stat-label">非活跃用户</div>
      </div>
      <div class="stat-card suspended">
        <div class="stat-value">{{ userStats.suspended }}</div>
        <div class="stat-label">已暂停</div>
      </div>
    </div>
    
    <!-- 搜索和过滤 -->
    <div class="filters">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索用户..."
          class="search-input"
        />
      </div>
      <select v-model="selectedRole" class="role-filter">
        <option value="all">所有角色</option>
        <option value="admin">管理员</option>
        <option value="editor">编辑者</option>
        <option value="viewer">查看者</option>
      </select>
    </div>
    
    <!-- 用户列表 -->
    <div class="user-list">
      <div 
        v-for="user in filteredUsers" 
        :key="user.id"
        class="user-item"
      >
        <div class="user-avatar">
          {{ user.username.charAt(0).toUpperCase() }}
        </div>
        <div class="user-info">
          <div class="user-name">{{ user.username }}</div>
          <div class="user-email">{{ user.email }}</div>
        </div>
        <div class="user-role">
          <span class="role-badge" :class="user.role">
            {{ user.role }}
          </span>
        </div>
        <div class="user-status">
          <span class="status-badge" :class="user.status">
            {{ user.status }}
          </span>
        </div>
        <div class="user-actions">
          <button 
            @click="handleEditUser(user)"
            class="action-btn edit"
          >
            编辑
          </button>
          <button 
            @click="handleDeleteUser(user.id)"
            class="action-btn delete"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-management-panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.panel-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.create-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.create-button:hover {
  background: #2563eb;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #e5e7eb;
}

.stat-card.active {
  border-left-color: #10b981;
}

.stat-card.inactive {
  border-left-color: #6b7280;
}

.stat-card.suspended {
  border-left-color: #ef4444;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-box {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.role-filter {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  min-width: 120px;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-item:hover {
  background: #f3f4f6;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
}

.user-email {
  font-size: 14px;
  color: #6b7280;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.admin {
  background: #fef3c7;
  color: #92400e;
}

.role-badge.editor {
  background: #dbeafe;
  color: #1e40af;
}

.role-badge.viewer {
  background: #f3f4f6;
  color: #374151;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #f3f4f6;
  color: #374151;
}

.status-badge.suspended {
  background: #fee2e2;
  color: #991b1b;
}

.user-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn.edit {
  background: #dbeafe;
  color: #1e40af;
}

.action-btn.edit:hover {
  background: #bfdbfe;
}

.action-btn.delete {
  background: #fee2e2;
  color: #991b1b;
}

.action-btn.delete:hover {
  background: #fecaca;
}
</style>
```

---

## 📐 布局系统设计

### 主布局组件
```vue
<!-- components/admin/layout/AdminLayout.vue -->
<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { useUIStore } from '@/stores/ui'
import AdminSidebar from './AdminSidebar.vue'
import AdminHeader from './AdminHeader.vue'
import AdminBreadcrumb from './AdminBreadcrumb.vue'

const uiStore = useUIStore()

const sidebarCollapsed = computed(() => uiStore.sidebarCollapsed)
const sidebarWidth = computed(() => uiStore.layoutConfig.sidebarWidth)

// 提供布局上下文
provide('layout', {
  sidebarCollapsed,
  sidebarWidth
})
</script>

<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <AdminSidebar 
      :collapsed="sidebarCollapsed"
      :width="sidebarWidth"
      class="admin-sidebar"
    />
    
    <!-- 主内容区域 -->
    <div 
      class="admin-main"
      :style="{ 
        marginLeft: sidebarCollapsed ? '64px' : `${sidebarWidth}px` 
      }"
    >
      <!-- 顶部导航 -->
      <AdminHeader class="admin-header" />
      
      <!-- 面包屑导航 -->
      <AdminBreadcrumb class="admin-breadcrumb" />
      
      <!-- 内容区域 -->
      <main class="admin-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #f8fafc;
}

.admin-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  transition: all 0.3s ease;
}

.admin-main {
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.admin-breadcrumb {
  background: white;
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 24px;
}

.admin-content {
  flex: 1;
  padding: 24px;
  overflow: hidden;
}
</style>
```

### 响应式侧边栏
```vue
<!-- components/admin/layout/AdminSidebar.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

interface Props {
  collapsed: boolean
  width: number
}

const props = defineProps<Props>()

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

const menuItems = ref([
  {
    id: 'dashboard',
    label: '仪表板',
    icon: '📊',
    path: '/admin/dashboard',
    children: []
  },
  {
    id: 'users',
    label: '用户管理',
    icon: '👥',
    path: '/admin/users',
    children: [
      { id: 'user-list', label: '用户列表', path: '/admin/users/list' },
      { id: 'user-roles', label: '角色管理', path: '/admin/users/roles' }
    ]
  },
  {
    id: 'workflows',
    label: '工作流管理',
    icon: '🔄',
    path: '/admin/workflows',
    children: [
      { id: 'workflow-list', label: '工作流列表', path: '/admin/workflows/list' },
      { id: 'workflow-templates', label: '模板管理', path: '/admin/workflows/templates' }
    ]
  },
  {
    id: 'monitoring',
    label: '监控中心',
    icon: '📈',
    path: '/admin/monitoring',
    children: [
      { id: 'system-monitor', label: '系统监控', path: '/admin/monitoring/system' },
      { id: 'performance', label: '性能分析', path: '/admin/monitoring/performance' }
    ]
  },
  {
    id: 'settings',
    label: '系统设置',
    icon: '⚙️',
    path: '/admin/settings',
    children: [
      { id: 'general', label: '常规设置', path: '/admin/settings/general' },
      { id: 'security', label: '安全设置', path: '/admin/settings/security' }
    ]
  }
])

const expandedItems = ref<string[]>(['users', 'workflows'])

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const toggleExpand = (itemId: string) => {
  const index = expandedItems.value.indexOf(itemId)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(itemId)
  }
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <aside 
    class="admin-sidebar"
    :class="{ collapsed }"
    :style="{ width: collapsed ? '64px' : `${width}px` }"
  >
    <!-- Logo区域 -->
    <div class="sidebar-logo">
      <div class="logo-icon">🎛️</div>
      <div v-if="!collapsed" class="logo-text">
        管理后台
      </div>
    </div>
    
    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <div 
        v-for="item in menuItems"
        :key="item.id"
        class="nav-item"
      >
        <!-- 主菜单项 -->
        <div 
          class="nav-link"
          :class="{ 
            active: isActive(item.path),
            'has-children': item.children.length > 0
          }"
          @click="item.children.length > 0 ? toggleExpand(item.id) : navigateTo(item.path)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
          <span 
            v-if="!collapsed && item.children.length > 0"
            class="nav-arrow"
            :class="{ expanded: expandedItems.includes(item.id) }"
          >
            ▼
          </span>
        </div>
        
        <!-- 子菜单 -->
        <div 
          v-if="!collapsed && item.children.length > 0"
          class="nav-children"
          :class="{ expanded: expandedItems.includes(item.id) }"
        >
          <div
            v-for="child in item.children"
            :key="child.id"
            class="nav-child-link"
            :class="{ active: isActive(child.path) }"
            @click="navigateTo(child.path)"
          >
            {{ child.label }}
          </div>
        </div>
      </div>
    </nav>
    
    <!-- 用户信息 -->
    <div class="sidebar-user">
      <div class="user-avatar">
        {{ adminStore.currentUser?.username?.charAt(0)?.toUpperCase() || 'A' }}
      </div>
      <div v-if="!collapsed" class="user-info">
        <div class="user-name">{{ adminStore.currentUser?.username || 'Admin' }}</div>
        <div class="user-role">{{ adminStore.currentUser?.role || 'Administrator' }}</div>
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
}

.collapsed {
  width: 64px !important;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
  font-size: 24px;
  min-width: 32px;
  text-align: center;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  background: rgba(59, 130, 246, 0.2);
  border-right: 3px solid #3b82f6;
}

.nav-icon {
  font-size: 18px;
  min-width: 24px;
  text-align: center;
}

.nav-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
}

.nav-arrow.expanded {
  transform: rotate(180deg);
}

.nav-children {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: rgba(0, 0, 0, 0.2);
}

.nav-children.expanded {
  max-height: 200px;
}

.nav-child-link {
  padding: 8px 16px 8px 52px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

.nav-child-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-child-link.active {
  background: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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
</style>
```

---

## 🔄 数据流管理

### 管理系统数据流架构
```typescript
// composables/useAdminDataFlow.ts
import { ref, computed, watch } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import type { AdminModule, AdminConnection, DataFlowEvent } from '@/types/admin'

export function useAdminDataFlow() {
  const { nodes, edges, onConnect, onNodesChange, onEdgesChange } = useVueFlow()
  
  // 数据流状态
  const dataFlowActive = ref(false)
  const flowingData = ref<Map<string, any>>(new Map())
  const flowEvents = ref<DataFlowEvent[]>([])
  
  // 数据流统计
  const flowStats = computed(() => ({
    totalNodes: nodes.value.length,
    activeConnections: edges.value.length,
    dataPackets: flowingData.value.size,
    throughput: calculateThroughput()
  }))
  
  // 启动数据流
  const startDataFlow = async () => {
    dataFlowActive.value = true
    
    // 找到所有数据源节点
    const sourceNodes = nodes.value.filter(node => 
      node.type === 'data-source' && node.data.status === 'active'
    )
    
    // 为每个数据源启动数据流
    for (const sourceNode of sourceNodes) {
      await initiateDataFlow(sourceNode.id)
    }
  }
  
  // 停止数据流
  const stopDataFlow = () => {
    dataFlowActive.value = false
    flowingData.value.clear()
    
    // 重置所有节点状态
    nodes.value.forEach(node => {
      if (node.data.status === 'processing') {
        node.data.status = 'idle'
      }
    })
  }
  
  // 初始化单个节点的数据流
  const initiateDataFlow = async (nodeId: string) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node) return
    
    // 模拟数据生成
    const data = await generateMockData(node.data.config)
    
    // 将数据添加到流中
    flowingData.value.set(nodeId, data)
    
    // 记录流事件
    flowEvents.value.push({
      id: Date.now().toString(),
      type: 'data-generated',
      nodeId,
      timestamp: new Date(),
      data: { size: data.length }
    })
    
    // 传播数据到下游节点
    await propagateData(nodeId, data)
  }
  
  // 数据传播
  const propagateData = async (fromNodeId: string, data: any) => {
    // 找到所有从当前节点出发的连接
    const outgoingEdges = edges.value.filter(edge => edge.source === fromNodeId)
    
    for (const edge of outgoingEdges) {
      const targetNode = nodes.value.find(n => n.id === edge.target)
      if (!targetNode) continue
      
      // 更新目标节点状态
      targetNode.data.status = 'processing'
      
      // 模拟数据处理延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 处理数据
      const processedData = await processData(targetNode, data)
      
      // 更新流数据
      flowingData.value.set(edge.target, processedData)
      
      // 记录处理事件
      flowEvents.value.push({
        id: Date.now().toString(),
        type: 'data-processed',
        nodeId: edge.target,
        timestamp: new Date(),
        data: { 
          inputSize: data.length, 
          outputSize: processedData.length 
        }
      })
      
      // 更新节点状态
      targetNode.data.status = 'success'
      
      // 继续传播到下游
      if (targetNode.type !== 'output') {
        await propagateData(edge.target, processedData)
      }
    }
  }
  
  // 数据处理逻辑
  const processData = async (node: AdminModule, inputData: any) => {
    switch (node.type) {
      case 'processor':
        return await applyProcessor(node.config, inputData)
      case 'filter':
        return await applyFilter(node.config, inputData)
      case 'aggregator':
        return await applyAggregation(node.config, inputData)
      default:
        return inputData
    }
  }
  
  // 计算吞吐量
  const calculateThroughput = () => {
    const recentEvents = flowEvents.value.filter(event => 
      Date.now() - event.timestamp.getTime() < 60000 // 最近1分钟
    )
    return recentEvents.length
  }
  
  // 生成模拟数据
  const generateMockData = async (config: any) => {
    // 根据配置生成模拟数据
    const mockData = []
    for (let i = 0; i < (config.batchSize || 100); i++) {
      mockData.push({
        id: i,
        timestamp: new Date(),
        value: Math.random() * 100,
        category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
      })
    }
    return mockData
  }
  
  // 应用处理器
  const applyProcessor = async (config: any, data: any[]) => {
    switch (config.processorType) {
      case 'transform':
        return data.map(item => ({
          ...item,
          transformedValue: item.value * 2
        }))
      case 'validate':
        return data.filter(item => item.value > 50)
      case 'enrich':
        return data.map(item => ({
          ...item,
          enrichedData: `processed_${item.id}`
        }))
      default:
        return data
    }
  }
  
  // 应用过滤器
  const applyFilter = async (config: any, data: any[]) => {
    const { filterType, criteria } = config
    
    switch (filterType) {
      case 'range':
        return data.filter(item => 
          item.value >= criteria.min && item.value <= criteria.max
        )
      case 'category':
        return data.filter(item => 
          criteria.categories.includes(item.category)
        )
      default:
        return data
    }
  }
  
  // 应用聚合
  const applyAggregation = async (config: any, data: any[]) => {
    const { aggregationType, groupBy } = config
    
    if (groupBy) {
      const grouped = data.reduce((acc, item) => {
        const key = item[groupBy]
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      }, {})
      
      return Object.entries(grouped).map(([key, items]: [string, any[]]) => ({
        group: key,
        count: items.length,
        sum: items.reduce((sum, item) => sum + item.value, 0),
        average: items.reduce((sum, item) => sum + item.value, 0) / items.length
      }))
    }
    
    return [{
      count: data.length,
      sum: data.reduce((sum, item) => sum + item.value, 0),
      average: data.reduce((sum, item) => sum + item.value, 0) / data.length,
      max: Math.max(...data.map(item => item.value)),
      min: Math.min(...data.map(item => item.value))
    }]
  }
  
  // 监听节点变化
  watch(nodes, (newNodes) => {
    // 当节点发生变化时，重新计算数据流
    if (dataFlowActive.value) {
      // 可以在这里添加重新计算逻辑
    }
  }, { deep: true })
  
  return {
    // 状态
    dataFlowActive: readonly(dataFlowActive),
    flowingData: readonly(flowingData),
    flowEvents: readonly(flowEvents),
    
    // 计算属性
    flowStats,
    
    // 方法
    startDataFlow,
    stopDataFlow,
    initiateDataFlow,
    propagateData
  }
}
```

### 实时数据监控组件
```vue
<!-- components/admin/monitoring/DataFlowMonitor.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAdminDataFlow } from '@/composables/useAdminDataFlow'

const { 
  dataFlowActive, 
  flowingData, 
  flowEvents, 
  flowStats,
  startDataFlow,
  stopDataFlow 
} = useAdminDataFlow()

const refreshInterval = ref<number | null>(null)
const selectedTimeRange = ref('1h')

const filteredEvents = computed(() => {
  const now = Date.now()
  const ranges = {
    '5m': 5 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000
  }
  
  const range = ranges[selectedTimeRange.value as keyof typeof ranges]
  return flowEvents.value.filter(event => 
    now - event.timestamp.getTime() < range
  )
})

const eventsByType = computed(() => {
  return filteredEvents.value.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
})

onMounted(() => {
  // 每秒刷新一次统计数据
  refreshInterval.value = setInterval(() => {
    // 触发响应式更新
  }, 1000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})

const handleToggleFlow = () => {
  if (dataFlowActive.value) {
    stopDataFlow()
  } else {
    startDataFlow()
  }
}
</script>

<template>
  <div class="data-flow-monitor">
    <!-- 控制面板 -->
    <div class="monitor-header">
      <h3 class="monitor-title">数据流监控</h3>
      <div class="monitor-controls">
        <select v-model="selectedTimeRange" class="time-range-select">
          <option value="5m">最近5分钟</option>
          <option value="1h">最近1小时</option>
          <option value="24h">最近24小时</option>
        </select>
        <button 
          @click="handleToggleFlow"
          class="flow-toggle-btn"
          :class="{ active: dataFlowActive }"
        >
          {{ dataFlowActive ? '停止数据流' : '启动数据流' }}
        </button>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🔗</div>
        <div class="stat-content">
          <div class="stat-value">{{ flowStats.totalNodes }}</div>
          <div class="stat-label">总节点数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🌊</div>
        <div class="stat-content">
          <div class="stat-value">{{ flowStats.activeConnections }}</div>
          <div class="stat-label">活跃连接</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <div class="stat-value">{{ flowStats.dataPackets }}</div>
          <div class="stat-label">数据包</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <div class="stat-value">{{ flowStats.throughput }}</div>
          <div class="stat-label">吞吐量/分钟</div>
        </div>
      </div>
    </div>
    
    <!-- 事件类型统计 -->
    <div class="event-stats">
      <h4 class="section-title">事件统计</h4>
      <div class="event-grid">
        <div 
          v-for="(count, type) in eventsByType" 
          :key="type"
          class="event-item"
        >
          <div class="event-type">{{ type }}</div>
          <div class="event-count">{{ count }}</div>
        </div>
      </div>
    </div>
    
    <!-- 实时事件日志 -->
    <div class="event-log">
      <h4 class="section-title">实时事件日志</h4>
      <div class="log-container">
        <div 
          v-for="event in filteredEvents.slice(-20)" 
          :key="event.id"
          class="log-entry"
          :class="event.type"
        >
          <div class="log-time">
            {{ event.timestamp.toLocaleTimeString() }}
          </div>
          <div class="log-type">{{ event.type }}</div>
          <div class="log-node">节点: {{ event.nodeId }}</div>
          <div class="log-data">
            {{ JSON.stringify(event.data) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-flow-monitor {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.monitor-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.monitor-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.time-range-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.flow-toggle-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  background: #6b7280;
  color: white;
}

.flow-toggle-btn.active {
  background: #ef4444;
}

.flow-toggle-btn:not(.active):hover {
  background: #10b981;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  background: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.event-stats {
  margin-bottom: 24px;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.event-item {
  background: #f3f4f6;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
}

.event-type {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.event-count {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.log-entry {
  display: grid;
  grid-template-columns: 80px 120px 120px 1fr;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 12px;
  align-items: center;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry.data-generated {
  background: #f0f9ff;
}

.log-entry.data-processed {
  background: #f0fdf4;
}

.log-time {
  color: #6b7280;
  font-family: monospace;
}

.log-type {
  font-weight: 500;
  color: #374151;
}

.log-node {
  color: #3b82f6;
}

.log-data {
  color: #6b7280;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
```

---

## 📚 最佳实践指南

### 1. 组件设计原则

#### 单一职责原则
每个组件应该只负责一个特定的功能：
```vue
<!-- ✅ 好的例子：专注于用户列表显示 -->
<script setup lang="ts">
// UserList.vue - 只负责显示用户列表
interface Props {
  users: User[]
  loading: boolean
}
</script>

<!-- ❌ 避免：一个组件做太多事情 -->
<script setup lang="ts">
// UserManagement.vue - 包含列表、编辑、删除、权限等所有功能
</script>
```

#### 组件组合优于继承
```vue
<!-- ✅ 使用组合 -->
<template>
  <AdminLayout>
    <AdminHeader />
    <AdminSidebar />
    <AdminContent>
      <UserManagementPanel />
    </AdminContent>
  </AdminLayout>
</template>
```

### 2. Vue-Flow集成最佳实践

#### 节点类型注册
```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

// 注册自定义节点类型
import DataSourceNode from '@/components/admin/nodes/DataSourceNode.vue'
import ProcessorNode from '@/components/admin/nodes/ProcessorNode.vue'
import OutputNode from '@/components/admin/nodes/OutputNode.vue'

const app = createApp(App)

// 全局注册节点组件
app.component('DataSourceNode', DataSourceNode)
app.component('ProcessorNode', ProcessorNode)
app.component('OutputNode', OutputNode)

app.mount('#app')
```

#### 响应式数据绑定
```vue
<script setup lang="ts">
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()
const { nodes, edges, onConnect, onNodesChange, onEdgesChange } = useVueFlow()

// ✅ 正确：双向数据绑定
watchEffect(() => {
  nodes.value = adminStore.modules.map(module => ({
    id: module.id,
    type: `admin-${module.type}`,
    position: module.position,
    data: module
  }))
})

// ✅ 正确：监听变化并同步到store
onNodesChange((changes) => {
  adminStore.applyModuleChanges(changes)
})
</script>
```

### 3. 状态管理最佳实践

#### Store模块化
```typescript
// stores/index.ts
export { useAdminStore } from './admin'
export { useUserStore } from './user'
export { useWorkflowStore } from './workflow'
export { useUIStore } from './ui'
export { useMonitoringStore } from './monitoring'

// 每个store负责特定领域的状态管理
```

#### 异步操作处理
```typescript
// stores/admin.ts
export const useAdminStore = defineStore('admin', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await adminApi.getUsers()
      users.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取用户失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    loading: readonly(loading),
    error: readonly(error),
    fetchUsers
  }
})
```

### 4. 性能优化建议

#### 大规模数据处理
```vue
<script setup lang="ts">
import { computed, shallowRef } from 'vue'

// ✅ 使用shallowRef处理大量数据
const largeDataset = shallowRef<DataItem[]>([])

// ✅ 使用计算属性进行数据过滤和排序
const filteredData = computed(() => {
  return largeDataset.value
    .filter(item => item.status === 'active')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
})

// ✅ 虚拟滚动处理大列表
const { containerRef, wrapperRef, visibleItems } = useVirtualList(
  filteredData,
  { itemHeight: 60, containerHeight: 400 }
)
</script>
```

#### 组件懒加载
```typescript
// router/index.ts
const routes = [
  {
    path: '/admin/users',
    component: () => import('@/views/admin/UserManagement.vue')
  },
  {
    path: '/admin/workflows',
    component: () => import('@/views/admin/WorkflowManagement.vue')
  }
]
```

### 5. 错误处理和调试

#### 全局错误处理
```typescript
// main.ts
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component instance:', instance)
  console.error('Error info:', info)
  
  // 发送错误到监控服务
  errorReportingService.report(err, { instance, info })
}
```

#### 组件错误边界
```vue
<!-- components/common/ErrorBoundary.vue -->
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  return false // 阻止错误继续传播
})

const retry = () => {
  error.value = null
}
</script>

<template>
  <div v-if="error" class="error-boundary">
    <h3>组件加载失败</h3>
    <p>{{ error.message }}</p>
    <button @click="retry">重试</button>
  </div>
  <slot v-else />
</template>
```

### 6. 测试策略

#### 组件单元测试
```typescript
// tests/components/UserList.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserList from '@/components/admin/UserList.vue'

describe('UserList', () => {
  it('renders user list correctly', () => {
    const users = [
      { id: '1', username: 'admin', email: 'admin@example.com' }
    ]
    
    const wrapper = mount(UserList, {
      props: { users }
    })
    
    expect(wrapper.text()).toContain('admin')
    expect(wrapper.text()).toContain('admin@example.com')
  })
})
```

#### E2E测试
```typescript
// tests/e2e/admin-workflow.spec.ts
import { test, expect } from '@playwright/test'

test('admin can create and manage workflows', async ({ page }) => {
  await page.goto('/admin/workflows')
  
  // 创建新工作流
  await page.click('[data-testid="create-workflow"]')
  await page.fill('[data-testid="workflow-name"]', 'Test Workflow')
  
  // 添加节点
  await page.dragAndDrop(
    '[data-testid="data-source-template"]',
    '[data-testid="canvas"]'
  )
  
  // 验证节点已添加
  await expect(page.locator('[data-testid="workflow-node"]')).toBeVisible()
})
```

---

## 📋 开发检查清单

### 开发前准备
- [ ] 熟悉Vue 3 Composition API
- [ ] 了解@vue-flow/core基本概念
- [ ] 理解MVVM架构模式
- [ ] 配置开发环境和工具

### 组件开发
- [ ] 遵循单一职责原则
- [ ] 正确使用TypeScript类型定义
- [ ] 实现响应式数据绑定
- [ ] 添加适当的错误处理
- [ ] 编写组件文档和示例

### 状态管理
- [ ] 合理划分Store模块
- [ ] 使用readonly暴露状态
- [ ] 正确处理异步操作
- [ ] 实现状态持久化（如需要）

### 性能优化
- [ ] 使用适当的响应式API
- [ ] 实现组件懒加载
- [ ] 优化大数据渲染
- [ ] 添加性能监控

### 测试覆盖
- [ ] 编写单元测试
- [ ] 添加集成测试
- [ ] 实现E2E测试
- [ ] 达到测试覆盖率要求

### 部署准备
- [ ] 构建生产版本
- [ ] 配置环境变量
- [ ] 优化资源加载
- [ ] 设置监控和日志

---

这份文档为使用vue-flow构建后台管理系统提供了全面的指导，涵盖了从架构设计到具体实现的各个方面。开发团队可以根据这份文档快速上手，构建出功能强大、性能优秀的后台管理系统。
