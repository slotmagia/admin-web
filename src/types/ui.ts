// 主题类型
export type ThemeMode = 'light' | 'dark' | 'system'

// 主题配置接口
export interface ThemeConfig {
  mode: ThemeMode
  primaryColor: string
  borderRadius: number
  fontSize: number
}

// 布局配置接口
export interface LayoutConfig {
  sidebarWidth: number
  propertiesPanelWidth: number
  toolbarHeight: number
  miniMapVisible: boolean
  controlsVisible: boolean
}

// 用户偏好设置接口
export interface UserPreferences {
  theme: ThemeConfig
  layout: LayoutConfig
  autoSave: boolean
  autoSaveInterval: number
  showGrid: boolean
  snapToGrid: boolean
  animationsEnabled: boolean
}

// 通知类型
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

// 通知接口
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  persistent?: boolean
  actions?: NotificationAction[]
}

// 通知操作接口
export interface NotificationAction {
  label: string
  action: () => void
  variant?: 'primary' | 'secondary'
}

// 模态框配置接口
export interface ModalConfig {
  title: string
  content: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  persistent?: boolean
}

// 侧边栏项目接口
export interface SidebarItem {
  id: string
  label: string
  icon?: string
  component?: string
  category?: string
  draggable?: boolean
  disabled?: boolean
}

// 工具栏按钮接口
export interface ToolbarButton {
  id: string
  label: string
  icon: string
  action: () => void
  disabled?: boolean
  tooltip?: string
  shortcut?: string
}

// 右键菜单项接口
export interface ContextMenuItem {
  id: string
  label: string
  icon?: string
  action: () => void
  disabled?: boolean
  separator?: boolean
  submenu?: ContextMenuItem[]
}

// 表单字段类型
export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'color'
  | 'range'

// 表单字段接口
export interface FormField {
  name: string
  label: string
  type: FormFieldType
  value?: unknown
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: Array<{ label: string; value: unknown }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
    custom?: (value: unknown) => boolean | string
  }
}

// 表单配置接口
export interface FormConfig {
  fields: FormField[]
  submitText?: string
  cancelText?: string
  onSubmit?: (data: Record<string, unknown>) => void
  onCancel?: () => void
}
