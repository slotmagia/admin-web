import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  ResetPasswordData,
  ChangePasswordData,
  User
} from '@/types/auth'
import { MockAPI } from '@/mock/api'

// 使用Mock API替代真实的HTTP请求

export class AuthService {
  /**
   * 用户登录
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await MockAPI.Auth.login(credentials)
      
      // 存储认证信息
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('refresh_token', response.refreshToken)
      localStorage.setItem('user_info', JSON.stringify(response.user))
      
      // 设置token过期时间
      const expiresAt = Date.now() + response.expiresIn * 1000
      localStorage.setItem('token_expires_at', expiresAt.toString())
      
      return response
    } catch (error: any) {
      throw new Error(error.message || '登录失败')
    }
  }

  /**
   * 用户注册
   */
  static async register(userData: RegisterData): Promise<User> {
    try {
      // Mock注册功能 - 实际项目中应该调用真实API
      throw new Error('注册功能暂未开放')
    } catch (error: any) {
      throw new Error(error.message || '注册失败')
    }
  }

  /**
   * 用户登出
   */
  static async logout(): Promise<void> {
    try {
      await MockAPI.Auth.logout()
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      // 清除本地存储
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_info')
      localStorage.removeItem('token_expires_at')
    }
  }

  /**
   * 刷新token
   */
  static async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await MockAPI.Auth.refreshToken()
      
      localStorage.setItem('auth_token', response.token)
      const expiresAt = Date.now() + response.expiresIn * 1000
      localStorage.setItem('token_expires_at', expiresAt.toString())
      
      return response.token
    } catch (error: any) {
      throw new Error(error.message || 'Token刷新失败')
    }
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const user = await MockAPI.Auth.getCurrentUser()
      
      // 更新本地存储的用户信息
      localStorage.setItem('user_info', JSON.stringify(user))
      return user
    } catch (error: any) {
      throw new Error(error.message || '获取用户信息失败')
    }
  }

  /**
   * 重置密码
   */
  static async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      // Mock重置密码功能
      throw new Error('重置密码功能暂未开放')
    } catch (error: any) {
      throw new Error(error.message || '重置密码失败')
    }
  }

  /**
   * 修改密码
   */
  static async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await MockAPI.Auth.changePassword(data)
    } catch (error: any) {
      throw new Error(error.message || '修改密码失败')
    }
  }

  /**
   * 检查token是否有效
   */
  static isTokenValid(): boolean {
    const token = localStorage.getItem('auth_token')
    const expiresAt = localStorage.getItem('token_expires_at')
    
    if (!token || !expiresAt) {
      return false
    }
    
    return Date.now() < parseInt(expiresAt)
  }

  /**
   * 获取本地存储的用户信息
   */
  static getStoredUser(): User | null {
    try {
      const userInfo = localStorage.getItem('user_info')
      return userInfo ? JSON.parse(userInfo) : null
    } catch (error) {
      console.error('Failed to parse stored user info:', error)
      return null
    }
  }

  /**
   * 检查用户权限
   */
  static hasPermission(user: User | null, resource: string, action: string): boolean {
    if (!user) return false
    
    // 超级管理员拥有所有权限
    if (user.role === 'super_admin') return true
    
    // 检查具体权限
    return user.permissions.some(permission => 
      permission.resource === resource && permission.action === action
    )
  }

  /**
   * 检查用户角色
   */
  static hasRole(user: User | null, role: string): boolean {
    if (!user) return false
    return user.role === role
  }
}

export default AuthService
