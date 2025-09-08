// Mock API服务
import type { LoginCredentials, LoginResponse, User } from '@/types/auth'
import { 
  mockUsers, 
  mockStats, 
  mockNotifications, 
  mockWorkflows,
  mockSystemLogs,
  mockRoles,
  mockSettings,
  mockDelay,
  mockError,
  generateId,
  paginate,
  searchData,
  sortData
} from './data'

// 存储当前登录用户
let currentUser: User | null = null

// 认证API
export class MockAuthAPI {
  /**
   * 用户登录
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    await mockDelay(800, 1500)
    mockError(0.05) // 5%的错误概率
    
    // 查找用户
    const user = mockUsers.find(u => u.username === credentials.username)
    
    if (!user) {
      throw new Error('用户名不存在')
    }
    
    // 简单的密码验证（实际项目中应该使用加密）
    const validPasswords: Record<string, string> = {
      'admin': 'admin123',
      'editor': 'editor123',
      'viewer': 'viewer123',
      'john_doe': 'password123',
      'jane_smith': 'password123',
      'mike_wilson': 'password123'
    }
    
    if (validPasswords[user.username] !== credentials.password) {
      throw new Error('密码错误')
    }
    
    if (user.status !== 'active') {
      throw new Error('账户已被禁用')
    }
    
    // 更新最后登录时间
    user.lastLoginAt = new Date()
    currentUser = user
    
    // 生成模拟token
    const token = `mock_token_${user.id}_${Date.now()}`
    const refreshToken = `mock_refresh_${user.id}_${Date.now()}`
    
    return {
      user,
      token,
      refreshToken,
      expiresIn: 3600 // 1小时
    }
  }
  
  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(): Promise<User> {
    await mockDelay(200, 500)
    mockError(0.02)
    
    if (!currentUser) {
      throw new Error('用户未登录')
    }
    
    return currentUser
  }
  
  /**
   * 刷新token
   */
  static async refreshToken(): Promise<{ token: string; expiresIn: number }> {
    await mockDelay(300, 600)
    mockError(0.03)
    
    if (!currentUser) {
      throw new Error('用户未登录')
    }
    
    return {
      token: `mock_token_${currentUser.id}_${Date.now()}`,
      expiresIn: 3600
    }
  }
  
  /**
   * 用户登出
   */
  static async logout(): Promise<void> {
    await mockDelay(200, 400)
    currentUser = null
  }
  
  /**
   * 修改密码
   */
  static async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await mockDelay(500, 1000)
    mockError(0.05)
    
    if (!currentUser) {
      throw new Error('用户未登录')
    }
    
    // 模拟密码验证和更新
    console.log('密码已更新', data)
  }
}

// 用户管理API
export class MockUserAPI {
  /**
   * 获取用户列表
   */
  static async getUsers(params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{
    data: typeof mockUsers
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    await mockDelay(400, 800)
    mockError(0.03)
    
    let filteredUsers = [...mockUsers]
    
    // 搜索过滤
    if (params?.search) {
      filteredUsers = searchData(filteredUsers, params.search, ['username', 'email', 'firstName', 'lastName'])
    }
    
    // 角色过滤
    if (params?.role) {
      filteredUsers = filteredUsers.filter(user => user.role === params.role)
    }
    
    // 状态过滤
    if (params?.status) {
      filteredUsers = filteredUsers.filter(user => user.status === params.status)
    }
    
    // 排序
    if (params?.sortBy) {
      filteredUsers = sortData(filteredUsers, params.sortBy as keyof typeof mockUsers[0], params.sortOrder)
    }
    
    // 分页
    const page = params?.page || 1
    const limit = params?.limit || 10
    
    return paginate(filteredUsers, page, limit)
  }
  
  /**
   * 获取用户详情
   */
  static async getUser(id: string): Promise<typeof mockUsers[0]> {
    await mockDelay(200, 400)
    mockError(0.02)
    
    const user = mockUsers.find(u => u.id === id)
    if (!user) {
      throw new Error('用户不存在')
    }
    
    return user
  }
  
  /**
   * 创建用户
   */
  static async createUser(userData: Partial<typeof mockUsers[0]>): Promise<typeof mockUsers[0]> {
    await mockDelay(600, 1200)
    mockError(0.05)
    
    const newUser = {
      id: generateId(),
      username: userData.username || '',
      email: userData.email || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=3b82f6&color=fff`,
      role: userData.role || 'viewer',
      status: userData.status || 'active',
      lastLoginAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    } as typeof mockUsers[0]
    
    mockUsers.push(newUser)
    return newUser
  }
  
  /**
   * 更新用户
   */
  static async updateUser(id: string, userData: Partial<typeof mockUsers[0]>): Promise<typeof mockUsers[0]> {
    await mockDelay(500, 1000)
    mockError(0.04)
    
    const userIndex = mockUsers.findIndex(u => u.id === id)
    if (userIndex === -1) {
      throw new Error('用户不存在')
    }
    
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...userData,
      updatedAt: new Date()
    }
    
    return mockUsers[userIndex]
  }
  
  /**
   * 删除用户
   */
  static async deleteUser(id: string): Promise<void> {
    await mockDelay(400, 800)
    mockError(0.03)
    
    const userIndex = mockUsers.findIndex(u => u.id === id)
    if (userIndex === -1) {
      throw new Error('用户不存在')
    }
    
    mockUsers.splice(userIndex, 1)
  }
}

// 系统统计API
export class MockStatsAPI {
  /**
   * 获取系统统计
   */
  static async getStats(): Promise<typeof mockStats> {
    await mockDelay(300, 600)
    mockError(0.02)
    
    // 动态更新一些数据
    const stats = { ...mockStats }
    stats.systemLoad = Math.floor(Math.random() * 40) + 30 // 30-70%
    stats.memoryUsage = Math.floor(Math.random() * 30) + 50 // 50-80%
    stats.diskUsage = Math.floor(Math.random() * 20) + 60 // 60-80%
    stats.runningWorkflows = Math.floor(Math.random() * 10) + 5 // 5-15
    
    return stats
  }
  
  /**
   * 获取实时监控数据
   */
  static async getMonitoringData(): Promise<{
    cpu: number[]
    memory: number[]
    disk: number[]
    network: number[]
    timestamps: string[]
  }> {
    await mockDelay(200, 400)
    mockError(0.02)
    
    // 生成最近24小时的模拟数据
    const hours = 24
    const data = {
      cpu: [] as number[],
      memory: [] as number[],
      disk: [] as number[],
      network: [] as number[],
      timestamps: [] as string[]
    }
    
    for (let i = hours - 1; i >= 0; i--) {
      const time = new Date(Date.now() - i * 3600000)
      data.timestamps.push(time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
      data.cpu.push(Math.floor(Math.random() * 40) + 30)
      data.memory.push(Math.floor(Math.random() * 30) + 50)
      data.disk.push(Math.floor(Math.random() * 20) + 60)
      data.network.push(Math.floor(Math.random() * 100) + 10)
    }
    
    return data
  }
}

// 通知API
export class MockNotificationAPI {
  /**
   * 获取通知列表
   */
  static async getNotifications(params?: {
    page?: number
    limit?: number
    unreadOnly?: boolean
  }): Promise<{
    data: typeof mockNotifications
    total: number
    unreadCount: number
  }> {
    await mockDelay(200, 500)
    mockError(0.02)
    
    let notifications = [...mockNotifications]
    
    if (params?.unreadOnly) {
      notifications = notifications.filter(n => !n.read)
    }
    
    const page = params?.page || 1
    const limit = params?.limit || 10
    const paginatedData = paginate(notifications, page, limit)
    
    return {
      ...paginatedData,
      unreadCount: mockNotifications.filter(n => !n.read).length
    }
  }
  
  /**
   * 标记通知为已读
   */
  static async markAsRead(id: string): Promise<void> {
    await mockDelay(100, 300)
    mockError(0.01)
    
    const notification = mockNotifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }
  
  /**
   * 标记所有通知为已读
   */
  static async markAllAsRead(): Promise<void> {
    await mockDelay(200, 500)
    mockError(0.02)
    
    mockNotifications.forEach(n => n.read = true)
  }
  
  /**
   * 删除通知
   */
  static async deleteNotification(id: string): Promise<void> {
    await mockDelay(100, 300)
    mockError(0.01)
    
    const index = mockNotifications.findIndex(n => n.id === id)
    if (index > -1) {
      mockNotifications.splice(index, 1)
    }
  }
}

// 工作流API
export class MockWorkflowAPI {
  /**
   * 获取工作流列表
   */
  static async getWorkflows(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    creator?: string
  }): Promise<{
    data: typeof mockWorkflows
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    await mockDelay(400, 800)
    mockError(0.03)
    
    let workflows = [...mockWorkflows]
    
    // 搜索过滤
    if (params?.search) {
      workflows = searchData(workflows, params.search, ['name', 'description', 'creator'])
    }
    
    // 状态过滤
    if (params?.status) {
      workflows = workflows.filter(w => w.status === params.status)
    }
    
    // 创建者过滤
    if (params?.creator) {
      workflows = workflows.filter(w => w.creator === params.creator)
    }
    
    const page = params?.page || 1
    const limit = params?.limit || 10
    
    return paginate(workflows, page, limit)
  }
  
  /**
   * 获取工作流详情
   */
  static async getWorkflow(id: string): Promise<typeof mockWorkflows[0]> {
    await mockDelay(200, 400)
    mockError(0.02)
    
    const workflow = mockWorkflows.find(w => w.id === id)
    if (!workflow) {
      throw new Error('工作流不存在')
    }
    
    return workflow
  }
  
  /**
   * 创建工作流
   */
  static async createWorkflow(workflowData: Partial<typeof mockWorkflows[0]>): Promise<typeof mockWorkflows[0]> {
    await mockDelay(600, 1200)
    mockError(0.05)
    
    const newWorkflow = {
      id: generateId(),
      name: workflowData.name || '新工作流',
      description: workflowData.description || '',
      status: 'inactive',
      creator: currentUser?.username || 'unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0,
      successRate: 0,
      tags: workflowData.tags || []
    } as typeof mockWorkflows[0]
    
    mockWorkflows.push(newWorkflow)
    return newWorkflow
  }
  
  /**
   * 更新工作流
   */
  static async updateWorkflow(id: string, workflowData: Partial<typeof mockWorkflows[0]>): Promise<typeof mockWorkflows[0]> {
    await mockDelay(500, 1000)
    mockError(0.04)
    
    const workflowIndex = mockWorkflows.findIndex(w => w.id === id)
    if (workflowIndex === -1) {
      throw new Error('工作流不存在')
    }
    
    mockWorkflows[workflowIndex] = {
      ...mockWorkflows[workflowIndex],
      ...workflowData,
      updatedAt: new Date()
    }
    
    return mockWorkflows[workflowIndex]
  }
  
  /**
   * 删除工作流
   */
  static async deleteWorkflow(id: string): Promise<void> {
    await mockDelay(400, 800)
    mockError(0.03)
    
    const workflowIndex = mockWorkflows.findIndex(w => w.id === id)
    if (workflowIndex === -1) {
      throw new Error('工作流不存在')
    }
    
    mockWorkflows.splice(workflowIndex, 1)
  }
  
  /**
   * 执行工作流
   */
  static async executeWorkflow(id: string): Promise<{ executionId: string; status: string }> {
    await mockDelay(1000, 2000)
    mockError(0.1) // 10%的执行失败率
    
    const workflow = mockWorkflows.find(w => w.id === id)
    if (!workflow) {
      throw new Error('工作流不存在')
    }
    
    // 更新执行统计
    workflow.executionCount++
    workflow.lastExecuted = new Date()
    
    return {
      executionId: generateId(),
      status: 'running'
    }
  }
}

// 系统设置API
export class MockSettingsAPI {
  /**
   * 获取系统设置
   */
  static async getSettings(): Promise<typeof mockSettings> {
    await mockDelay(200, 500)
    mockError(0.02)
    
    return { ...mockSettings }
  }
  
  /**
   * 更新系统设置
   */
  static async updateSettings(settings: Partial<typeof mockSettings>): Promise<typeof mockSettings> {
    await mockDelay(500, 1000)
    mockError(0.04)
    
    Object.assign(mockSettings, settings)
    return { ...mockSettings }
  }
}

// 角色权限API
export class MockRoleAPI {
  /**
   * 获取角色列表
   */
  static async getRoles(): Promise<typeof mockRoles> {
    await mockDelay(200, 500)
    mockError(0.02)
    
    return [...mockRoles]
  }
  
  /**
   * 创建角色
   */
  static async createRole(roleData: Partial<typeof mockRoles[0]>): Promise<typeof mockRoles[0]> {
    await mockDelay(500, 1000)
    mockError(0.05)
    
    const newRole = {
      id: generateId(),
      name: roleData.name || '',
      displayName: roleData.displayName || '',
      description: roleData.description || '',
      permissions: roleData.permissions || [],
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    } as typeof mockRoles[0]
    
    mockRoles.push(newRole)
    return newRole
  }
  
  /**
   * 更新角色
   */
  static async updateRole(id: string, roleData: Partial<typeof mockRoles[0]>): Promise<typeof mockRoles[0]> {
    await mockDelay(400, 800)
    mockError(0.04)
    
    const roleIndex = mockRoles.findIndex(r => r.id === id)
    if (roleIndex === -1) {
      throw new Error('角色不存在')
    }
    
    mockRoles[roleIndex] = {
      ...mockRoles[roleIndex],
      ...roleData,
      updatedAt: new Date()
    }
    
    return mockRoles[roleIndex]
  }
  
  /**
   * 删除角色
   */
  static async deleteRole(id: string): Promise<void> {
    await mockDelay(300, 600)
    mockError(0.03)
    
    const roleIndex = mockRoles.findIndex(r => r.id === id)
    if (roleIndex === -1) {
      throw new Error('角色不存在')
    }
    
    if (mockRoles[roleIndex].userCount > 0) {
      throw new Error('该角色下还有用户，无法删除')
    }
    
    mockRoles.splice(roleIndex, 1)
  }
}

// 系统日志API
export class MockLogAPI {
  /**
   * 获取系统日志
   */
  static async getLogs(params?: {
    page?: number
    limit?: number
    level?: string
    source?: string
    startDate?: string
    endDate?: string
  }): Promise<{
    data: typeof mockSystemLogs
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    await mockDelay(300, 600)
    mockError(0.02)
    
    let logs = [...mockSystemLogs]
    
    // 级别过滤
    if (params?.level) {
      logs = logs.filter(log => log.level === params.level)
    }
    
    // 来源过滤
    if (params?.source) {
      logs = logs.filter(log => log.source.includes(params.source!))
    }
    
    // 时间范围过滤
    if (params?.startDate) {
      const startDate = new Date(params.startDate)
      logs = logs.filter(log => log.timestamp >= startDate)
    }
    
    if (params?.endDate) {
      const endDate = new Date(params.endDate)
      logs = logs.filter(log => log.timestamp <= endDate)
    }
    
    // 按时间倒序排列
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    
    const page = params?.page || 1
    const limit = params?.limit || 20
    
    return paginate(logs, page, limit)
  }
}

// 导出所有Mock API
export const MockAPI = {
  Auth: MockAuthAPI,
  User: MockUserAPI,
  Stats: MockStatsAPI,
  Notification: MockNotificationAPI,
  Workflow: MockWorkflowAPI,
  Settings: MockSettingsAPI,
  Role: MockRoleAPI,
  Log: MockLogAPI
}
