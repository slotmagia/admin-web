import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { MockAPI } from '@/mock/api'
import type { MockWorkflow } from '@/mock/data'

export const useWorkflowManagementStore = defineStore('workflowManagement', () => {
  // ===== 状态定义 =====
  const workflows = ref<MockWorkflow[]>([])
  const currentWorkflow = ref<MockWorkflow | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 分页状态
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  
  // 筛选状态
  const filters = ref({
    search: '',
    status: '',
    creator: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  })

  // ===== 计算属性 =====
  const activeWorkflows = computed(() => 
    workflows.value.filter(w => w.status === 'active')
  )

  const runningWorkflows = computed(() => 
    workflows.value.filter(w => w.status === 'running')
  )

  const errorWorkflows = computed(() => 
    workflows.value.filter(w => w.status === 'error')
  )

  const totalExecutions = computed(() => 
    workflows.value.reduce((sum, w) => sum + w.executionCount, 0)
  )

  const averageSuccessRate = computed(() => {
    if (workflows.value.length === 0) return 0
    const totalRate = workflows.value.reduce((sum, w) => sum + w.successRate, 0)
    return Math.round(totalRate / workflows.value.length * 100) / 100
  })

  const workflowsByStatus = computed(() => {
    const statusCount = {
      active: 0,
      inactive: 0,
      running: 0,
      error: 0
    }
    
    workflows.value.forEach(w => {
      statusCount[w.status]++
    })
    
    return statusCount
  })

  // ===== Actions =====

  /**
   * 获取工作流列表
   */
  const fetchWorkflows = async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    creator?: string
  }) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await MockAPI.Workflow.getWorkflows({
        ...filters.value,
        ...params
      })
      
      workflows.value = response.data
      pagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取工作流详情
   */
  const fetchWorkflow = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const workflow = await MockAPI.Workflow.getWorkflow(id)
      currentWorkflow.value = workflow
      return workflow
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建工作流
   */
  const createWorkflow = async (workflowData: Partial<MockWorkflow>) => {
    isLoading.value = true
    error.value = null

    try {
      const newWorkflow = await MockAPI.Workflow.createWorkflow(workflowData)
      workflows.value.unshift(newWorkflow)
      return newWorkflow
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新工作流
   */
  const updateWorkflow = async (id: string, workflowData: Partial<MockWorkflow>) => {
    isLoading.value = true
    error.value = null

    try {
      const updatedWorkflow = await MockAPI.Workflow.updateWorkflow(id, workflowData)
      
      // 更新列表中的工作流
      const index = workflows.value.findIndex(w => w.id === id)
      if (index > -1) {
        workflows.value[index] = updatedWorkflow
      }
      
      // 更新当前工作流
      if (currentWorkflow.value?.id === id) {
        currentWorkflow.value = updatedWorkflow
      }
      
      return updatedWorkflow
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 删除工作流
   */
  const deleteWorkflow = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      await MockAPI.Workflow.deleteWorkflow(id)
      
      // 从列表中移除
      const index = workflows.value.findIndex(w => w.id === id)
      if (index > -1) {
        workflows.value.splice(index, 1)
      }
      
      // 清除当前工作流
      if (currentWorkflow.value?.id === id) {
        currentWorkflow.value = null
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 执行工作流
   */
  const executeWorkflow = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await MockAPI.Workflow.executeWorkflow(id)
      
      // 更新工作流状态
      const workflow = workflows.value.find(w => w.id === id)
      if (workflow) {
        workflow.status = 'running'
        workflow.lastExecuted = new Date()
        workflow.executionCount++
      }
      
      return result
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 停止工作流
   */
  const stopWorkflow = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      // 模拟停止工作流
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const workflow = workflows.value.find(w => w.id === id)
      if (workflow) {
        workflow.status = 'inactive'
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 复制工作流
   */
  const duplicateWorkflow = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const originalWorkflow = await MockAPI.Workflow.getWorkflow(id)
      const duplicatedWorkflow = await MockAPI.Workflow.createWorkflow({
        ...originalWorkflow,
        name: `${originalWorkflow.name} (副本)`,
        status: 'inactive',
        executionCount: 0,
        successRate: 0,
        lastExecuted: undefined
      })
      
      workflows.value.unshift(duplicatedWorkflow)
      return duplicatedWorkflow
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新筛选条件
   */
  const updateFilters = (newFilters: Partial<typeof filters.value>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * 重置筛选条件
   */
  const resetFilters = () => {
    filters.value = {
      search: '',
      status: '',
      creator: '',
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    }
  }

  /**
   * 搜索工作流
   */
  const searchWorkflows = async (query: string) => {
    updateFilters({ search: query })
    await fetchWorkflows({ page: 1 })
  }

  /**
   * 按状态筛选
   */
  const filterByStatus = async (status: string) => {
    updateFilters({ status })
    await fetchWorkflows({ page: 1 })
  }

  /**
   * 按创建者筛选
   */
  const filterByCreator = async (creator: string) => {
    updateFilters({ creator })
    await fetchWorkflows({ page: 1 })
  }

  /**
   * 排序工作流
   */
  const sortWorkflows = async (sortBy: string, sortOrder: 'asc' | 'desc') => {
    updateFilters({ sortBy, sortOrder })
    await fetchWorkflows()
  }

  /**
   * 分页
   */
  const changePage = async (page: number) => {
    await fetchWorkflows({ page })
  }

  /**
   * 改变每页数量
   */
  const changePageSize = async (limit: number) => {
    await fetchWorkflows({ page: 1, limit })
  }

  /**
   * 获取工作流执行历史
   */
  const getExecutionHistory = async (workflowId: string) => {
    // 模拟获取执行历史
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [
      {
        id: '1',
        workflowId,
        status: 'success',
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() - 3540000),
        duration: 60000,
        logs: ['开始执行', '处理数据', '执行完成']
      },
      {
        id: '2',
        workflowId,
        status: 'failed',
        startTime: new Date(Date.now() - 7200000),
        endTime: new Date(Date.now() - 7140000),
        duration: 60000,
        error: '连接超时',
        logs: ['开始执行', '处理数据', '连接失败']
      }
    ]
  }

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
    workflows.value = []
    currentWorkflow.value = null
    isLoading.value = false
    error.value = null
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    }
    resetFilters()
  }

  // ===== 返回API =====
  return {
    // 只读状态
    workflows: readonly(workflows),
    currentWorkflow: readonly(currentWorkflow),
    isLoading: readonly(isLoading),
    error: readonly(error),
    pagination: readonly(pagination),
    filters: readonly(filters),

    // 计算属性
    activeWorkflows,
    runningWorkflows,
    errorWorkflows,
    totalExecutions,
    averageSuccessRate,
    workflowsByStatus,

    // 方法
    fetchWorkflows,
    fetchWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    stopWorkflow,
    duplicateWorkflow,
    updateFilters,
    resetFilters,
    searchWorkflows,
    filterByStatus,
    filterByCreator,
    sortWorkflows,
    changePage,
    changePageSize,
    getExecutionHistory,
    clearError,
    reset
  }
}, {
  persist: {
    key: 'workflow-management-store',
    storage: localStorage,
    paths: ['filters']
  }
})