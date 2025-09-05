import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type {
  WorkflowNode,
  WorkflowEdge,
  Workflow,
  ExecutionStatus,
  HistoryRecord,
  UndoRedoStack,
  ViewportState,
  SelectionState,
} from '@/types'

export const useWorkflowStore = defineStore('workflow', () => {
  // ===== 状态定义 =====
  const nodes = ref<WorkflowNode[]>([])
  const edges = ref<WorkflowEdge[]>([])
  const selectedElements = ref<SelectionState>({ nodes: [], edges: [] })
  const viewport = ref<ViewportState>({ x: 0, y: 0, zoom: 1 })
  const executionStatus = ref<ExecutionStatus>('idle')
  const currentWorkflow = ref<Workflow | null>(null)

  // 历史记录管理
  const history = ref<UndoRedoStack>({
    past: [],
    present: {
      id: '',
      action: 'add',
      timestamp: new Date(),
      data: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
    },
    future: [],
  })

  // ===== 计算属性 =====
  const selectedNodes = computed(() =>
    nodes.value.filter(node => selectedElements.value.nodes.includes(node.id))
  )

  const selectedEdges = computed(() =>
    edges.value.filter(edge => selectedElements.value.edges.includes(edge.id))
  )

  const workflowIsValid = computed(
    () => nodes.value.length > 0 && nodes.value.some(node => node.type === 'input')
  )

  const canUndo = computed(() => history.value.past.length > 0)
  const canRedo = computed(() => history.value.future.length > 0)

  const workflowStats = computed(() => ({
    nodeCount: nodes.value.length,
    edgeCount: edges.value.length,
    selectedCount: selectedElements.value.nodes.length + selectedElements.value.edges.length,
  }))

  // ===== Actions =====

  // 节点操作
  const addNode = (node: WorkflowNode) => {
    saveToHistory('add')
    nodes.value.push(node)
  }

  const addNodes = (newNodes: WorkflowNode[]) => {
    saveToHistory('add')
    nodes.value.push(...newNodes)
  }

  const removeNode = (nodeId: string) => {
    saveToHistory('delete')
    nodes.value = nodes.value.filter(node => node.id !== nodeId)
    edges.value = edges.value.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
    selectedElements.value.nodes = selectedElements.value.nodes.filter(id => id !== nodeId)
  }

  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    saveToHistory('update')
    const nodeIndex = nodes.value.findIndex(node => node.id === nodeId)
    if (nodeIndex !== -1) {
      nodes.value[nodeIndex] = { ...nodes.value[nodeIndex], ...updates }
    }
  }

  const updateNodeData = (nodeId: string, data: Partial<WorkflowNode['data']>) => {
    const nodeIndex = nodes.value.findIndex(node => node.id === nodeId)
    if (nodeIndex !== -1) {
      nodes.value[nodeIndex].data = { ...nodes.value[nodeIndex].data, ...data }
    }
  }

  // 连线操作
  const addEdge = (edge: WorkflowEdge) => {
    saveToHistory('add')
    edges.value.push(edge)
  }

  const addEdges = (newEdges: WorkflowEdge[]) => {
    saveToHistory('add')
    edges.value.push(...newEdges)
  }

  const removeEdge = (edgeId: string) => {
    saveToHistory('delete')
    edges.value = edges.value.filter(edge => edge.id !== edgeId)
    selectedElements.value.edges = selectedElements.value.edges.filter(id => id !== edgeId)
  }

  const updateEdge = (edgeId: string, updates: Partial<WorkflowEdge>) => {
    saveToHistory('update')
    const edgeIndex = edges.value.findIndex(edge => edge.id === edgeId)
    if (edgeIndex !== -1) {
      edges.value[edgeIndex] = { ...edges.value[edgeIndex], ...updates }
    }
  }

  // 选择操作
  const selectNode = (nodeId: string, multi = false) => {
    if (multi) {
      if (!selectedElements.value.nodes.includes(nodeId)) {
        selectedElements.value.nodes.push(nodeId)
      }
    } else {
      selectedElements.value.nodes = [nodeId]
      selectedElements.value.edges = []
    }
  }

  const selectEdge = (edgeId: string, multi = false) => {
    if (multi) {
      if (!selectedElements.value.edges.includes(edgeId)) {
        selectedElements.value.edges.push(edgeId)
      }
    } else {
      selectedElements.value.edges = [edgeId]
      selectedElements.value.nodes = []
    }
  }

  const clearSelection = () => {
    selectedElements.value = { nodes: [], edges: [] }
  }

  const selectAll = () => {
    selectedElements.value = {
      nodes: nodes.value.map(node => node.id),
      edges: edges.value.map(edge => edge.id),
    }
  }

  // 视口操作
  const updateViewport = (newViewport: Partial<ViewportState>) => {
    viewport.value = { ...viewport.value, ...newViewport }
  }

  // 历史记录操作
  const saveToHistory = (action: HistoryRecord['action']) => {
    const record: HistoryRecord = {
      id: Date.now().toString(),
      action,
      timestamp: new Date(),
      data: {
        nodes: [...nodes.value],
        edges: [...edges.value],
        viewport: { ...viewport.value },
      },
    }

    history.value.past.push(history.value.present)
    history.value.present = record
    history.value.future = []

    // 限制历史记录数量
    if (history.value.past.length > 50) {
      history.value.past.shift()
    }
  }

  const undo = () => {
    if (canUndo.value) {
      history.value.future.unshift(history.value.present)
      const previousRecord = history.value.past.pop()!
      history.value.present = previousRecord

      // 恢复状态
      if (previousRecord.data.nodes) {
        nodes.value = [...previousRecord.data.nodes]
      }
      if (previousRecord.data.edges) {
        edges.value = [...previousRecord.data.edges]
      }
      if (previousRecord.data.viewport) {
        viewport.value = { ...previousRecord.data.viewport }
      }
    }
  }

  const redo = () => {
    if (canRedo.value) {
      history.value.past.push(history.value.present)
      const nextRecord = history.value.future.shift()!
      history.value.present = nextRecord

      // 恢复状态
      if (nextRecord.data.nodes) {
        nodes.value = [...nextRecord.data.nodes]
      }
      if (nextRecord.data.edges) {
        edges.value = [...nextRecord.data.edges]
      }
      if (nextRecord.data.viewport) {
        viewport.value = { ...nextRecord.data.viewport }
      }
    }
  }

  // 工作流操作
  const loadWorkflow = (workflow: Workflow) => {
    currentWorkflow.value = workflow
    nodes.value = [...workflow.nodes]
    edges.value = [...workflow.edges]
    clearSelection()
    // 重置历史记录
    history.value = {
      past: [],
      present: {
        id: Date.now().toString(),
        action: 'add',
        timestamp: new Date(),
        data: { nodes: [...workflow.nodes], edges: [...workflow.edges] },
      },
      future: [],
    }
  }

  const clearWorkflow = () => {
    nodes.value = []
    edges.value = []
    clearSelection()
    currentWorkflow.value = null
    executionStatus.value = 'idle'
    viewport.value = { x: 0, y: 0, zoom: 1 }
  }

  const exportWorkflow = (): Workflow => {
    const workflow: Workflow = {
      id: currentWorkflow.value?.id || Date.now().toString(),
      name: currentWorkflow.value?.name || 'Untitled Workflow',
      ...(currentWorkflow.value?.description && { description: currentWorkflow.value.description }),
      nodes: [...nodes.value],
      edges: [...edges.value],
      version: '1.0.0',
      createdAt: currentWorkflow.value?.createdAt || new Date(),
      updatedAt: new Date(),
      tags: currentWorkflow.value?.tags || [],
      isPublic: currentWorkflow.value?.isPublic || false,
    }
    return workflow
  }

  // 执行状态管理
  const setExecutionStatus = (status: ExecutionStatus) => {
    executionStatus.value = status
  }

  // ===== 返回API =====
  return {
    // 只读状态
    nodes: readonly(nodes),
    edges: readonly(edges),
    selectedElements: readonly(selectedElements),
    viewport: readonly(viewport),
    executionStatus: readonly(executionStatus),
    currentWorkflow: readonly(currentWorkflow),

    // 计算属性
    selectedNodes,
    selectedEdges,
    workflowIsValid,
    canUndo,
    canRedo,
    workflowStats,

    // 方法
    addNode,
    addNodes,
    removeNode,
    updateNode,
    updateNodeData,
    addEdge,
    addEdges,
    removeEdge,
    updateEdge,
    selectNode,
    selectEdge,
    clearSelection,
    selectAll,
    updateViewport,
    undo,
    redo,
    loadWorkflow,
    clearWorkflow,
    exportWorkflow,
    setExecutionStatus,
  }
})
