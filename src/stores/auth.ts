import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type {
  User,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  ChangePasswordData,
  AuthState
} from '@/types/auth'
import AuthService from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
  // ===== 状态定义 =====
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ===== 计算属性 =====
  const isAuthenticated = computed(() => {
    return !!user.value && !!token.value && AuthService.isTokenValid()
  })

  const userRole = computed(() => user.value?.role || null)

  const userPermissions = computed(() => user.value?.permissions || [])

  const userName = computed(() => {
    if (!user.value) return ''
    const { firstName, lastName, username } = user.value
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    }
    return username
  })

  const userAvatar = computed(() => {
    return user.value?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.value)}&background=3b82f6&color=fff`
  })

  // ===== Actions =====

  /**
   * 初始化认证状态
   */
  const initializeAuth = async () => {
    isLoading.value = true
    error.value = null

    try {
      // 从本地存储恢复状态
      const storedToken = localStorage.getItem('auth_token')
      const storedRefreshToken = localStorage.getItem('refresh_token')
      const storedUser = AuthService.getStoredUser()

      if (storedToken && storedUser && AuthService.isTokenValid()) {
        token.value = storedToken
        refreshToken.value = storedRefreshToken
        user.value = storedUser

        // 验证token并获取最新用户信息
        try {
          const currentUser = await AuthService.getCurrentUser()
          user.value = currentUser
        } catch (error) {
          // 如果获取用户信息失败，清除认证状态
          await logout()
        }
      } else {
        // Token无效或不存在，清除状态
        await logout()
      }
    } catch (error: any) {
      console.error('Initialize auth failed:', error)
      await logout()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用户登录
   */
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await AuthService.login(credentials)
      
      // 更新状态
      user.value = response.user
      token.value = response.token
      refreshToken.value = response.refreshToken

      return response
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用户注册
   */
  const register = async (userData: RegisterData) => {
    isLoading.value = true
    error.value = null

    try {
      const newUser = await AuthService.register(userData)
      return newUser
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用户登出
   */
  const logout = async () => {
    isLoading.value = true
    error.value = null

    try {
      await AuthService.logout()
    } catch (err: any) {
      console.error('Logout failed:', err)
    } finally {
      // 清除状态
      user.value = null
      token.value = null
      refreshToken.value = null
      isLoading.value = false
      error.value = null
    }
  }

  /**
   * 刷新token
   */
  const refreshAuthToken = async () => {
    try {
      const newToken = await AuthService.refreshToken()
      token.value = newToken
      return newToken
    } catch (err: any) {
      error.value = err.message
      await logout()
      throw err
    }
  }

  /**
   * 获取当前用户信息
   */
  const fetchCurrentUser = async () => {
    isLoading.value = true
    error.value = null

    try {
      const currentUser = await AuthService.getCurrentUser()
      user.value = currentUser
      return currentUser
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 重置密码
   */
  const resetPassword = async (data: ResetPasswordData) => {
    isLoading.value = true
    error.value = null

    try {
      await AuthService.resetPassword(data)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 修改密码
   */
  const changePassword = async (data: ChangePasswordData) => {
    isLoading.value = true
    error.value = null

    try {
      await AuthService.changePassword(data)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新用户信息
   */
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user.value) return

    const updatedUser = { ...user.value, ...updates }
    user.value = updatedUser
    
    // 更新本地存储
    localStorage.setItem('user_info', JSON.stringify(updatedUser))
  }

  /**
   * 检查权限
   */
  const hasPermission = (resource: string, action: string): boolean => {
    return AuthService.hasPermission(user.value, resource, action)
  }

  /**
   * 检查角色
   */
  const hasRole = (role: string): boolean => {
    return AuthService.hasRole(user.value, role)
  }

  /**
   * 检查是否为管理员
   */
  const isAdmin = computed(() => {
    return hasRole('admin') || hasRole('super_admin')
  })

  /**
   * 检查是否为超级管理员
   */
  const isSuperAdmin = computed(() => {
    return hasRole('super_admin')
  })

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
    user.value = null
    token.value = null
    refreshToken.value = null
    isLoading.value = false
    error.value = null
  }

  // ===== 返回API =====
  return {
    // 只读状态
    user: readonly(user),
    token: readonly(token),
    refreshToken: readonly(refreshToken),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // 计算属性
    isAuthenticated,
    userRole,
    userPermissions,
    userName,
    userAvatar,
    isAdmin,
    isSuperAdmin,

    // 方法
    initializeAuth,
    login,
    register,
    logout,
    refreshAuthToken,
    fetchCurrentUser,
    resetPassword,
    changePassword,
    updateUserProfile,
    hasPermission,
    hasRole,
    clearError,
    reset
  }
}, {
  persist: {
    key: 'auth-store',
    storage: localStorage,
    paths: ['user', 'token', 'refreshToken']
  }
})
