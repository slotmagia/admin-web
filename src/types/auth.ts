// 认证相关类型定义
export interface User {
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
}

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer'
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending'

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

// 登录相关
export interface LoginCredentials {
  username: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

export interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstName?: string
  lastName?: string
}

export interface ResetPasswordData {
  email: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// JWT Token
export interface JWTPayload {
  sub: string // user id
  username: string
  email: string
  role: UserRole
  permissions: string[]
  iat: number
  exp: number
}

// 认证状态
export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// API响应
export interface AuthResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
