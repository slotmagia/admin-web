import { ref, computed, readonly } from 'vue'
import type { WorkflowNode, WorkflowEdge, ExecutionStatus, ExecutionResult } from '@/types'
import { useUIStore } from '@/stores/ui'

export function useWorkflowExecution() {
  // 执行状态
  const executionStatus = ref<ExecutionStatus>('idle')
  const executionResult = ref<ExecutionResult | null>(null)
  const executionProgress = ref(0)
  const currentExecutingNode = ref<string | null>(null)
  const executionError = ref<string | null>(null)

  // UI状态管理
  const uiStore = useUIStore()

  // 计算属性
  const isExecuting = computed(() => executionStatus.value === 'running')
  const canExecute = computed(
    () =>
      executionStatus.value === 'idle' ||
      executionStatus.value === 'completed' ||
      executionStatus.value === 'failed'
  )
  const canPause = computed(() => executionStatus.value === 'running')
  const canResume = computed(() => executionStatus.value === 'paused')

  // 执行工作流
  const executeWorkflow = async (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
    if (!canExecute.value) {
      throw new Error('工作流正在执行中')
    }

    // 验证工作流
    const validation = validateWorkflow(nodes, edges)
    if (!validation.valid) {
      uiStore.showError('工作流验证失败', validation.error || '工作流配置有误')
      return
    }

    // 重置状态
    resetExecution()
    executionStatus.value = 'running'
    executionProgress.value = 0

    uiStore.showInfo('开始执行', '工作流开始执行...')

    try {
      const result = await executeNodes(nodes, edges)

      executionResult.value = result
      executionStatus.value = 'completed'
      executionProgress.value = 100

      uiStore.showSuccess('执行完成', `工作流执行成功，耗时 ${result.duration}ms`)
    } catch (error) {
      console.error('Workflow execution failed:', error)
      executionError.value = error instanceof Error ? error.message : '执行失败'
      executionStatus.value = 'failed'

      uiStore.showError('执行失败', executionError.value)
    } finally {
      currentExecutingNode.value = null
    }
  }

  // 暂停执行
  const pauseExecution = () => {
    if (canPause.value) {
      executionStatus.value = 'paused'
      uiStore.showWarning('执行暂停', '工作流执行已暂停')
    }
  }

  // 恢复执行
  const resumeExecution = () => {
    if (canResume.value) {
      executionStatus.value = 'running'
      uiStore.showInfo('恢复执行', '工作流执行已恢复')
    }
  }

  // 停止执行
  const stopExecution = () => {
    if (isExecuting.value || executionStatus.value === 'paused') {
      executionStatus.value = 'idle'
      currentExecutingNode.value = null
      executionProgress.value = 0
      uiStore.showInfo('执行停止', '工作流执行已停止')
    }
  }

  // 重置执行状态
  const resetExecution = () => {
    executionStatus.value = 'idle'
    executionResult.value = null
    executionProgress.value = 0
    currentExecutingNode.value = null
    executionError.value = null
  }

  // 验证工作流
  const validateWorkflow = (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
    // 检查是否有节点
    if (nodes.length === 0) {
      return { valid: false, error: '工作流至少需要一个节点' }
    }

    // 检查是否有输入节点
    const inputNodes = nodes.filter(node => node.type === 'input')
    if (inputNodes.length === 0) {
      return { valid: false, error: '工作流需要至少一个输入节点' }
    }

    // 检查是否有输出节点
    const outputNodes = nodes.filter(node => node.type === 'output')
    if (outputNodes.length === 0) {
      return { valid: false, error: '工作流需要至少一个输出节点' }
    }

    // 检查节点连接性
    const nodeIds = new Set(nodes.map(node => node.id))
    for (const edge of edges) {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        return { valid: false, error: '存在无效的连线' }
      }
    }

    // 检查是否有孤立节点（除了输入和输出节点）
    const connectedNodes = new Set<string>()
    edges.forEach(edge => {
      connectedNodes.add(edge.source)
      connectedNodes.add(edge.target)
    })

    const isolatedNodes = nodes.filter(
      node => !connectedNodes.has(node.id) && node.type !== 'input' && node.type !== 'output'
    )

    if (isolatedNodes.length > 0) {
      return {
        valid: false,
        error: `发现孤立节点: ${isolatedNodes.map(n => n.data.label).join(', ')}`,
      }
    }

    return { valid: true }
  }

  // 执行节点
  const executeNodes = async (
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ): Promise<ExecutionResult> => {
    const startTime = new Date()
    const result: ExecutionResult = {
      workflowId: `workflow-${Date.now()}`,
      status: 'running',
      startTime,
      results: {},
      errors: []
    }

    // 构建执行图（用于验证连接关系）
    buildExecutionGraph(nodes, edges)
    const executedNodes = new Set<string>()
    const nodeResults = new Map<string, any>()

    // 按拓扑顺序执行节点
    const sortedNodes = topologicalSort(nodes, edges)
    const totalNodes = sortedNodes.length

    for (let i = 0; i < sortedNodes.length; i++) {
      const node = sortedNodes[i]

      // 检查是否被暂停或停止
      if (executionStatus.value === 'paused') {
        await waitForResume()
      }

      if (executionStatus.value === 'idle') {
        throw new Error('执行被用户停止')
      }

      currentExecutingNode.value = node.id
      executionProgress.value = (i / totalNodes) * 100

      try {
        // 执行节点
        const nodeResult = await executeNode(node, nodeResults)
        nodeResults.set(node.id, nodeResult)
        executedNodes.add(node.id)

        // 更新结果
        result.results[node.id] = nodeResult
      } catch (error) {
        const executionError = {
          nodeId: node.id,
          message: error instanceof Error ? error.message : '节点执行失败',
          timestamp: new Date()
        }

        result.errors?.push(executionError)

        // 根据节点类型决定是否继续执行
        if (node.type === 'input' || node.type === 'output') {
          throw error // 关键节点失败则停止执行
        }
      }
    }

    // 完成执行
    const endTime = new Date()
    result.endTime = endTime
    result.duration = endTime.getTime() - startTime.getTime()
    result.status =
      result.errors && result.errors.length > 0 ? 'failed' : 'completed'

    return result
  }

  // 等待恢复执行
  const waitForResume = (): Promise<void> => {
    return new Promise(resolve => {
      const checkStatus = () => {
        if (executionStatus.value === 'running' || executionStatus.value === 'idle') {
          resolve()
        } else {
          setTimeout(checkStatus, 100)
        }
      }
      checkStatus()
    })
  }

  // 构建执行图
  const buildExecutionGraph = (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
    const graph = new Map<string, string[]>()

    // 初始化节点
    nodes.forEach(node => {
      graph.set(node.id, [])
    })

    // 添加边
    edges.forEach(edge => {
      const targets = graph.get(edge.source) || []
      targets.push(edge.target)
      graph.set(edge.source, targets)
    })

    return graph
  }

  // 拓扑排序
  const topologicalSort = (nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] => {
    const inDegree = new Map<string, number>()
    const adjacencyList = new Map<string, string[]>()

    // 初始化
    nodes.forEach(node => {
      inDegree.set(node.id, 0)
      adjacencyList.set(node.id, [])
    })

    // 计算入度
    edges.forEach(edge => {
      const currentInDegree = inDegree.get(edge.target) || 0
      inDegree.set(edge.target, currentInDegree + 1)

      const adjacents = adjacencyList.get(edge.source) || []
      adjacents.push(edge.target)
      adjacencyList.set(edge.source, adjacents)
    })

    // 拓扑排序
    const queue: string[] = []
    const result: WorkflowNode[] = []

    // 找到所有入度为0的节点
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId)
      }
    })

    while (queue.length > 0) {
      const nodeId = queue.shift()!
      const node = nodes.find(n => n.id === nodeId)!
      result.push(node)

      const adjacents = adjacencyList.get(nodeId) || []
      adjacents.forEach(adjacentId => {
        const currentInDegree = inDegree.get(adjacentId) || 0
        inDegree.set(adjacentId, currentInDegree - 1)

        if (inDegree.get(adjacentId) === 0) {
          queue.push(adjacentId)
        }
      })
    }

    return result
  }

  // 执行单个节点
  const executeNode = async (
    node: WorkflowNode,
    _nodeResults: Map<string, any>
  ): Promise<any> => {
    // 模拟节点执行时间
    const executionTime = Math.random() * 1000 + 500
    await new Promise(resolve => setTimeout(resolve, executionTime))

    // 根据节点类型执行不同逻辑
    switch (node.type) {
      case 'input':
        return { type: 'input', data: node.data.config, timestamp: new Date() }

      case 'llm':
        // 模拟LLM调用
        const llmData = node.data as any // 临时类型断言，实际应该是AINodeData
        return {
          type: 'llm',
          prompt: llmData.prompt || '',
          response: `这是对输入的AI回复：${JSON.stringify(node.data.config)}`,
          model: llmData.model || 'gpt-4',
          timestamp: new Date()
        }

      case 'processor':
        // 模拟数据处理
        return {
          type: 'processor',
          processed: true,
          result: `处理结果：${JSON.stringify(node.data.config)}`,
          timestamp: new Date()
        }

      case 'condition':
        // 模拟条件判断
        const condition = Math.random() > 0.5
        return {
          type: 'condition',
          condition,
          result: condition ? 'true' : 'false',
          timestamp: new Date()
        }

      case 'output':
        return {
          type: 'output',
          final: true,
          result: 'workflow completed',
          timestamp: new Date()
        }

      default:
        return {
          type: 'unknown',
          result: 'no operation',
          timestamp: new Date()
        }
    }
  }

  return {
    // 只读状态
    executionStatus: readonly(executionStatus),
    executionResult: readonly(executionResult),
    executionProgress: readonly(executionProgress),
    currentExecutingNode: readonly(currentExecutingNode),
    executionError: readonly(executionError),

    // 计算属性
    isExecuting,
    canExecute,
    canPause,
    canResume,

    // 方法
    executeWorkflow,
    pauseExecution,
    resumeExecution,
    stopExecution,
    resetExecution,
    validateWorkflow,
  }
}
