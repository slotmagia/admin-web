import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { MockAPI } from '@/mock/api'

// 管理员相关类型
export interface AdminUser {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  role: string
  status: 'active' | 'inactive' | 'suspended'
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalWorkflows: number
  runningWorkflows: number
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  systemLoad: number
  memoryUsage: number
  diskUsage: number
}

export interface SystemNotification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actions?: Array<{
    label: string
    action: string
    variant?: 'primary' | 'secondary' | 'danger'
  }>
}

export interface AdminSettings {
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailVerificationRequired: boolean
  maxWorkflowsPerUser: number
  maxExecutionTime: number
  allowedFileTypes: string[]
  maxFileSize: number
  smtpSettings: {
    host: string
    port: number
    secure: boolean
    username: string
    password: string
  }
}

export const useAdminStore = defineStore('admin', () => {
  // ===== 状态定义 =====
  const users = ref<AdminUser[]>([])
  const stats = ref<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalWorkflows: 0,
    runningWorkflows: 0,
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    systemLoad: 0,
    memoryUsage: 0,
    diskUsage: 0
  })
  const notifications = ref<SystemNotification[]>([])
  const settings = ref<AdminSettings>({
    siteName: 'AI工作流管理系统',
    siteDescription: '基于Vue-Flow的智能工作流管理平台',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: false,
    maxWorkflowsPerUser: 10,
    maxExecutionTime: 3600,
    allowedFileTypes: ['.json', '.csv', '.txt', '.pdf'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    smtpSettings: {
      host: '',
      port: 587,
      secure: false,
      username: '',
      password: ''
    }
  })
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ===== 计算属性 =====
  const activeUsers = computed(() => 
    users.value.filter(user => user.status === 'active')
  )

  const suspendedUsers = computed(() => 
    users.value.filter(user => user.status === 'suspended')
  )

  const unreadNotifications = computed(() => 
    notifications.value.filter(notification => !notification.read)
  )

  const unreadNotificationCount = computed(() => 
    unreadNotifications.value.length
  )

  const systemHealthStatus = computed(() => {
    const { systemLoad, memoryUsage, diskUsage } = stats.value
    
    if (systemLoad > 80 || memoryUsage > 90 || diskUsage > 95) {
      return 'critical'
    } else if (systemLoad > 60 || memoryUsage > 75 || diskUsage > 85) {
      return 'warning'
    } else {
      return 'healthy'
    }
  })

  const workflowSuccessRate = computed(() => {
    const { totalExecutions, successfulExecutions } = stats.value
    if (totalExecutions === 0) return 0
    return Math.round((successfulExecutions / totalExecutions) * 100)
  })

  // ===== Actions =====

  /**
   * 获取用户列表
   */
  const fetchUsers = async (params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: string
  }) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await MockAPI.User.getUsers(params)
      users.value = response.data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取系统统计信息
   */
  const fetchStats = async () => {
    isLoading.value = true
    error.value = null

    try {
      const statsData = await MockAPI.Stats.getStats()
      stats.value = statsData
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取系统通知
   */
  const fetchNotifications = async () => {
    try {
      const response = await MockAPI.Notification.getNotifications()
      notifications.value = response.data
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  /**
   * 标记通知为已读
   */
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await MockAPI.Notification.markAsRead(notificationId)
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }
    } catch (err: any) {
      error.value = err.message
    }
  }

  /**
   * 标记所有通知为已读
   */
  const markAllNotificationsAsRead = async () => {
    try {
      await MockAPI.Notification.markAllAsRead()
      notifications.value.forEach(notification => {
        notification.read = true
      })
    } catch (err: any) {
      error.value = err.message
    }
  }

  /**
   * 删除通知
   */
  const deleteNotification = async (notificationId: string) => {
    try {
      await MockAPI.Notification.deleteNotification(notificationId)
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index > -1) {
        notifications.value.splice(index, 1)
      }
    } catch (err: any) {
      error.value = err.message
    }
  }

  /**
   * 更新用户状态
   */
  const updateUserStatus = async (userId: string, status: AdminUser['status']) => {
    isLoading.value = true
    error.value = null

    try {
      await MockAPI.User.updateUser(userId, { status })
      const user = users.value.find(u => u.id === userId)
      if (user) {
        user.status = status
        user.updatedAt = new Date()
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 删除用户
   */
  const deleteUser = async (userId: string) => {
    isLoading.value = true
    error.value = null

    try {
      await MockAPI.User.deleteUser(userId)
      const index = users.value.findIndex(u => u.id === userId)
      if (index > -1) {
        users.value.splice(index, 1)
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取系统设置
   */
  const fetchSettings = async () => {
    isLoading.value = true
    error.value = null

    try {
      const settingsData = await MockAPI.Settings.getSettings()
      settings.value = settingsData
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新系统设置
   */
  const updateSettings = async (newSettings: Partial<AdminSettings>) => {
    isLoading.value = true
    error.value = null

    try {
      const updatedSettings = await MockAPI.Settings.updateSettings(newSettings)
      settings.value = updatedSettings
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 执行系统维护
   */
  const performMaintenance = async (action: 'restart' | 'cleanup' | 'backup') => {
    isLoading.value = true
    error.value = null

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 根据不同的维护操作执行相应逻辑
      switch (action) {
        case 'restart':
          // 重启系统逻辑
          break
        case 'cleanup':
          // 清理系统逻辑
          break
        case 'backup':
          // 备份系统逻辑
          break
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 清除错误
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 重置状态
   */
  const reset = () => {
    users.value = []
    stats.value = {
      totalUsers: 0,
      activeUsers: 0,
      totalWorkflows: 0,
      runningWorkflows: 0,
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      systemLoad: 0,
      memoryUsage: 0,
      diskUsage: 0
    }
    notifications.value = []
    isLoading.value = false
    error.value = null
  }

  // ===== 返回API =====
  return {
    // 只读状态
    users: readonly(users),
    stats: readonly(stats),
    notifications: readonly(notifications),
    settings: readonly(settings),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // 计算属性
    activeUsers,
    suspendedUsers,
    unreadNotifications,
    unreadNotificationCount,
    systemHealthStatus,
    workflowSuccessRate,

    // 方法
    fetchUsers,
    fetchStats,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    updateUserStatus,
    deleteUser,
    fetchSettings,
    updateSettings,
    performMaintenance,
    clearError,
    reset
  }
}, {
  persist: {
    key: 'admin-store',
    storage: localStorage,
    paths: ['settings']
  }
})
