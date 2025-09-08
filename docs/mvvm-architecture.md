# Vue-Flow 后台管理系统 MVVM 架构设计

## 📋 目录

1. [MVVM架构概述](#mvvm架构概述)
2. [Model层设计](#model层设计)
3. [ViewModel层设计](#viewmodel层设计)
4. [View层设计](#view层设计)
5. [数据绑定机制](#数据绑定机制)
6. [状态管理策略](#状态管理策略)
7. [组件通信模式](#组件通信模式)
8. [架构实现指南](#架构实现指南)

---

## 🏗️ MVVM架构概述

### 架构理念

MVVM（Model-View-ViewModel）架构模式将应用程序分为三个核心层次，在vue-flow后台管理系统中的应用：

```
┌─────────────────────────────────────────────────────────────┐
│                         View Layer                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Admin Pages   │  │  Flow Canvas    │  │   Dialogs   │  │
│  │   Components    │  │   Components    │  │  & Modals   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │ Data Binding
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      ViewModel Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  Admin Stores   │  │  Flow Stores    │  │  UI Stores  │  │
│  │    (Pinia)      │  │    (Pinia)      │  │   (Pinia)   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │ Business Logic
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Model Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Data Models   │  │   API Services  │  │  Utilities  │  │
│  │   & Types       │  │   & Adapters    │  │ & Helpers   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 核心优势

1. **关注点分离**: 清晰的层次划分，便于维护和测试
2. **双向数据绑定**: Vue 3的响应式系统天然支持MVVM
3. **可测试性**: ViewModel层可以独立测试业务逻辑
4. **可复用性**: Model和ViewModel可以在不同View中复用
5. **扩展性**: 新功能可以独立开发而不影响现有代码

---

## 📊 Model层设计

### 数据模型定义

#### 核心业务模型
```typescript
// types/admin/models.ts

// 用户模型
export interface AdminUser {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  role: UserRole
  permissions: Permission[]
  status: UserStatus
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer'
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending'

// 权限模型
export interface Permission {
  id: string
  name: string
  resource: string
  action: PermissionAction
  conditions?: PermissionCondition[]
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute'

export interface PermissionCondition {
  field: string
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'lt'
  value: any
}

// 管理模块模型
export interface AdminModule {
  id: string
  name: string
  displayName: string
  type: ModuleType
  category: ModuleCategory
  version: string
  config: ModuleConfig
  position: Position
  size: Size
  status: ModuleStatus
  connections: ModuleConnection[]
  metadata: ModuleMetadata
  createdAt: Date
  updatedAt: Date
}

export type ModuleType = 
  | 'data-source' 
  | 'data-processor' 
  | 'data-filter' 
  | 'data-aggregator'
  | 'data-output'
  | 'monitor'
  | 'alert'
  | 'scheduler'

export type ModuleCategory = 'input' | 'processing' | 'output' | 'monitoring' | 'control'
export type ModuleStatus = 'active' | 'inactive' | 'error' | 'configuring'

export interface ModuleConfig {
  [key: string]: any
  // 具体配置根据模块类型而定
}

export interface ModuleConnection {
  id: string
  sourceId: string
  targetId: string
  sourceHandle?: string
  targetHandle?: string
  type: ConnectionType
  config?: ConnectionConfig
}

export type ConnectionType = 'data' | 'control' | 'event'

export interface ConnectionConfig {
  dataFormat?: 'json' | 'xml' | 'csv' | 'binary'
  compression?: boolean
  encryption?: boolean
  batchSize?: number
  timeout?: number
}

// 工作流模型
export interface AdminWorkflow {
  id: string
  name: string
  description?: string
  category: WorkflowCategory
  modules: AdminModule[]
  connections: ModuleConnection[]
  triggers: WorkflowTrigger[]
  schedule?: WorkflowSchedule
  status: WorkflowStatus
  version: string
  tags: string[]
  owner: string
  collaborators: string[]
  createdAt: Date
  updatedAt: Date
  lastExecutedAt?: Date
  executionStats: ExecutionStats
}

export type WorkflowCategory = 'data-processing' | 'monitoring' | 'automation' | 'reporting'
export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived'

export interface WorkflowTrigger {
  id: string
  type: TriggerType
  config: TriggerConfig
  enabled: boolean
}

export type TriggerType = 'manual' | 'scheduled' | 'event' | 'webhook'

export interface WorkflowSchedule {
  type: 'cron' | 'interval'
  expression: string
  timezone?: string
  enabled: boolean
}

export interface ExecutionStats {
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  averageDuration: number
  lastRunDuration?: number
  lastRunStatus?: 'success' | 'failed' | 'cancelled'
}

// 监控数据模型
export interface MonitoringData {
  id: string
  workflowId: string
  moduleId?: string
  timestamp: Date
  type: MonitoringType
  metrics: Record<string, number>
  events: MonitoringEvent[]
  alerts?: Alert[]
}

export type MonitoringType = 'performance' | 'error' | 'usage' | 'system'

export interface MonitoringEvent {
  id: string
  type: EventType
  level: EventLevel
  message: string
  timestamp: Date
  source: string
  data?: Record<string, any>
}

export type EventType = 'execution' | 'error' | 'warning' | 'info' | 'debug'
export type EventLevel = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  source: string
  timestamp: Date
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  resolved: boolean
  resolvedAt?: Date
}

export type AlertType = 'system' | 'performance' | 'security' | 'business'
export type AlertSeverity = 'critical' | 'warning' | 'info'
```

#### 数据传输对象 (DTOs)
```typescript
// types/admin/dtos.ts

// 创建用户请求
export interface CreateUserRequest {
  username: string
  email: string
  firstName?: string
  lastName?: string
  role: UserRole
  permissions?: string[]
  sendWelcomeEmail?: boolean
}

// 更新用户请求
export interface UpdateUserRequest {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  role?: UserRole
  permissions?: string[]
  status?: UserStatus
}

// 创建工作流请求
export interface CreateWorkflowRequest {
  name: string
  description?: string
  category: WorkflowCategory
  template?: string
  tags?: string[]
}

// 更新工作流请求
export interface UpdateWorkflowRequest {
  name?: string
  description?: string
  category?: WorkflowCategory
  modules?: AdminModule[]
  connections?: ModuleConnection[]
  tags?: string[]
  status?: WorkflowStatus
}

// 执行工作流请求
export interface ExecuteWorkflowRequest {
  workflowId: string
  parameters?: Record<string, any>
  dryRun?: boolean
  timeout?: number
}

// API响应包装器
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  pagination?: PaginationInfo
  metadata?: Record<string, any>
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: Date
}

export interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

// 查询参数
export interface QueryParams {
  page?: number
  pageSize?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}
```

### 数据验证和转换

#### 数据验证器
```typescript
// utils/validators.ts
import { z } from 'zod'

// 用户验证模式
export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  role: z.enum(['super_admin', 'admin', 'editor', 'viewer']),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']),
  createdAt: z.date(),
  updatedAt: z.date()
})

// 工作流验证模式
export const WorkflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['data-processing', 'monitoring', 'automation', 'reporting']),
  status: z.enum(['draft', 'active', 'paused', 'archived']),
  modules: z.array(z.any()), // 详细的模块验证
  connections: z.array(z.any()), // 详细的连接验证
  createdAt: z.date(),
  updatedAt: z.date()
})

// 验证函数
export const validateUser = (data: unknown): AdminUser => {
  return UserSchema.parse(data)
}

export const validateWorkflow = (data: unknown): AdminWorkflow => {
  return WorkflowSchema.parse(data)
}

// 部分验证（用于更新操作）
export const validatePartialUser = (data: unknown): Partial<AdminUser> => {
  return UserSchema.partial().parse(data)
}
```

#### 数据转换器
```typescript
// utils/transformers.ts

// API响应转换为前端模型
export class DataTransformer {
  static transformUser(apiUser: any): AdminUser {
    return {
      id: apiUser.id,
      username: apiUser.username,
      email: apiUser.email,
      firstName: apiUser.first_name,
      lastName: apiUser.last_name,
      avatar: apiUser.avatar_url,
      role: apiUser.role,
      permissions: apiUser.permissions || [],
      status: apiUser.status,
      lastLoginAt: apiUser.last_login_at ? new Date(apiUser.last_login_at) : undefined,
      createdAt: new Date(apiUser.created_at),
      updatedAt: new Date(apiUser.updated_at),
      metadata: apiUser.metadata || {}
    }
  }

  static transformWorkflow(apiWorkflow: any): AdminWorkflow {
    return {
      id: apiWorkflow.id,
      name: apiWorkflow.name,
      description: apiWorkflow.description,
      category: apiWorkflow.category,
      modules: apiWorkflow.modules?.map(this.transformModule) || [],
      connections: apiWorkflow.connections || [],
      triggers: apiWorkflow.triggers || [],
      schedule: apiWorkflow.schedule,
      status: apiWorkflow.status,
      version: apiWorkflow.version,
      tags: apiWorkflow.tags || [],
      owner: apiWorkflow.owner,
      collaborators: apiWorkflow.collaborators || [],
      createdAt: new Date(apiWorkflow.created_at),
      updatedAt: new Date(apiWorkflow.updated_at),
      lastExecutedAt: apiWorkflow.last_executed_at ? new Date(apiWorkflow.last_executed_at) : undefined,
      executionStats: apiWorkflow.execution_stats || {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageDuration: 0
      }
    }
  }

  static transformModule(apiModule: any): AdminModule {
    return {
      id: apiModule.id,
      name: apiModule.name,
      displayName: apiModule.display_name || apiModule.name,
      type: apiModule.type,
      category: apiModule.category,
      version: apiModule.version || '1.0.0',
      config: apiModule.config || {},
      position: apiModule.position || { x: 0, y: 0 },
      size: apiModule.size || { width: 200, height: 100 },
      status: apiModule.status || 'inactive',
      connections: apiModule.connections || [],
      metadata: apiModule.metadata || {},
      createdAt: new Date(apiModule.created_at),
      updatedAt: new Date(apiModule.updated_at)
    }
  }

  // 前端模型转换为API请求
  static toApiUser(user: Partial<AdminUser>): any {
    return {
      username: user.username,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
      metadata: user.metadata
    }
  }

  static toApiWorkflow(workflow: Partial<AdminWorkflow>): any {
    return {
      name: workflow.name,
      description: workflow.description,
      category: workflow.category,
      modules: workflow.modules?.map(this.toApiModule),
      connections: workflow.connections,
      triggers: workflow.triggers,
      schedule: workflow.schedule,
      status: workflow.status,
      tags: workflow.tags,
      collaborators: workflow.collaborators
    }
  }

  static toApiModule(module: Partial<AdminModule>): any {
    return {
      name: module.name,
      display_name: module.displayName,
      type: module.type,
      category: module.category,
      version: module.version,
      config: module.config,
      position: module.position,
      size: module.size,
      status: module.status,
      connections: module.connections,
      metadata: module.metadata
    }
  }
}
```

---

## 🔄 ViewModel层设计

### Pinia Store架构

#### 用户管理Store
```typescript
// stores/admin/users.ts
import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { AdminUser, CreateUserRequest, UpdateUserRequest, QueryParams } from '@/types/admin'
import { userService } from '@/services/admin/userService'
import { DataTransformer } from '@/utils/transformers'
import { validateUser } from '@/utils/validators'

export const useUserStore = defineStore('admin-users', () => {
  // ===== 状态定义 =====
  const users = ref<AdminUser[]>([])
  const currentUser = ref<AdminUser | null>(null)
  const selectedUsers = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  })

  // 查询参数
  const queryParams = ref<QueryParams>({
    page: 1,
    pageSize: 20,
    sort: 'createdAt',
    order: 'desc'
  })

  // ===== 计算属性 =====
  const activeUsers = computed(() => 
    users.value.filter(user => user.status === 'active')
  )

  const inactiveUsers = computed(() => 
    users.value.filter(user => user.status === 'inactive')
  )

  const suspendedUsers = computed(() => 
    users.value.filter(user => user.status === 'suspended')
  )

  const usersByRole = computed(() => {
    return users.value.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  })

  const selectedUserObjects = computed(() => 
    users.value.filter(user => selectedUsers.value.includes(user.id))
  )

  const hasNextPage = computed(() => 
    pagination.value.page < pagination.value.totalPages
  )

  const hasPreviousPage = computed(() => 
    pagination.value.page > 1
  )

  // ===== Actions =====

  // 获取用户列表
  const fetchUsers = async (params?: Partial<QueryParams>) => {
    loading.value = true
    error.value = null

    try {
      // 合并查询参数
      const mergedParams = { ...queryParams.value, ...params }
      queryParams.value = mergedParams

      const response = await userService.getUsers(mergedParams)
      
      // 验证和转换数据
      users.value = response.data.map(user => {
        const transformed = DataTransformer.transformUser(user)
        return validateUser(transformed)
      })

      // 更新分页信息
      if (response.pagination) {
        pagination.value = response.pagination
      }

    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取用户列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取单个用户
  const fetchUser = async (userId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await userService.getUser(userId)
      const transformed = DataTransformer.transformUser(response.data)
      const user = validateUser(transformed)
      
      // 更新用户列表中的对应项
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index] = user
      } else {
        users.value.push(user)
      }

      return user
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取用户信息失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 创建用户
  const createUser = async (userData: CreateUserRequest) => {
    loading.value = true
    error.value = null

    try {
      const response = await userService.createUser(userData)
      const transformed = DataTransformer.transformUser(response.data)
      const newUser = validateUser(transformed)
      
      users.value.unshift(newUser)
      pagination.value.total += 1

      return newUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建用户失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新用户
  const updateUser = async (userId: string, userData: UpdateUserRequest) => {
    loading.value = true
    error.value = null

    try {
      const response = await userService.updateUser(userId, userData)
      const transformed = DataTransformer.transformUser(response.data)
      const updatedUser = validateUser(transformed)
      
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index] = updatedUser
      }

      return updatedUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新用户失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除用户
  const deleteUser = async (userId: string) => {
    loading.value = true
    error.value = null

    try {
      await userService.deleteUser(userId)
      
      users.value = users.value.filter(u => u.id !== userId)
      selectedUsers.value = selectedUsers.value.filter(id => id !== userId)
      pagination.value.total -= 1

    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除用户失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 批量删除用户
  const deleteUsers = async (userIds: string[]) => {
    loading.value = true
    error.value = null

    try {
      await userService.deleteUsers(userIds)
      
      users.value = users.value.filter(u => !userIds.includes(u.id))
      selectedUsers.value = selectedUsers.value.filter(id => !userIds.includes(id))
      pagination.value.total -= userIds.length

    } catch (err) {
      error.value = err instanceof Error ? err.message : '批量删除用户失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新用户状态
  const updateUserStatus = async (userId: string, status: UserStatus) => {
    return updateUser(userId, { status })
  }

  // 重置用户密码
  const resetUserPassword = async (userId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await userService.resetPassword(userId)
      return response.data.temporaryPassword
    } catch (err) {
      error.value = err instanceof Error ? err.message : '重置密码失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 选择操作
  const selectUser = (userId: string) => {
    if (!selectedUsers.value.includes(userId)) {
      selectedUsers.value.push(userId)
    }
  }

  const deselectUser = (userId: string) => {
    selectedUsers.value = selectedUsers.value.filter(id => id !== userId)
  }

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.value.includes(userId)) {
      deselectUser(userId)
    } else {
      selectUser(userId)
    }
  }

  const selectAllUsers = () => {
    selectedUsers.value = users.value.map(user => user.id)
  }

  const clearSelection = () => {
    selectedUsers.value = []
  }

  // 搜索和过滤
  const searchUsers = async (query: string) => {
    await fetchUsers({ ...queryParams.value, search: query, page: 1 })
  }

  const filterUsers = async (filters: Record<string, any>) => {
    await fetchUsers({ ...queryParams.value, filters, page: 1 })
  }

  // 分页操作
  const nextPage = async () => {
    if (hasNextPage.value) {
      await fetchUsers({ ...queryParams.value, page: pagination.value.page + 1 })
    }
  }

  const previousPage = async () => {
    if (hasPreviousPage.value) {
      await fetchUsers({ ...queryParams.value, page: pagination.value.page - 1 })
    }
  }

  const goToPage = async (page: number) => {
    if (page >= 1 && page <= pagination.value.totalPages) {
      await fetchUsers({ ...queryParams.value, page })
    }
  }

  // 排序
  const sortUsers = async (field: string, order: 'asc' | 'desc' = 'asc') => {
    await fetchUsers({ ...queryParams.value, sort: field, order, page: 1 })
  }

  // 清理状态
  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    users.value = []
    currentUser.value = null
    selectedUsers.value = []
    loading.value = false
    error.value = null
    pagination.value = {
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0
    }
    queryParams.value = {
      page: 1,
      pageSize: 20,
      sort: 'createdAt',
      order: 'desc'
    }
  }

  // ===== 返回API =====
  return {
    // 只读状态
    users: readonly(users),
    currentUser: readonly(currentUser),
    selectedUsers: readonly(selectedUsers),
    loading: readonly(loading),
    error: readonly(error),
    pagination: readonly(pagination),
    queryParams: readonly(queryParams),

    // 计算属性
    activeUsers,
    inactiveUsers,
    suspendedUsers,
    usersByRole,
    selectedUserObjects,
    hasNextPage,
    hasPreviousPage,

    // 方法
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    deleteUsers,
    updateUserStatus,
    resetUserPassword,
    selectUser,
    deselectUser,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    searchUsers,
    filterUsers,
    nextPage,
    previousPage,
    goToPage,
    sortUsers,
    clearError,
    reset
  }
})
```

#### 工作流管理Store
```typescript
// stores/admin/workflows.ts
import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { 
  AdminWorkflow, 
  AdminModule, 
  ModuleConnection,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  ExecuteWorkflowRequest
} from '@/types/admin'
import { workflowService } from '@/services/admin/workflowService'
import { DataTransformer } from '@/utils/transformers'

export const useWorkflowStore = defineStore('admin-workflows', () => {
  // ===== 状态定义 =====
  const workflows = ref<AdminWorkflow[]>([])
  const currentWorkflow = ref<AdminWorkflow | null>(null)
  const modules = ref<AdminModule[]>([])
  const connections = ref<ModuleConnection[]>([])
  const selectedElements = ref<{
    modules: string[]
    connections: string[]
  }>({ modules: [], connections: [] })
  
  const loading = ref(false)
  const executing = ref(false)
  const error = ref<string | null>(null)
  
  // 执行状态
  const executionHistory = ref<ExecutionResult[]>([])
  const currentExecution = ref<ExecutionResult | null>(null)

  // ===== 计算属性 =====
  const activeWorkflows = computed(() => 
    workflows.value.filter(w => w.status === 'active')
  )

  const draftWorkflows = computed(() => 
    workflows.value.filter(w => w.status === 'draft')
  )

  const workflowsByCategory = computed(() => {
    return workflows.value.reduce((acc, workflow) => {
      acc[workflow.category] = (acc[workflow.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  })

  const selectedModules = computed(() => 
    modules.value.filter(module => 
      selectedElements.value.modules.includes(module.id)
    )
  )

  const selectedConnections = computed(() => 
    connections.value.filter(connection => 
      selectedElements.value.connections.includes(connection.id)
    )
  )

  const workflowStats = computed(() => {
    if (!currentWorkflow.value) return null
    
    return {
      totalModules: modules.value.length,
      activeModules: modules.value.filter(m => m.status === 'active').length,
      totalConnections: connections.value.length,
      executionStats: currentWorkflow.value.executionStats
    }
  })

  // ===== Actions =====

  // 工作流CRUD操作
  const fetchWorkflows = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await workflowService.getWorkflows()
      workflows.value = response.data.map(workflow => 
        DataTransformer.transformWorkflow(workflow)
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取工作流列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchWorkflow = async (workflowId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await workflowService.getWorkflow(workflowId)
      const workflow = DataTransformer.transformWorkflow(response.data)
      
      currentWorkflow.value = workflow
      modules.value = workflow.modules
      connections.value = workflow.connections
      
      return workflow
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取工作流失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createWorkflow = async (workflowData: CreateWorkflowRequest) => {
    loading.value = true
    error.value = null

    try {
      const response = await workflowService.createWorkflow(workflowData)
      const workflow = DataTransformer.transformWorkflow(response.data)
      
      workflows.value.unshift(workflow)
      return workflow
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建工作流失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateWorkflow = async (workflowId: string, workflowData: UpdateWorkflowRequest) => {
    loading.value = true
    error.value = null

    try {
      const response = await workflowService.updateWorkflow(workflowId, workflowData)
      const workflow = DataTransformer.transformWorkflow(response.data)
      
      const index = workflows.value.findIndex(w => w.id === workflowId)
      if (index !== -1) {
        workflows.value[index] = workflow
      }
      
      if (currentWorkflow.value?.id === workflowId) {
        currentWorkflow.value = workflow
        modules.value = workflow.modules
        connections.value = workflow.connections
      }
      
      return workflow
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新工作流失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteWorkflow = async (workflowId: string) => {
    loading.value = true
    error.value = null

    try {
      await workflowService.deleteWorkflow(workflowId)
      
      workflows.value = workflows.value.filter(w => w.id !== workflowId)
      
      if (currentWorkflow.value?.id === workflowId) {
        currentWorkflow.value = null
        modules.value = []
        connections.value = []
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除工作流失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 模块操作
  const addModule = (module: AdminModule) => {
    modules.value.push(module)
    saveWorkflowChanges()
  }

  const updateModule = (moduleId: string, updates: Partial<AdminModule>) => {
    const index = modules.value.findIndex(m => m.id === moduleId)
    if (index !== -1) {
      modules.value[index] = { ...modules.value[index], ...updates }
      saveWorkflowChanges()
    }
  }

  const removeModule = (moduleId: string) => {
    modules.value = modules.value.filter(m => m.id !== moduleId)
    connections.value = connections.value.filter(c => 
      c.sourceId !== moduleId && c.targetId !== moduleId
    )
    selectedElements.value.modules = selectedElements.value.modules.filter(id => id !== moduleId)
    saveWorkflowChanges()
  }

  // 连接操作
  const addConnection = (connection: ModuleConnection) => {
    connections.value.push(connection)
    saveWorkflowChanges()
  }

  const updateConnection = (connectionId: string, updates: Partial<ModuleConnection>) => {
    const index = connections.value.findIndex(c => c.id === connectionId)
    if (index !== -1) {
      connections.value[index] = { ...connections.value[index], ...updates }
      saveWorkflowChanges()
    }
  }

  const removeConnection = (connectionId: string) => {
    connections.value = connections.value.filter(c => c.id !== connectionId)
    selectedElements.value.connections = selectedElements.value.connections.filter(id => id !== connectionId)
    saveWorkflowChanges()
  }

  // 选择操作
  const selectModule = (moduleId: string, multi = false) => {
    if (multi) {
      if (!selectedElements.value.modules.includes(moduleId)) {
        selectedElements.value.modules.push(moduleId)
      }
    } else {
      selectedElements.value.modules = [moduleId]
      selectedElements.value.connections = []
    }
  }

  const selectConnection = (connectionId: string, multi = false) => {
    if (multi) {
      if (!selectedElements.value.connections.includes(connectionId)) {
        selectedElements.value.connections.push(connectionId)
      }
    } else {
      selectedElements.value.connections = [connectionId]
      selectedElements.value.modules = []
    }
  }

  const clearSelection = () => {
    selectedElements.value = { modules: [], connections: [] }
  }

  // 工作流执行
  const executeWorkflow = async (request: ExecuteWorkflowRequest) => {
    executing.value = true
    error.value = null

    try {
      const response = await workflowService.executeWorkflow(request)
      currentExecution.value = response.data
      executionHistory.value.unshift(response.data)
      
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '执行工作流失败'
      throw err
    } finally {
      executing.value = false
    }
  }

  const stopExecution = async (executionId: string) => {
    try {
      await workflowService.stopExecution(executionId)
      
      if (currentExecution.value?.id === executionId) {
        currentExecution.value.status = 'cancelled'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '停止执行失败'
      throw err
    }
  }

  // 保存工作流变更
  const saveWorkflowChanges = async () => {
    if (!currentWorkflow.value) return

    const updates: UpdateWorkflowRequest = {
      modules: modules.value,
      connections: connections.value
    }

    await updateWorkflow(currentWorkflow.value.id, updates)
  }

  // 工作流模板操作
  const saveAsTemplate = async (name: string, description: string) => {
    if (!currentWorkflow.value) throw new Error('没有当前工作流')

    try {
      const response = await workflowService.saveAsTemplate(currentWorkflow.value.id, {
        name,
        description
      })
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '保存模板失败'
      throw err
    }
  }

  const loadFromTemplate = async (templateId: string) => {
    try {
      const response = await workflowService.loadFromTemplate(templateId)
      const workflow = DataTransformer.transformWorkflow(response.data)
      
      currentWorkflow.value = workflow
      modules.value = workflow.modules
      connections.value = workflow.connections
      
      return workflow
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载模板失败'
      throw err
    }
  }

  // 清理状态
  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    workflows.value = []
    currentWorkflow.value = null
    modules.value = []
    connections.value = []
    selectedElements.value = { modules: [], connections: [] }
    loading.value = false
    executing.value = false
    error.value = null
    executionHistory.value = []
    currentExecution.value = null
  }

  // ===== 返回API =====
  return {
    // 只读状态
    workflows: readonly(workflows),
    currentWorkflow: readonly(currentWorkflow),
    modules: readonly(modules),
    connections: readonly(connections),
    selectedElements: readonly(selectedElements),
    loading: readonly(loading),
    executing: readonly(executing),
    error: readonly(error),
    executionHistory: readonly(executionHistory),
    currentExecution: readonly(currentExecution),

    // 计算属性
    activeWorkflows,
    draftWorkflows,
    workflowsByCategory,
    selectedModules,
    selectedConnections,
    workflowStats,

    // 方法
    fetchWorkflows,
    fetchWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    addModule,
    updateModule,
    removeModule,
    addConnection,
    updateConnection,
    removeConnection,
    selectModule,
    selectConnection,
    clearSelection,
    executeWorkflow,
    stopExecution,
    saveWorkflowChanges,
    saveAsTemplate,
    loadFromTemplate,
    clearError,
    reset
  }
})
```

---

## 🎨 View层设计

### 组件层次结构

#### 页面级组件
```vue
<!-- views/admin/WorkflowManagement.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useWorkflowStore } from '@/stores/admin/workflows'
import { useUIStore } from '@/stores/ui'
import AdminLayout from '@/components/admin/layout/AdminLayout.vue'
import WorkflowCanvas from '@/components/admin/workflow/WorkflowCanvas.vue'
import WorkflowSidebar from '@/components/admin/workflow/WorkflowSidebar.vue'
import WorkflowToolbar from '@/components/admin/workflow/WorkflowToolbar.vue'
import WorkflowPropertiesPanel from '@/components/admin/workflow/WorkflowPropertiesPanel.vue'

// Store实例
const workflowStore = useWorkflowStore()
const uiStore = useUIStore()

// 本地状态
const selectedWorkflowId = ref<string | null>(null)
const showCreateDialog = ref(false)

// 计算属性
const currentWorkflow = computed(() => workflowStore.currentWorkflow)
const loading = computed(() => workflowStore.loading)
const error = computed(() => workflowStore.error)

// 生命周期
onMounted(async () => {
  await workflowStore.fetchWorkflows()
  
  // 如果有路由参数，加载特定工作流
  const workflowId = route.params.id as string
  if (workflowId) {
    await workflowStore.fetchWorkflow(workflowId)
    selectedWorkflowId.value = workflowId
  }
})

// 事件处理
const handleWorkflowSelect = async (workflowId: string) => {
  selectedWorkflowId.value = workflowId
  await workflowStore.fetchWorkflow(workflowId)
  
  // 更新路由
  await router.push(`/admin/workflows/${workflowId}`)
}

const handleCreateWorkflow = () => {
  showCreateDialog.value = true
}

const handleWorkflowCreated = async (workflow: AdminWorkflow) => {
  showCreateDialog.value = false
  await handleWorkflowSelect(workflow.id)
  uiStore.showSuccess('工作流创建成功', `工作流 "${workflow.name}" 已创建`)
}

const handleExecuteWorkflow = async () => {
  if (!currentWorkflow.value) return
  
  try {
    await workflowStore.executeWorkflow({
      workflowId: currentWorkflow.value.id
    })
    uiStore.showSuccess('执行成功', '工作流执行已启动')
  } catch (error) {
    uiStore.showError('执行失败', error.message)
  }
}
</script>

<template>
  <AdminLayout>
    <div class="workflow-management">
      <!-- 工具栏 -->
      <WorkflowToolbar
        :current-workflow="currentWorkflow"
        :loading="loading"
        :executing="workflowStore.executing"
        @create-workflow="handleCreateWorkflow"
        @execute-workflow="handleExecuteWorkflow"
        @save-workflow="workflowStore.saveWorkflowChanges"
        class="workflow-toolbar"
      />
      
      <!-- 主内容区域 -->
      <div class="workflow-content">
        <!-- 侧边栏 -->
        <WorkflowSidebar
          :workflows="workflowStore.workflows"
          :selected-workflow-id="selectedWorkflowId"
          :loading="loading"
          @workflow-select="handleWorkflowSelect"
          @create-workflow="handleCreateWorkflow"
          class="workflow-sidebar"
        />
        
        <!-- 画布区域 -->
        <div class="workflow-main">
          <WorkflowCanvas
            v-if="currentWorkflow"
            :workflow="currentWorkflow"
            :modules="workflowStore.modules"
            :connections="workflowStore.connections"
            :selected-elements="workflowStore.selectedElements"
            @module-add="workflowStore.addModule"
            @module-update="workflowStore.updateModule"
            @module-remove="workflowStore.removeModule"
            @connection-add="workflowStore.addConnection"
            @connection-remove="workflowStore.removeConnection"
            @element-select="workflowStore.selectModule"
            @selection-clear="workflowStore.clearSelection"
            class="workflow-canvas"
          />
          
          <div v-else-if="!loading" class="empty-state">
            <div class="empty-icon">🔄</div>
            <h3>选择或创建工作流</h3>
            <p>从左侧选择一个工作流开始编辑，或创建一个新的工作流。</p>
            <button 
              @click="handleCreateWorkflow"
              class="create-button"
            >
              创建新工作流
            </button>
          </div>
          
          <div v-else class="loading-state">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        </div>
        
        <!-- 属性面板 -->
        <WorkflowPropertiesPanel
          v-if="currentWorkflow"
          :workflow="currentWorkflow"
          :selected-modules="workflowStore.selectedModules"
          :selected-connections="workflowStore.selectedConnections"
          @module-update="workflowStore.updateModule"
          @connection-update="workflowStore.updateConnection"
          class="workflow-properties"
        />
      </div>
      
      <!-- 创建工作流对话框 -->
      <CreateWorkflowDialog
        v-if="showCreateDialog"
        @workflow-created="handleWorkflowCreated"
        @cancel="showCreateDialog = false"
      />
      
      <!-- 错误提示 -->
      <ErrorAlert
        v-if="error"
        :message="error"
        @dismiss="workflowStore.clearError"
      />
    </div>
  </AdminLayout>
</template>

<style scoped>
.workflow-management {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.workflow-toolbar {
  flex-shrink: 0;
  border-bottom: 1px solid #e5e7eb;
}

.workflow-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.workflow-sidebar {
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
}

.workflow-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.workflow-canvas {
  flex: 1;
}

.workflow-properties {
  width: 350px;
  flex-shrink: 0;
  border-left: 1px solid #e5e7eb;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 48px;
  color: #6b7280;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #374151;
}

.empty-state p {
  font-size: 16px;
  margin: 0 0 24px 0;
  max-width: 400px;
}

.create-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-button:hover {
  background: #2563eb;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
```

#### 组件级组件
```vue
<!-- components/admin/workflow/WorkflowCanvas.vue -->
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { VueFlow, useVueFlow, Panel } from '@vue-flow/core'
import type { 
  AdminWorkflow, 
  AdminModule, 
  ModuleConnection 
} from '@/types/admin'

// 组件属性
interface Props {
  workflow: AdminWorkflow
  modules: AdminModule[]
  connections: ModuleConnection[]
  selectedElements: {
    modules: string[]
    connections: string[]
  }
}

const props = defineProps<Props>()

// 组件事件
interface Emits {
  'module-add': [module: AdminModule]
  'module-update': [moduleId: string, updates: Partial<AdminModule>]
  'module-remove': [moduleId: string]
  'connection-add': [connection: ModuleConnection]
  'connection-remove': [connectionId: string]
  'element-select': [elementId: string, multi?: boolean]
  'selection-clear': []
}

const emit = defineEmits<Emits>()

// Vue Flow实例
const { 
  nodes, 
  edges, 
  onConnect, 
  onNodesChange, 
  onEdgesChange,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  addNodes,
  addEdges,
  removeNodes,
  removeEdges,
  screenToFlowCoordinate
} = useVueFlow()

// 本地状态
const vueFlowWrapper = ref<HTMLElement>()
const draggedNodeType = ref<string | null>(null)

// 计算属性
const vueFlowNodes = computed(() => 
  props.modules.map(module => ({
    id: module.id,
    type: `admin-${module.type}`,
    position: module.position,
    data: module,
    selected: props.selectedElements.modules.includes(module.id)
  }))
)

const vueFlowEdges = computed(() => 
  props.connections.map(connection => ({
    id: connection.id,
    source: connection.sourceId,
    target: connection.targetId,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: `admin-${connection.type}`,
    data: connection,
    selected: props.selectedElements.connections.includes(connection.id)
  }))
)

// 监听数据变化
watch(vueFlowNodes, (newNodes) => {
  nodes.value = newNodes
}, { deep: true })

watch(vueFlowEdges, (newEdges) => {
  edges.value = newEdges
}, { deep: true })

// Vue Flow事件处理
onConnect((params) => {
  const connection: ModuleConnection = {
    id: `connection_${Date.now()}`,
    sourceId: params.source,
    targetId: params.target,
    sourceHandle: params.sourceHandle,
    targetHandle: params.targetHandle,
    type: 'data'
  }
  emit('connection-add', connection)
})

onNodesChange((changes) => {
  changes.forEach(change => {
    if (change.type === 'position' && change.position) {
      emit('module-update', change.id, { 
        position: change.position 
      })
    } else if (change.type === 'remove') {
      emit('module-remove', change.id)
    }
  })
})

onEdgesChange((changes) => {
  changes.forEach(change => {
    if (change.type === 'remove') {
      emit('connection-remove', change.id)
    }
  })
})

onNodeClick((event) => {
  emit('element-select', event.node.id, event.event.ctrlKey || event.event.metaKey)
})

onEdgeClick((event) => {
  emit('element-select', event.edge.id, event.event.ctrlKey || event.event.metaKey)
})

onPaneClick(() => {
  emit('selection-clear')
})

// 拖拽处理
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  
  if (!event.dataTransfer) return
  
  try {
    const nodeType = event.dataTransfer.getData('application/node-type')
    const nodeData = JSON.parse(event.dataTransfer.getData('application/node-data'))
    
    const position = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY
    })
    
    const newModule: AdminModule = {
      id: `module_${Date.now()}`,
      name: nodeData.name || nodeType,
      displayName: nodeData.displayName || nodeType,
      type: nodeType as any,
      category: nodeData.category || 'processing',
      version: '1.0.0',
      config: nodeData.defaultConfig || {},
      position,
      size: { width: 200, height: 100 },
      status: 'inactive',
      connections: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    emit('module-add', newModule)
  } catch (error) {
    console.error('Failed to add module from drop:', error)
  }
}

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Delete' || event.key === 'Backspace') {
    // 删除选中的元素
    props.selectedElements.modules.forEach(moduleId => {
      emit('module-remove', moduleId)
    })
    props.selectedElements.connections.forEach(connectionId => {
      emit('connection-remove', connectionId)
    })
  }
}

// 组件挂载
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div 
    ref="vueFlowWrapper"
    class="workflow-canvas"
    @drop="handleDrop"
    @dragover="handleDragOver"
  >
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :fit-view-on-init="true"
      :nodes-draggable="true"
      :nodes-connectable="true"
      :elements-selectable="true"
      class="vue-flow-container"
    >
      <!-- 自定义节点模板 -->
      <template #node-admin-data-source="props">
        <DataSourceNode v-bind="props" />
      </template>
      
      <template #node-admin-data-processor="props">
        <DataProcessorNode v-bind="props" />
      </template>
      
      <template #node-admin-data-filter="props">
        <DataFilterNode v-bind="props" />
      </template>
      
      <template #node-admin-data-aggregator="props">
        <DataAggregatorNode v-bind="props" />
      </template>
      
      <template #node-admin-data-output="props">
        <DataOutputNode v-bind="props" />
      </template>
      
      <template #node-admin-monitor="props">
        <MonitorNode v-bind="props" />
      </template>
      
      <!-- 自定义连线模板 -->
      <template #edge-admin-data="props">
        <DataConnectionEdge v-bind="props" />
      </template>
      
      <template #edge-admin-control="props">
        <ControlConnectionEdge v-bind="props" />
      </template>
      
      <template #edge-admin-event="props">
        <EventConnectionEdge v-bind="props" />
      </template>
      
      <!-- 控制面板 -->
      <Panel position="top-right" class="workflow-controls">
        <div class="control-buttons">
          <button 
            class="control-button"
            title="适应视图"
            @click="fitView"
          >
            🎯
          </button>
          <button 
            class="control-button"
            title="重置缩放"
            @click="zoomTo(1)"
          >
            🔍
          </button>
          <button 
            class="control-button"
            title="全屏"
            @click="toggleFullscreen"
          >
            ⛶
          </button>
        </div>
      </Panel>
      
      <!-- 小地图 -->
      <MiniMap 
        position="bottom-right"
        :pannable="true"
        :zoomable="true"
        class="workflow-minimap"
      />
      
      <!-- 背景 -->
      <Background 
        pattern="dots"
        :gap="20"
        :size="1"
        class="workflow-background"
      />
    </VueFlow>
  </div>
</template>

<style scoped>
.workflow-canvas {
  width: 100%;
  height: 100%;
  position: relative;
}

.vue-flow-container {
  width: 100%;
  height: 100%;
}

.workflow-controls {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 8px;
}

.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background-color 0.2s;
}

.control-button:hover {
  background: #f3f4f6;
}

.workflow-minimap {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.workflow-background {
  background: #fafafa;
}

/* Vue Flow样式覆盖 */
:deep(.vue-flow__node) {
  cursor: pointer;
}

:deep(.vue-flow__node.selected) {
  box-shadow: 0 0 0 2px #3b82f6;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: #3b82f6;
  stroke-width: 3;
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  border: 2px solid white;
  background: #3b82f6;
}

:deep(.vue-flow__handle.source) {
  background: #10b981;
}

:deep(.vue-flow__handle.target) {
  background: #f59e0b;
}
</style>
```

---

## 🔗 数据绑定机制

### 双向数据绑定实现

#### Vue 3响应式系统集成
```typescript
// composables/useAdminDataBinding.ts
import { ref, computed, watch, watchEffect } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import type { AdminModule, ModuleConnection } from '@/types/admin'

export function useAdminDataBinding() {
  const { nodes, edges, onNodesChange, onEdgesChange } = useVueFlow()
  
  // 管理模块状态
  const modules = ref<AdminModule[]>([])
  const connections = ref<ModuleConnection[]>([])
  
  // 双向绑定：模块 ↔ Vue Flow节点
  watchEffect(() => {
    nodes.value = modules.value.map(module => ({
      id: module.id,
      type: `admin-${module.type}`,
      position: module.position,
      data: module
    }))
  })
  
  // 双向绑定：连接 ↔ Vue Flow边
  watchEffect(() => {
    edges.value = connections.value.map(connection => ({
      id: connection.id,
      source: connection.sourceId,
      target: connection.targetId,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: `admin-${connection.type}`,
      data: connection
    }))
  })
  
  // 监听Vue Flow变化并同步到模块状态
  onNodesChange((changes) => {
    changes.forEach(change => {
      if (change.type === 'position' && change.position) {
        const moduleIndex = modules.value.findIndex(m => m.id === change.id)
        if (moduleIndex !== -1) {
          modules.value[moduleIndex].position = change.position
        }
      }
    })
  })
  
  // 计算属性用于数据转换
  const modulesByType = computed(() => {
    return modules.value.reduce((acc, module) => {
      if (!acc[module.type]) acc[module.type] = []
      acc[module.type].push(module)
      return acc
    }, {} as Record<string, AdminModule[]>)
  })
  
  const connectionsByType = computed(() => {
    return connections.value.reduce((acc, connection) => {
      if (!acc[connection.type]) acc[connection.type] = []
      acc[connection.type].push(connection)
      return acc
    }, {} as Record<string, ModuleConnection[]>)
  })
  
  return {
    modules,
    connections,
    modulesByType,
    connectionsByType
  }
}
```

#### Store与组件的数据绑定
```vue
<!-- 组件中的数据绑定示例 -->
<script setup lang="ts">
import { computed, watch } from 'vue'
import { useWorkflowStore } from '@/stores/admin/workflows'
import { useAdminDataBinding } from '@/composables/useAdminDataBinding'

const workflowStore = useWorkflowStore()
const { modules, connections } = useAdminDataBinding()

// 响应式绑定Store数据到本地状态
watch(
  () => workflowStore.modules,
  (newModules) => {
    modules.value = [...newModules]
  },
  { deep: true, immediate: true }
)

watch(
  () => workflowStore.connections,
  (newConnections) => {
    connections.value = [...newConnections]
  },
  { deep: true, immediate: true }
)

// 本地变化同步回Store
watch(
  modules,
  (newModules) => {
    // 防止循环更新
    if (JSON.stringify(newModules) !== JSON.stringify(workflowStore.modules)) {
      workflowStore.updateModules(newModules)
    }
  },
  { deep: true }
)

// 计算属性用于UI状态
const isModified = computed(() => {
  return JSON.stringify(modules.value) !== JSON.stringify(workflowStore.modules) ||
         JSON.stringify(connections.value) !== JSON.stringify(workflowStore.connections)
})
</script>
```

### 表单数据绑定

#### 动态表单组件
```vue
<!-- components/admin/forms/DynamicForm.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormField, FormValue } from '@/types/admin/forms'

interface Props {
  fields: FormField[]
  modelValue: Record<string, any>
  validation?: Record<string, string[]>
}

const props = defineProps<Props>()

interface Emits {
  'update:modelValue': [value: Record<string, any>]
  'field-change': [fieldName: string, value: any]
  'validate': [fieldName: string]
}

const emit = defineEmits<Emits>()

// 本地表单状态
const formData = ref<Record<string, any>>({})
const errors = ref<Record<string, string[]>>({})

// 初始化表单数据
watch(
  () => props.modelValue,
  (newValue) => {
    formData.value = { ...newValue }
  },
  { immediate: true, deep: true }
)

// 字段变化处理
const handleFieldChange = (fieldName: string, value: any) => {
  formData.value[fieldName] = value
  emit('update:modelValue', { ...formData.value })
  emit('field-change', fieldName, value)
  
  // 清除该字段的错误
  if (errors.value[fieldName]) {
    delete errors.value[fieldName]
  }
}

// 字段验证
const validateField = (field: FormField, value: any): string[] => {
  const fieldErrors: string[] = []
  
  // 必填验证
  if (field.required && (value === null || value === undefined || value === '')) {
    fieldErrors.push(`${field.label}是必填项`)
  }
  
  // 类型验证
  if (value !== null && value !== undefined && value !== '') {
    switch (field.type) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          fieldErrors.push(`${field.label}格式不正确`)
        }
        break
      case 'number':
        if (isNaN(Number(value))) {
          fieldErrors.push(`${field.label}必须是数字`)
        }
        break
      case 'url':
        try {
          new URL(value)
        } catch {
          fieldErrors.push(`${field.label}必须是有效的URL`)
        }
        break
    }
  }
  
  // 自定义验证规则
  if (field.validation) {
    field.validation.forEach(rule => {
      if (!rule.validator(value)) {
        fieldErrors.push(rule.message)
      }
    })
  }
  
  return fieldErrors
}

// 表单验证
const validate = () => {
  const newErrors: Record<string, string[]> = {}
  
  props.fields.forEach(field => {
    const fieldErrors = validateField(field, formData.value[field.name])
    if (fieldErrors.length > 0) {
      newErrors[field.name] = fieldErrors
    }
  })
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// 暴露验证方法
defineExpose({
  validate,
  formData: readonly(formData),
  errors: readonly(errors)
})
</script>

<template>
  <form class="dynamic-form">
    <div 
      v-for="field in fields" 
      :key="field.name"
      class="form-field"
      :class="{ 'has-error': errors[field.name] }"
    >
      <label :for="field.name" class="field-label">
        {{ field.label }}
        <span v-if="field.required" class="required">*</span>
      </label>
      
      <!-- 文本输入 -->
      <input
        v-if="field.type === 'text' || field.type === 'email' || field.type === 'url'"
        :id="field.name"
        :type="field.type"
        :value="formData[field.name]"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
        @input="handleFieldChange(field.name, ($event.target as HTMLInputElement).value)"
        @blur="emit('validate', field.name)"
        class="field-input"
      />
      
      <!-- 数字输入 -->
      <input
        v-else-if="field.type === 'number'"
        :id="field.name"
        type="number"
        :value="formData[field.name]"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
        :min="field.min"
        :max="field.max"
        :step="field.step"
        @input="handleFieldChange(field.name, Number(($event.target as HTMLInputElement).value))"
        @blur="emit('validate', field.name)"
        class="field-input"
      />
      
      <!-- 文本域 -->
      <textarea
        v-else-if="field.type === 'textarea'"
        :id="field.name"
        :value="formData[field.name]"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
        :rows="field.rows || 3"
        @input="handleFieldChange(field.name, ($event.target as HTMLTextAreaElement).value)"
        @blur="emit('validate', field.name)"
        class="field-textarea"
      />
      
      <!-- 选择框 -->
      <select
        v-else-if="field.type === 'select'"
        :id="field.name"
        :value="formData[field.name]"
        :disabled="field.disabled"
        @change="handleFieldChange(field.name, ($event.target as HTMLSelectElement).value)"
        class="field-select"
      >
        <option value="">请选择...</option>
        <option 
          v-for="option in field.options" 
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      
      <!-- 复选框 -->
      <label
        v-else-if="field.type === 'checkbox'"
        class="field-checkbox-label"
      >
        <input
          :id="field.name"
          type="checkbox"
          :checked="formData[field.name]"
          :disabled="field.disabled"
          @change="handleFieldChange(field.name, ($event.target as HTMLInputElement).checked)"
          class="field-checkbox"
        />
        {{ field.checkboxLabel || field.label }}
      </label>
      
      <!-- 单选按钮组 -->
      <div v-else-if="field.type === 'radio'" class="field-radio-group">
        <label 
          v-for="option in field.options"
          :key="option.value"
          class="field-radio-label"
        >
          <input
            :name="field.name"
            type="radio"
            :value="option.value"
            :checked="formData[field.name] === option.value"
            :disabled="field.disabled"
            @change="handleFieldChange(field.name, option.value)"
            class="field-radio"
          />
          {{ option.label }}
        </label>
      </div>
      
      <!-- 字段描述 -->
      <div v-if="field.description" class="field-description">
        {{ field.description }}
      </div>
      
      <!-- 错误信息 -->
      <div v-if="errors[field.name]" class="field-errors">
        <div 
          v-for="error in errors[field.name]" 
          :key="error"
          class="field-error"
        >
          {{ error }}
        </div>
      </div>
    </div>
  </form>
</template>

<style scoped>
.dynamic-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.has-error .field-input,
.form-field.has-error .field-textarea,
.form-field.has-error .field-select {
  border-color: #ef4444;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #ef4444;
}

.field-input,
.field-textarea,
.field-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.field-input:focus,
.field-textarea:focus,
.field-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-textarea {
  resize: vertical;
  min-height: 80px;
}

.field-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.field-checkbox {
  width: 16px;
  height: 16px;
}

.field-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.field-radio {
  width: 16px;
  height: 16px;
}

.field-description {
  font-size: 12px;
  color: #6b7280;
}

.field-errors {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-error {
  font-size: 12px;
  color: #ef4444;
}
</style>
```

---

## 📋 架构实现检查清单

### Model层实现
- [ ] 定义完整的数据模型和类型
- [ ] 实现数据验证和转换器
- [ ] 创建API服务抽象层
- [ ] 添加错误处理机制
- [ ] 实现数据缓存策略

### ViewModel层实现
- [ ] 设计Pinia Store架构
- [ ] 实现响应式状态管理
- [ ] 添加计算属性和派生状态
- [ ] 处理异步操作和加载状态
- [ ] 实现状态持久化

### View层实现
- [ ] 创建组件层次结构
- [ ] 实现数据绑定机制
- [ ] 添加事件处理和用户交互
- [ ] 优化组件性能
- [ ] 实现响应式布局

### 数据绑定
- [ ] 实现双向数据绑定
- [ ] 处理表单数据绑定
- [ ] 添加数据验证
- [ ] 优化绑定性能
- [ ] 处理绑定错误

### 测试覆盖
- [ ] Model层单元测试
- [ ] ViewModel层状态测试
- [ ] View层组件测试
- [ ] 数据绑定集成测试
- [ ] E2E用户流程测试

这份MVVM架构设计文档为vue-flow后台管理系统提供了完整的架构指导，确保代码的可维护性、可测试性和可扩展性。
