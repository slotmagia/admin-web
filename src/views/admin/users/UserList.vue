<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseTable from '@/components/base/BaseTable.vue'

const adminStore = useAdminStore()

const isLoading = ref(true)
const selectedUsers = ref([])

// 表格列定义
const columns = [
  {
    key: 'user',
    title: '用户信息',
    width: '200px'
  },
  {
    key: 'email',
    title: '邮箱地址',
    width: '180px'
  },
  {
    key: 'role',
    title: '角色',
    width: '120px',
    align: 'center' as const
  },
  {
    key: 'status',
    title: '状态',
    width: '100px',
    align: 'center' as const
  },
  {
    key: 'lastLoginAt',
    title: '最后登录',
    width: '150px'
  },
  {
    key: 'actions',
    title: '操作',
    width: '120px',
    align: 'center' as const
  }
]

// 计算属性
const tableData = computed(() => {
  return adminStore.users.map(user => ({
    ...user,
    userInfo: {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar
    }
  }))
})

// 方法
const handleSelectionChange = (selection: any[]) => {
  selectedUsers.value = selection
}

const handleRowClick = (row: any) => {
  console.log('点击用户:', row)
}

const handleEdit = (user: any) => {
  console.log('编辑用户:', user)
}

const handleDelete = (user: any) => {
  console.log('删除用户:', user)
}

const formatLastLogin = (date: Date | undefined) => {
  if (!date) return '从未登录'
  return new Date(date).toLocaleDateString('zh-CN')
}

const getRoleText = (role: string) => {
  const roleMap: Record<string, string> = {
    'super_admin': '超级管理员',
    'admin': '管理员',
    'editor': '编辑者',
    'viewer': '查看者'
  }
  return roleMap[role] || role
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': '正常',
    'inactive': '禁用',
    'suspended': '暂停'
  }
  return statusMap[status] || status
}

onMounted(async () => {
  try {
    await adminStore.fetchUsers()
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="user-list-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">用户管理</h1>
        <p class="page-description">管理系统用户账号和权限</p>
      </div>
      <div class="header-actions">
        <BaseButton variant="primary">
          添加用户
        </BaseButton>
      </div>
    </div>
    
    <BaseCard title="用户列表">
      <BaseTable
        :columns="columns"
        :data="tableData"
        :loading="isLoading"
        :selected-rows="selectedUsers"
        checkbox-column
        hoverable
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <!-- 用户信息列 -->
        <template #user="{ row }">
          <div class="user-info">
            <div class="user-avatar">
              <img 
                v-if="row.avatar" 
                :src="row.avatar" 
                :alt="row.username"
                class="avatar-image"
              />
              <span v-else class="avatar-text">
                {{ row.username.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="user-details">
              <div class="user-name">{{ row.username }}</div>
              <div class="user-full-name">{{ row.firstName }} {{ row.lastName }}</div>
            </div>
          </div>
        </template>
        
        <!-- 角色列 -->
        <template #role="{ row }">
          <span class="role-badge" :class="`role-badge--${row.role}`">
            {{ getRoleText(row.role) }}
          </span>
        </template>
        
        <!-- 状态列 -->
        <template #status="{ row }">
          <span 
            class="status-badge"
            :class="`status-badge--${row.status}`"
          >
            <span class="status-dot"></span>
            {{ getStatusText(row.status) }}
          </span>
        </template>
        
        <!-- 最后登录列 -->
        <template #lastLoginAt="{ row }">
          {{ formatLastLogin(row.lastLoginAt) }}
        </template>
        
        <!-- 操作列 -->
        <template #actions="{ row }">
          <div class="action-buttons">
            <BaseButton 
              variant="ghost" 
              size="sm"
              @click.stop="handleEdit(row)"
            >
              编辑
            </BaseButton>
            <BaseButton 
              variant="ghost" 
              size="sm"
              @click.stop="handleDelete(row)"
            >
              删除
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </BaseCard>
  </div>
</template>

<style scoped>
.user-list-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 16px;
  color: var(--color-text-muted);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  font-size: 14px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 14px;
}

.user-full-name {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* 角色徽章 */
.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.role-badge--super_admin {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.role-badge--admin {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.role-badge--editor {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.role-badge--viewer {
  background: rgba(107, 114, 128, 0.1);
  color: #4b5563;
}

/* 状态徽章 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-badge--active {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-badge--active .status-dot {
  background: #10b981;
}

.status-badge--inactive {
  background: rgba(107, 114, 128, 0.1);
  color: #4b5563;
}

.status-badge--inactive .status-dot {
  background: #6b7280;
}

.status-badge--suspended {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.status-badge--suspended .status-dot {
  background: #ef4444;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 8px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .user-info {
    gap: 8px;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
  }
  
  .avatar-text {
    font-size: 12px;
  }
}
</style>
