<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAdminStore } from '@/stores/admin'
import { useUIStore } from '@/stores/ui'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const authStore = useAuthStore()
const adminStore = useAdminStore()
const uiStore = useUIStore()

// 组件状态
const isLoading = ref(true)
const refreshing = ref(false)

// 计算属性
const currentUser = computed(() => authStore.user)
const userName = computed(() => authStore.userName)
const stats = computed(() => adminStore.stats)
const notifications = computed(() => adminStore.unreadNotifications.slice(0, 5))
const systemHealth = computed(() => adminStore.systemHealthStatus)

// 统计卡片数据
const statCards = computed(() => [
  {
    title: '总用户数',
    value: stats.value.totalUsers,
    change: '+12%',
    changeType: 'positive' as const,
    icon: '👥',
    color: 'blue'
  },
  {
    title: '活跃用户',
    value: stats.value.activeUsers,
    change: '+8%',
    changeType: 'positive' as const,
    icon: '🟢',
    color: 'green'
  },
  {
    title: '工作流总数',
    value: stats.value.totalWorkflows,
    change: '+15%',
    changeType: 'positive' as const,
    icon: '🔄',
    color: 'purple'
  },
  {
    title: '运行中工作流',
    value: stats.value.runningWorkflows,
    change: '-3%',
    changeType: 'negative' as const,
    icon: '⚡',
    color: 'orange'
  }
])

// 系统监控数据
const systemMetrics = computed(() => [
  {
    label: '系统负载',
    value: stats.value.systemLoad,
    max: 100,
    unit: '%',
    status: stats.value.systemLoad > 80 ? 'danger' : stats.value.systemLoad > 60 ? 'warning' : 'success'
  },
  {
    label: '内存使用',
    value: stats.value.memoryUsage,
    max: 100,
    unit: '%',
    status: stats.value.memoryUsage > 90 ? 'danger' : stats.value.memoryUsage > 75 ? 'warning' : 'success'
  },
  {
    label: '磁盘使用',
    value: stats.value.diskUsage,
    max: 100,
    unit: '%',
    status: stats.value.diskUsage > 95 ? 'danger' : stats.value.diskUsage > 85 ? 'warning' : 'success'
  }
])

// 最近活动数据（模拟）
const recentActivities = ref([
  {
    id: '1',
    type: 'user_login',
    message: '用户 editor 登录系统',
    timestamp: new Date(Date.now() - 300000),
    icon: '🔑'
  },
  {
    id: '2',
    type: 'workflow_created',
    message: '创建了新工作流 "数据处理流程"',
    timestamp: new Date(Date.now() - 600000),
    icon: '➕'
  },
  {
    id: '3',
    type: 'workflow_executed',
    message: '工作流 "AI分析流程" 执行完成',
    timestamp: new Date(Date.now() - 900000),
    icon: '✅'
  },
  {
    id: '4',
    type: 'user_registered',
    message: '新用户 john_doe 注册账号',
    timestamp: new Date(Date.now() - 1200000),
    icon: '👤'
  },
  {
    id: '5',
    type: 'system_backup',
    message: '系统自动备份完成',
    timestamp: new Date(Date.now() - 1800000),
    icon: '💾'
  }
])

// 方法
const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

const getHealthStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'text-green-600'
    case 'warning': return 'text-yellow-600'
    case 'critical': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

const getHealthStatusText = (status: string) => {
  switch (status) {
    case 'healthy': return '健康'
    case 'warning': return '警告'
    case 'critical': return '严重'
    default: return '未知'
  }
}

const getMetricStatusColor = (status: string) => {
  switch (status) {
    case 'success': return 'bg-green-500'
    case 'warning': return 'bg-yellow-500'
    case 'danger': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

const refreshData = async () => {
  refreshing.value = true
  try {
    await Promise.all([
      adminStore.fetchStats(),
      adminStore.fetchNotifications()
    ])
  } catch (error) {
    console.error('Failed to refresh data:', error)
  } finally {
    refreshing.value = false
  }
}

const handleNotificationClick = (notification: any) => {
  adminStore.markNotificationAsRead(notification.id)
  // 根据通知类型执行相应操作
}

// 生命周期
onMounted(async () => {
  try {
    await Promise.all([
      adminStore.fetchStats(),
      adminStore.fetchNotifications()
    ])
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">
          欢迎回来，{{ userName }}！
        </h1>
        <p class="welcome-subtitle">
          今天是 {{ new Date().toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          }) }}
        </p>
      </div>
      <div class="welcome-actions">
        <BaseButton
          @click="refreshData"
          :loading="refreshing"
          variant="outline"
          size="sm"
        >
          刷新数据
        </BaseButton>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <BaseCard
        v-for="card in statCards"
        :key="card.title"
        class="stat-card"
        :class="`stat-card--${card.color}`"
        hoverable
      >
        <div class="stat-content">
          <div class="stat-icon">{{ card.icon }}</div>
          <div class="stat-info">
            <div class="stat-value">{{ card.value.toLocaleString() }}</div>
            <div class="stat-title">{{ card.title }}</div>
          </div>
          <div class="stat-change" :class="{
            'stat-change--positive': card.changeType === 'positive',
            'stat-change--negative': card.changeType === 'negative'
          }">
            {{ card.change }}
          </div>
        </div>
      </BaseCard>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧内容 -->
      <div class="content-left">
        <!-- 系统监控 -->
        <BaseCard title="系统监控" class="system-monitor">
          <template #extra>
            <div class="system-health">
              <span class="health-label">系统状态:</span>
              <span :class="getHealthStatusColor(systemHealth)" class="health-status">
                {{ getHealthStatusText(systemHealth) }}
              </span>
            </div>
          </template>
          
          <div class="metrics-list">
            <div 
              v-for="metric in systemMetrics"
              :key="metric.label"
              class="metric-item"
            >
              <div class="metric-header">
                <span class="metric-label">{{ metric.label }}</span>
                <span class="metric-value">{{ metric.value }}{{ metric.unit }}</span>
              </div>
              <div class="metric-bar">
                <div class="metric-track">
                  <div 
                    class="metric-fill"
                    :class="getMetricStatusColor(metric.status)"
                    :style="{ width: `${metric.value}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
        
        <!-- 最近活动 -->
        <BaseCard title="最近活动" class="recent-activities">
          <div class="activity-list">
            <div 
              v-for="activity in recentActivities"
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon">{{ activity.icon }}</div>
              <div class="activity-content">
                <div class="activity-message">{{ activity.message }}</div>
                <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
      
      <!-- 右侧内容 -->
      <div class="content-right">
        <!-- 系统通知 -->
        <BaseCard title="系统通知" class="notifications">
          <template #extra>
            <BaseButton
              variant="ghost"
              size="sm"
              @click="adminStore.markAllNotificationsAsRead"
            >
              全部已读
            </BaseButton>
          </template>
          
          <div v-if="notifications.length === 0" class="empty-state">
            <div class="empty-icon">🔔</div>
            <div class="empty-text">暂无新通知</div>
          </div>
          
          <div v-else class="notification-list">
            <div 
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="`notification-item--${notification.type}`"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-header">
                <span class="notification-title">{{ notification.title }}</span>
                <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
              </div>
              <div class="notification-message">{{ notification.message }}</div>
              <div v-if="notification.actions" class="notification-actions">
                <BaseButton
                  v-for="action in notification.actions"
                  :key="action.action"
                  :variant="action.variant || 'ghost'"
                  size="xs"
                  @click.stop="() => {}"
                >
                  {{ action.label }}
                </BaseButton>
              </div>
            </div>
          </div>
        </BaseCard>
        
        <!-- 快速操作 -->
        <BaseCard title="快速操作" class="quick-actions">
          <div class="action-grid">
            <button class="action-item">
              <div class="action-icon">👥</div>
              <div class="action-label">用户管理</div>
            </button>
            <button class="action-item">
              <div class="action-icon">🔄</div>
              <div class="action-label">工作流</div>
            </button>
            <button class="action-item">
              <div class="action-icon">📊</div>
              <div class="action-label">监控中心</div>
            </button>
            <button class="action-item">
              <div class="action-icon">⚙️</div>
              <div class="action-label">系统设置</div>
            </button>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.welcome-content {
  flex: 1;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px 0;
}

.welcome-subtitle {
  font-size: 16px;
  color: var(--color-text-muted);
  margin: 0;
}

.welcome-actions {
  display: flex;
  gap: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stat-card {
  transition: all 0.2s ease;
}

.stat-card--blue { border-left: 4px solid #3b82f6; }
.stat-card--green { border-left: 4px solid #10b981; }
.stat-card--purple { border-left: 4px solid #8b5cf6; }
.stat-card--orange { border-left: 4px solid #f59e0b; }

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-hover);
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
}

.stat-title {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.stat-change {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}

.stat-change--positive {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.stat-change--negative {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.content-left,
.content-right {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.system-monitor .system-health {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.health-label {
  color: var(--color-text-muted);
}

.health-status {
  font-weight: 600;
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-header {
  display: flex;
  justify-content: between;
  align-items: center;
}

.metric-label {
  font-size: 14px;
  color: var(--color-text);
  font-weight: 500;
}

.metric-value {
  font-size: 14px;
  color: var(--color-text-muted);
  font-weight: 600;
}

.metric-bar {
  width: 100%;
}

.metric-track {
  width: 100%;
  height: 8px;
  background: var(--color-surface-hover);
  border-radius: 4px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.activity-icon {
  font-size: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-hover);
  border-radius: 8px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-message {
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.4;
}

.activity-time {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  color: var(--color-text-muted);
  font-size: 14px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid transparent;
  background: var(--color-surface-hover);
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-item:hover {
  background: var(--color-surface-active);
}

.notification-item--info { border-left-color: #3b82f6; }
.notification-item--warning { border-left-color: #f59e0b; }
.notification-item--error { border-left-color: #ef4444; }
.notification-item--success { border-left-color: #10b981; }

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.notification-time {
  font-size: 12px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.notification-message {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.4;
  margin-bottom: 8px;
}

.notification-actions {
  display: flex;
  gap: 8px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-item:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 24px;
}

.action-label {
  font-size: 12px;
  color: var(--color-text);
  font-weight: 500;
  text-align: center;
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard {
    gap: 16px;
  }
  
  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .main-content {
    gap: 16px;
  }
  
  .welcome-title {
    font-size: 24px;
  }
}
</style>
