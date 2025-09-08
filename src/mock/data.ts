// Mock数据系统
import type { User, AdminUser, AdminStats, SystemNotification } from '@/types/auth'

// 用户Mock数据
export const mockUsers: AdminUser[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    firstName: '系统',
    lastName: '管理员',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff',
    role: 'super_admin',
    status: 'active',
    lastLoginAt: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '2',
    username: 'editor',
    email: 'editor@example.com',
    firstName: '内容',
    lastName: '编辑',
    avatar: 'https://ui-avatars.com/api/?name=Editor&background=10b981&color=fff',
    role: 'editor',
    status: 'active',
    lastLoginAt: new Date(Date.now() - 3600000),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: '3',
    username: 'viewer',
    email: 'viewer@example.com',
    firstName: '访客',
    lastName: '用户',
    avatar: 'https://ui-avatars.com/api/?name=Viewer&background=f59e0b&color=fff',
    role: 'viewer',
    status: 'active',
    lastLoginAt: new Date(Date.now() - 7200000),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date()
  },
  {
    id: '4',
    username: 'john_doe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=8b5cf6&color=fff',
    role: 'editor',
    status: 'active',
    lastLoginAt: new Date(Date.now() - 86400000),
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date()
  },
  {
    id: '5',
    username: 'jane_smith',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=ef4444&color=fff',
    role: 'viewer',
    status: 'inactive',
    lastLoginAt: new Date(Date.now() - 172800000),
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date()
  },
  {
    id: '6',
    username: 'mike_wilson',
    email: 'mike.wilson@example.com',
    firstName: 'Mike',
    lastName: 'Wilson',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Wilson&background=06b6d4&color=fff',
    role: 'editor',
    status: 'suspended',
    lastLoginAt: new Date(Date.now() - 259200000),
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date()
  }
]

// 系统统计Mock数据
export const mockStats: AdminStats = {
  totalUsers: 156,
  activeUsers: 142,
  totalWorkflows: 89,
  runningWorkflows: 12,
  totalExecutions: 2456,
  successfulExecutions: 2234,
  failedExecutions: 222,
  systemLoad: 45,
  memoryUsage: 68,
  diskUsage: 72
}

// 系统通知Mock数据
export const mockNotifications: SystemNotification[] = [
  {
    id: '1',
    type: 'warning',
    title: '系统负载较高',
    message: '当前系统负载为78%，建议检查运行中的工作流',
    timestamp: new Date(Date.now() - 1800000),
    read: false,
    actions: [
      { label: '查看详情', action: 'view_system_monitor' },
      { label: '优化系统', action: 'optimize_system' }
    ]
  },
  {
    id: '2',
    type: 'info',
    title: '新用户注册',
    message: '有3个新用户完成注册，等待审核',
    timestamp: new Date(Date.now() - 3600000),
    read: false,
    actions: [
      { label: '审核用户', action: 'review_users' }
    ]
  },
  {
    id: '3',
    type: 'success',
    title: '系统更新完成',
    message: '系统已成功更新到v2.1.0版本',
    timestamp: new Date(Date.now() - 7200000),
    read: true
  },
  {
    id: '4',
    type: 'error',
    title: '工作流执行失败',
    message: '工作流"数据处理任务"执行失败，请检查配置',
    timestamp: new Date(Date.now() - 10800000),
    read: false,
    actions: [
      { label: '查看日志', action: 'view_logs' },
      { label: '重新执行', action: 'retry_workflow' }
    ]
  },
  {
    id: '5',
    type: 'info',
    title: '定期备份完成',
    message: '系统数据已成功备份到云存储',
    timestamp: new Date(Date.now() - 14400000),
    read: true
  }
]

// 工作流Mock数据
export interface MockWorkflow {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'running' | 'error'
  creator: string
  createdAt: Date
  updatedAt: Date
  lastExecuted?: Date
  executionCount: number
  successRate: number
  tags: string[]
}

export const mockWorkflows: MockWorkflow[] = [
  {
    id: '1',
    name: 'AI文本分析流程',
    description: '使用AI模型对文本进行情感分析和关键词提取',
    status: 'active',
    creator: 'admin',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-01'),
    lastExecuted: new Date(Date.now() - 3600000),
    executionCount: 156,
    successRate: 94.2,
    tags: ['AI', '文本分析', '自动化']
  },
  {
    id: '2',
    name: '数据清洗管道',
    description: '自动清洗和标准化CSV数据文件',
    status: 'running',
    creator: 'editor',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-05'),
    lastExecuted: new Date(Date.now() - 1800000),
    executionCount: 89,
    successRate: 98.9,
    tags: ['数据处理', '清洗', 'CSV']
  },
  {
    id: '3',
    name: '图像识别批处理',
    description: '批量处理图像并进行物体识别',
    status: 'active',
    creator: 'admin',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-28'),
    lastExecuted: new Date(Date.now() - 7200000),
    executionCount: 45,
    successRate: 87.8,
    tags: ['图像处理', 'AI', '批处理']
  },
  {
    id: '4',
    name: '邮件自动回复',
    description: '根据邮件内容自动生成回复',
    status: 'error',
    creator: 'editor',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-10'),
    lastExecuted: new Date(Date.now() - 14400000),
    executionCount: 23,
    successRate: 65.2,
    tags: ['邮件', '自动回复', 'NLP']
  },
  {
    id: '5',
    name: '报表生成器',
    description: '定期生成业务数据报表',
    status: 'active',
    creator: 'admin',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-03-08'),
    lastExecuted: new Date(Date.now() - 21600000),
    executionCount: 234,
    successRate: 99.1,
    tags: ['报表', '数据分析', '定时任务']
  }
]

// 系统日志Mock数据
export interface MockSystemLog {
  id: string
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  timestamp: Date
  source: string
  userId?: string
  details?: Record<string, any>
}

export const mockSystemLogs: MockSystemLog[] = [
  {
    id: '1',
    level: 'info',
    message: '用户登录成功',
    timestamp: new Date(Date.now() - 300000),
    source: 'auth.service',
    userId: '2',
    details: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0...' }
  },
  {
    id: '2',
    level: 'warning',
    message: '系统负载超过阈值',
    timestamp: new Date(Date.now() - 600000),
    source: 'system.monitor',
    details: { load: 78.5, threshold: 75 }
  },
  {
    id: '3',
    level: 'error',
    message: '工作流执行失败',
    timestamp: new Date(Date.now() - 900000),
    source: 'workflow.engine',
    userId: '1',
    details: { workflowId: '4', error: 'Connection timeout' }
  },
  {
    id: '4',
    level: 'info',
    message: '数据备份完成',
    timestamp: new Date(Date.now() - 1200000),
    source: 'backup.service',
    details: { size: '2.3GB', duration: '45s' }
  },
  {
    id: '5',
    level: 'debug',
    message: 'API请求处理',
    timestamp: new Date(Date.now() - 1500000),
    source: 'api.gateway',
    details: { endpoint: '/api/users', method: 'GET', responseTime: '120ms' }
  }
]

// 角色权限Mock数据
export interface MockRole {
  id: string
  name: string
  displayName: string
  description: string
  permissions: string[]
  userCount: number
  createdAt: Date
  updatedAt: Date
}

export const mockRoles: MockRole[] = [
  {
    id: '1',
    name: 'super_admin',
    displayName: '超级管理员',
    description: '拥有系统所有权限',
    permissions: ['*'],
    userCount: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'admin',
    displayName: '管理员',
    description: '拥有大部分管理权限',
    permissions: [
      'users:read', 'users:create', 'users:update', 'users:delete',
      'workflows:read', 'workflows:create', 'workflows:update', 'workflows:delete',
      'monitoring:read', 'settings:read', 'settings:update'
    ],
    userCount: 2,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: '3',
    name: 'editor',
    displayName: '编辑者',
    description: '可以创建和编辑工作流',
    permissions: [
      'workflows:read', 'workflows:create', 'workflows:update',
      'monitoring:read'
    ],
    userCount: 3,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-20')
  },
  {
    id: '4',
    name: 'viewer',
    displayName: '查看者',
    description: '只能查看数据，无编辑权限',
    permissions: [
      'workflows:read', 'monitoring:read'
    ],
    userCount: 2,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-25')
  }
]

// 系统设置Mock数据
export const mockSettings = {
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
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    username: 'noreply@example.com',
    password: '********'
  },
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    darkMode: false
  },
  security: {
    sessionTimeout: 3600,
    maxLoginAttempts: 5,
    passwordMinLength: 6,
    requireStrongPassword: false
  }
}

// 模拟API延迟
export const mockDelay = (min = 300, max = 1000) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise(resolve => setTimeout(resolve, delay))
}

// 模拟API错误
export const mockError = (probability = 0.1) => {
  if (Math.random() < probability) {
    throw new Error('模拟网络错误')
  }
}

// 生成随机ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// 分页工具函数
export const paginate = <T>(data: T[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  
  return {
    data: data.slice(startIndex, endIndex),
    total: data.length,
    page,
    limit,
    totalPages: Math.ceil(data.length / limit)
  }
}

// 搜索工具函数
export const searchData = <T>(data: T[], query: string, fields: (keyof T)[]) => {
  if (!query) return data
  
  const lowerQuery = query.toLowerCase()
  return data.filter(item => 
    fields.some(field => {
      const value = item[field]
      return value && String(value).toLowerCase().includes(lowerQuery)
    })
  )
}

// 排序工具函数
export const sortData = <T>(data: T[], field: keyof T, order: 'asc' | 'desc' = 'asc') => {
  return [...data].sort((a, b) => {
    const aValue = a[field]
    const bValue = b[field]
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1
    if (aValue > bValue) return order === 'asc' ? 1 : -1
    return 0
  })
}
