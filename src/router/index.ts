import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由组件懒加载
const Login = () => import('@/views/auth/Login.vue')
const AdminLayout = () => import('@/components/admin/layout/AdminLayout.vue')
const Dashboard = () => import('@/views/admin/Dashboard.vue')
const UserList = () => import('@/views/admin/users/UserList.vue')
const UserRoles = () => import('@/views/admin/users/UserRoles.vue')
const WorkflowList = () => import('@/views/admin/workflows/WorkflowList.vue')
const WorkflowTemplates = () => import('@/views/admin/workflows/WorkflowTemplates.vue')
const Monitoring = () => import('@/views/admin/Monitoring.vue')
const Settings = () => import('@/views/admin/Settings.vue')
const Profile = () => import('@/views/admin/Profile.vue')
const TestPage = () => import('@/views/admin/TestPage.vue')
const NotFound = () => import('@/views/errors/NotFound.vue')

// 路由配置
const routes: RouteRecordRaw[] = [
  // 根路径重定向
  {
    path: '/',
    redirect: '/admin/dashboard'
  },
  
  // 认证相关路由
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      requiresAuth: false,
      layout: 'auth'
    }
  },
  
  // 管理后台路由
  {
    path: '/admin',
    component: AdminLayout,
    meta: {
      requiresAuth: true,
      layout: 'admin'
    },
    children: [
      // 仪表板
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: '仪表板',
          icon: '📊',
          requiresAuth: true
        }
      },
      
      // 用户管理
      {
        path: 'users',
        name: 'UserList',
        component: UserList,
        meta: {
          title: '用户列表',
          icon: '👥',
          requiresAuth: true,
          permissions: ['users:read']
        }
      },
      {
        path: 'users/roles',
        name: 'UserRoles',
        component: UserRoles,
        meta: {
          title: '角色管理',
          icon: '🎭',
          requiresAuth: true,
          permissions: ['roles:read']
        }
      },
      
      // 工作流管理
      {
        path: 'workflows',
        name: 'WorkflowList',
        component: WorkflowList,
        meta: {
          title: '工作流列表',
          icon: '🔄',
          requiresAuth: true,
          permissions: ['workflows:read']
        }
      },
      {
        path: 'workflows/templates',
        name: 'WorkflowTemplates',
        component: WorkflowTemplates,
        meta: {
          title: '模板管理',
          icon: '📄',
          requiresAuth: true,
          permissions: ['templates:read']
        }
      },
      
      // 监控中心
      {
        path: 'monitoring',
        name: 'Monitoring',
        component: Monitoring,
        meta: {
          title: '监控中心',
          icon: '📈',
          requiresAuth: true,
          permissions: ['monitoring:read']
        }
      },
      
      // 系统设置
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
        meta: {
          title: '系统设置',
          icon: '⚙️',
          requiresAuth: true,
          permissions: ['settings:read']
        }
      },
      
      // 个人资料
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: {
          title: '个人资料',
          icon: '👤',
          requiresAuth: true
        }
      },
      
      // 测试页面
      {
        path: 'test',
        name: 'TestPage',
        component: TestPage,
        meta: {
          title: '系统测试',
          icon: '🧪',
          requiresAuth: true
        }
      }
    ]
  },
  
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面未找到',
      requiresAuth: false
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 管理后台`
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 如果未认证，重定向到登录页
    if (!authStore.isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // 检查权限
    if (to.meta.permissions && Array.isArray(to.meta.permissions)) {
      const hasPermission = to.meta.permissions.some((permission: string) => {
        const [resource, action] = permission.split(':')
        return authStore.hasPermission(resource, action)
      })
      
      if (!hasPermission) {
        // 权限不足，重定向到仪表板或显示错误页面
        next('/admin/dashboard')
        return
      }
    }
  }
  
  // 如果已认证且访问登录页，重定向到仪表板
  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/admin/dashboard')
    return
  }
  
  next()
})

// 路由错误处理
router.onError((error) => {
  console.error('Router error:', error)
})

export default router

// 导出路由相关类型和工具函数
export type { RouteRecordRaw }

/**
 * 获取面包屑导航
 */
export function getBreadcrumbs(route: any) {
  const breadcrumbs = []
  const pathSegments = route.path.split('/').filter(Boolean)
  
  let currentPath = ''
  for (const segment of pathSegments) {
    currentPath += `/${segment}`
    
    // 查找匹配的路由
    const matchedRoute = router.getRoutes().find(r => r.path === currentPath)
    if (matchedRoute && matchedRoute.meta?.title) {
      breadcrumbs.push({
        title: matchedRoute.meta.title,
        path: currentPath,
        active: currentPath === route.path
      })
    }
  }
  
  return breadcrumbs
}

/**
 * 检查路由权限
 */
export function hasRoutePermission(route: any, authStore: any): boolean {
  if (!route.meta?.permissions) return true
  
  return route.meta.permissions.some((permission: string) => {
    const [resource, action] = permission.split(':')
    return authStore.hasPermission(resource, action)
  })
}

/**
 * 获取可访问的菜单项
 */
export function getAccessibleMenuItems(authStore: any) {
  const menuItems = []
  
  for (const route of router.getRoutes()) {
    if (route.meta?.title && route.meta?.icon && hasRoutePermission(route, authStore)) {
      menuItems.push({
        title: route.meta.title,
        icon: route.meta.icon,
        path: route.path,
        name: route.name
      })
    }
  }
  
  return menuItems
}
