# 后台管理系统

基于Vue-Flow组件构建的现代化后台管理系统，采用MVVM架构设计。

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 🏗️ 系统架构

### MVVM架构
- **Model层**: 数据模型和业务逻辑 (`/src/types`, `/src/services`)
- **ViewModel层**: 状态管理 (`/src/stores`)
- **View层**: 组件和界面 (`/src/components`, `/src/views`)

### 核心技术栈
- **Vue 3** - 响应式前端框架
- **Vue Router 4** - 路由管理
- **Pinia** - 状态管理
- **TypeScript** - 类型安全
- **@vue-flow/core** - 可视化流程图组件
- **Vite** - 构建工具

## 📁 项目结构

```
src/
├── components/           # 组件库
│   ├── base/            # 基础UI组件
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   └── BaseCard.vue
│   └── admin/           # 管理后台组件
│       └── layout/      # 布局组件
│           ├── AdminLayout.vue
│           ├── AdminSidebar.vue
│           └── AdminHeader.vue
├── views/               # 页面视图
│   ├── auth/           # 认证相关页面
│   │   └── Login.vue
│   ├── admin/          # 管理后台页面
│   │   ├── Dashboard.vue
│   │   ├── users/
│   │   ├── workflows/
│   │   └── ...
│   └── errors/         # 错误页面
├── stores/             # 状态管理
│   ├── auth.ts         # 认证状态
│   ├── admin.ts        # 管理后台状态
│   └── ui.ts          # UI状态
├── services/           # API服务
│   └── auth.ts        # 认证服务
├── types/             # 类型定义
│   ├── auth.ts        # 认证相关类型
│   └── ...
├── router/            # 路由配置
│   └── index.ts
└── assets/           # 静态资源
    └── styles/
```

## 🔐 认证系统

### 登录方式
系统提供演示账号快速登录：

- **管理员**: `admin` / `admin123`
- **编辑者**: `editor` / `editor123`
- **查看者**: `viewer` / `viewer123`

### 权限管理
- 基于角色的权限控制 (RBAC)
- 路由级别的权限验证
- 组件级别的权限控制

## 🎨 UI组件库

### 基础组件
- **BaseButton** - 按钮组件，支持多种样式和状态
- **BaseInput** - 输入框组件，支持验证和多种类型
- **BaseCard** - 卡片组件，支持加载状态和多种样式

### 布局组件
- **AdminLayout** - 管理后台主布局
- **AdminSidebar** - 侧边栏导航
- **AdminHeader** - 顶部导航栏

## 📊 功能模块

### 仪表板
- 系统统计概览
- 实时监控数据
- 系统通知
- 快速操作入口

### 用户管理
- 用户列表和详情
- 角色权限管理
- 用户状态控制

### 工作流管理
- 工作流列表和编辑
- 模板管理
- 执行监控

### 系统监控
- 性能指标监控
- 系统健康状态
- 日志查看

### 系统设置
- 基础配置管理
- 主题和偏好设置
- 系统维护

## 🎯 开发指南

### 组件开发
遵循Vue 3 Composition API最佳实践：

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

// 响应式数据
const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
const increment = () => {
  count.value++
}
</script>
```

### 状态管理
使用Pinia进行状态管理：

```typescript
export const useExampleStore = defineStore('example', () => {
  const state = ref(initialState)
  
  const getters = computed(() => {
    // 计算属性
  })
  
  const actions = {
    // 异步操作
  }
  
  return { state, getters, ...actions }
})
```

### 路由配置
支持嵌套路由和权限验证：

```typescript
{
  path: '/admin/users',
  component: UserLayout,
  meta: {
    requiresAuth: true,
    permissions: ['users:read']
  },
  children: [
    // 子路由
  ]
}
```

## 🔧 开发工具

### 代码质量
- **ESLint** - 代码规范检查
- **Prettier** - 代码格式化
- **TypeScript** - 类型检查

### 测试
- **Vitest** - 单元测试
- **@vue/test-utils** - Vue组件测试

### 构建优化
- **Vite** - 快速构建和热更新
- **代码分割** - 按需加载
- **Tree Shaking** - 移除未使用代码

## 🌟 特性亮点

### 响应式设计
- 支持桌面端和移动端
- 自适应布局
- 触摸友好的交互

### 主题系统
- 亮色/暗色主题切换
- CSS变量驱动的主题系统
- 用户偏好持久化

### 国际化支持
- 多语言支持架构
- 动态语言切换
- 本地化数据格式

### 性能优化
- 组件懒加载
- 虚拟滚动
- 图片懒加载
- 缓存策略

## 📝 更新日志

### v1.0.0 (2024-12-05)
- ✨ 完整的后台管理系统框架
- 🔐 认证和权限管理系统
- 🎨 现代化UI组件库
- 📊 仪表板和监控功能
- 🏗️ MVVM架构实现
- 📱 响应式设计支持

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢以下开源项目：
- [Vue.js](https://vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Flow](https://vueflow.dev/)
- [Vite](https://vitejs.dev/)
