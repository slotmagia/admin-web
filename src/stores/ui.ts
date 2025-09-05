import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type {
  ThemeMode,
  ThemeConfig,
  LayoutConfig,
  UserPreferences,
  Notification,
  ModalConfig,
} from '@/types'

export const useUIStore = defineStore('ui', () => {
  // ===== 状态定义 =====

  // 主题配置
  const themeConfig = ref<ThemeConfig>({
    mode: 'light',
    primaryColor: '#3b82f6',
    borderRadius: 8,
    fontSize: 14,
  })

  // 布局配置
  const layoutConfig = ref<LayoutConfig>({
    sidebarWidth: 250,
    propertiesPanelWidth: 300,
    toolbarHeight: 60,
    miniMapVisible: true,
    controlsVisible: true,
  })

  // 用户偏好设置
  const userPreferences = ref<UserPreferences>({
    theme: { ...themeConfig.value },
    layout: { ...layoutConfig.value },
    autoSave: true,
    autoSaveInterval: 30000, // 30秒
    showGrid: true,
    snapToGrid: false,
    animationsEnabled: true,
  })

  // 通知系统
  const notifications = ref<Notification[]>([])

  // 模态框
  const currentModal = ref<ModalConfig | null>(null)

  // 加载状态
  const isLoading = ref(false)
  const loadingMessage = ref('')

  // 侧边栏状态
  const sidebarCollapsed = ref(false)
  const propertiesPanelCollapsed = ref(false)

  // 全屏状态
  const isFullscreen = ref(false)

  // 错误状态
  const globalError = ref<string | null>(null)

  // ===== 计算属性 =====

  const currentTheme = computed(() => {
    if (themeConfig.value.mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return themeConfig.value.mode
  })

  const isDarkMode = computed(() => currentTheme.value === 'dark')

  const availableWidth = computed(() => {
    let width = window.innerWidth
    if (!sidebarCollapsed.value) {
      width -= layoutConfig.value.sidebarWidth
    }
    if (!propertiesPanelCollapsed.value) {
      width -= layoutConfig.value.propertiesPanelWidth
    }
    return width
  })

  const availableHeight = computed(() => {
    return window.innerHeight - layoutConfig.value.toolbarHeight
  })

  const persistentNotifications = computed(() => notifications.value.filter(n => n.persistent))

  const temporaryNotifications = computed(() => notifications.value.filter(n => !n.persistent))

  // ===== Actions =====

  // 主题操作
  const setThemeMode = (mode: ThemeMode) => {
    themeConfig.value.mode = mode
    userPreferences.value.theme.mode = mode
    savePreferences()
    applyTheme()
  }

  const toggleTheme = () => {
    const newMode = themeConfig.value.mode === 'light' ? 'dark' : 'light'
    setThemeMode(newMode)
  }

  const updateThemeConfig = (config: Partial<ThemeConfig>) => {
    themeConfig.value = { ...themeConfig.value, ...config }
    userPreferences.value.theme = { ...themeConfig.value }
    savePreferences()
    applyTheme()
  }

  const applyTheme = () => {
    const root = document.documentElement
    root.setAttribute('data-theme', currentTheme.value)
    root.style.setProperty('--primary-color', themeConfig.value.primaryColor)
    root.style.setProperty('--border-radius', `${themeConfig.value.borderRadius}px`)
    root.style.setProperty('--font-size', `${themeConfig.value.fontSize}px`)
  }

  // 布局操作
  const updateLayoutConfig = (config: Partial<LayoutConfig>) => {
    layoutConfig.value = { ...layoutConfig.value, ...config }
    userPreferences.value.layout = { ...layoutConfig.value }
    savePreferences()
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const togglePropertiesPanel = () => {
    propertiesPanelCollapsed.value = !propertiesPanelCollapsed.value
  }

  const setSidebarWidth = (width: number) => {
    layoutConfig.value.sidebarWidth = Math.max(200, Math.min(400, width))
    userPreferences.value.layout.sidebarWidth = layoutConfig.value.sidebarWidth
    savePreferences()
  }

  const setPropertiesPanelWidth = (width: number) => {
    layoutConfig.value.propertiesPanelWidth = Math.max(250, Math.min(500, width))
    userPreferences.value.layout.propertiesPanelWidth = layoutConfig.value.propertiesPanelWidth
    savePreferences()
  }

  // 通知操作
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString()
    const newNotification: Notification = {
      id,
      ...notification,
    }

    notifications.value.push(newNotification)

    // 自动移除非持久化通知
    if (!notification.persistent && notification.duration !== 0) {
      const duration = notification.duration || 5000
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  const showSuccess = (title: string, message: string, duration = 3000) => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration,
    })
  }

  const showError = (title: string, message: string, persistent = false) => {
    return addNotification({
      type: 'error',
      title,
      message,
      persistent,
      duration: persistent ? 0 : 5000,
    })
  }

  const showWarning = (title: string, message: string, duration = 4000) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration,
    })
  }

  const showInfo = (title: string, message: string, duration = 3000) => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration,
    })
  }

  // 模态框操作
  const showModal = (config: ModalConfig) => {
    currentModal.value = config
  }

  const hideModal = () => {
    currentModal.value = null
  }

  const showConfirmDialog = (
    title: string,
    content: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    showModal({
      title,
      content,
      confirmText: '确认',
      cancelText: '取消',
      onConfirm: () => {
        onConfirm?.()
        hideModal()
      },
      onCancel: () => {
        onCancel?.()
        hideModal()
      },
    })
  }

  // 加载状态操作
  const setLoading = (loading: boolean, message = '') => {
    isLoading.value = loading
    loadingMessage.value = message
  }

  const startLoading = (message = '加载中...') => {
    setLoading(true, message)
  }

  const stopLoading = () => {
    setLoading(false, '')
  }

  // 全屏操作
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        isFullscreen.value = true
      } else {
        await document.exitFullscreen()
        isFullscreen.value = false
      }
    } catch (error) {
      console.error('Fullscreen operation failed:', error)
    }
  }

  // 错误处理
  const setGlobalError = (error: string | null) => {
    globalError.value = error
  }

  const clearGlobalError = () => {
    globalError.value = null
  }

  // 偏好设置操作
  const updateUserPreferences = (preferences: Partial<UserPreferences>) => {
    userPreferences.value = { ...userPreferences.value, ...preferences }

    // 同步到对应的配置
    if (preferences.theme) {
      themeConfig.value = { ...preferences.theme }
      applyTheme()
    }
    if (preferences.layout) {
      layoutConfig.value = { ...preferences.layout }
    }

    savePreferences()
  }

  const savePreferences = () => {
    try {
      localStorage.setItem('user-preferences', JSON.stringify(userPreferences.value))
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }

  const loadPreferences = () => {
    try {
      const saved = localStorage.getItem('user-preferences')
      if (saved) {
        const parsed = JSON.parse(saved) as UserPreferences
        userPreferences.value = parsed
        themeConfig.value = { ...parsed.theme }
        layoutConfig.value = { ...parsed.layout }
        applyTheme()
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
    }
  }

  const resetPreferences = () => {
    userPreferences.value = {
      theme: {
        mode: 'light',
        primaryColor: '#3b82f6',
        borderRadius: 8,
        fontSize: 14,
      },
      layout: {
        sidebarWidth: 250,
        propertiesPanelWidth: 300,
        toolbarHeight: 60,
        miniMapVisible: true,
        controlsVisible: true,
      },
      autoSave: true,
      autoSaveInterval: 30000,
      showGrid: true,
      snapToGrid: false,
      animationsEnabled: true,
    }

    themeConfig.value = { ...userPreferences.value.theme }
    layoutConfig.value = { ...userPreferences.value.layout }
    savePreferences()
    applyTheme()
  }

  // 初始化
  const initialize = () => {
    loadPreferences()

    // 监听系统主题变化
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', () => {
        if (themeConfig.value.mode === 'system') {
          applyTheme()
        }
      })
    }

    // 监听全屏状态变化
    document.addEventListener('fullscreenchange', () => {
      isFullscreen.value = !!document.fullscreenElement
    })
  }

  // ===== 返回API =====
  return {
    // 只读状态
    themeConfig: readonly(themeConfig),
    layoutConfig: readonly(layoutConfig),
    userPreferences: readonly(userPreferences),
    notifications: readonly(notifications),
    currentModal: readonly(currentModal),
    isLoading: readonly(isLoading),
    loadingMessage: readonly(loadingMessage),
    sidebarCollapsed: readonly(sidebarCollapsed),
    propertiesPanelCollapsed: readonly(propertiesPanelCollapsed),
    isFullscreen: readonly(isFullscreen),
    globalError: readonly(globalError),

    // 计算属性
    currentTheme,
    isDarkMode,
    availableWidth,
    availableHeight,
    persistentNotifications,
    temporaryNotifications,

    // 方法
    setThemeMode,
    toggleTheme,
    updateThemeConfig,
    updateLayoutConfig,
    toggleSidebar,
    togglePropertiesPanel,
    setSidebarWidth,
    setPropertiesPanelWidth,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showModal,
    hideModal,
    showConfirmDialog,
    setLoading,
    startLoading,
    stopLoading,
    toggleFullscreen,
    setGlobalError,
    clearGlobalError,
    updateUserPreferences,
    resetPreferences,
    initialize,
  }
})
