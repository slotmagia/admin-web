import type { Node as VueFlowNode, Edge as VueFlowEdge } from '@vue-flow/core'

// 重导出Position以便其他文件使用
export type { Position } from '@vue-flow/core'

// 节点类型枚举
export type NodeType = 'input' | 'output' | 'llm' | 'processor' | 'condition' | 'custom' | 'loop' | 'aggregate' | 'api' | 'http'

// 节点状态枚举  
export type NodeStatus = 'idle' | 'running' | 'success' | 'error' | 'warning'

// 执行状态枚举
export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed'

// 基础节点数据结构
export interface NodeData {
  label: string
  config: Record<string, any>
  status?: NodeStatus
  error?: string
  description?: string
}

// AI节点特定数据
export interface AINodeData extends NodeData {
  prompt: string
  model: string
  temperature?: number
  maxTokens?: number
  provider: 'openai' | 'anthropic' | 'local'
}

// 条件节点特定数据
export interface ConditionNodeData extends NodeData {
  condition: string
  truePath?: string
  falsePath?: string
}

// 循环节点特定数据
export interface LoopNodeData extends NodeData {
  iterationType: 'count' | 'condition' | 'array'
  maxIterations?: number
  condition?: string
  arrayPath?: string
  currentIteration?: number
}

// 聚合节点特定数据
export interface AggregateNodeData extends NodeData {
  aggregationType: 'sum' | 'average' | 'count' | 'max' | 'min' | 'concat' | 'merge'
  inputFields: string[]
  outputField: string
  groupBy?: string
}

// API调用节点特定数据
export interface ApiNodeData extends NodeData {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  requestBody?: string
  responseMapping?: Record<string, string>
  timeout?: number
  retries?: number
}

// HTTP节点特定数据 (API节点的简化版本)
export interface HttpNodeData extends NodeData {
  url: string
  method: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: string
}

// 工作流节点类型 - 继承Vue Flow的Node但覆盖data和type字段
export type WorkflowNode = Omit<VueFlowNode, 'data' | 'type'> & {
  type: NodeType
  data: NodeData | AINodeData | ConditionNodeData | LoopNodeData | AggregateNodeData | ApiNodeData | HttpNodeData
}

// 工作流边类型 - 继承Vue Flow的Edge
export type WorkflowEdge = VueFlowEdge

// 工作流定义
export interface Workflow {
  id: string
  name: string
  description?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  version: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  isPublic: boolean
}

// 执行结果
export interface ExecutionResult {
  workflowId: string
  status: ExecutionStatus
  startTime: Date
  endTime?: Date
  duration?: number
  results: Record<string, any>
  errors?: ExecutionError[]
}

// 执行错误
export interface ExecutionError {
  nodeId: string
  message: string
  timestamp: Date
}

// 工作流模板
export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>
  previewImage?: string
  tags: string[]
}

// 视口状态
export interface ViewportState {
  x: number
  y: number
  zoom: number
}

// 选择状态
export interface SelectionState {
  nodes: string[]
  edges: string[]
}

// 历史记录
export interface HistoryRecord {
  id: string
  action: 'add' | 'delete' | 'update' | 'move'
  timestamp: Date
  data: {
    nodes?: WorkflowNode[]
    edges?: WorkflowEdge[]
    viewport?: ViewportState
  }
}

// 撤销重做栈
export interface UndoRedoStack {
  past: HistoryRecord[]
  present: HistoryRecord
  future: HistoryRecord[]
}
