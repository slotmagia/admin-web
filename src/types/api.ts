// API响应基础接口
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  error?: string
  timestamp: Date
}

// API错误接口
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: Date
}

// 分页参数接口
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 分页响应接口
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 工作流API接口
export interface WorkflowApi {
  list(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<WorkflowSummary>>>
  get(id: string): Promise<ApiResponse<Workflow>>
  create(workflow: CreateWorkflowRequest): Promise<ApiResponse<Workflow>>
  update(id: string, workflow: UpdateWorkflowRequest): Promise<ApiResponse<Workflow>>
  delete(id: string): Promise<ApiResponse<void>>
  execute(id: string, params?: ExecutionParams): Promise<ApiResponse<ExecutionResult>>
}

// 工作流摘要接口
export interface WorkflowSummary {
  id: string
  name: string
  description?: string
  version: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  isPublic: boolean
  nodeCount: number
  edgeCount: number
}

// 创建工作流请求接口
export interface CreateWorkflowRequest {
  name: string
  description?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  tags?: string[]
  isPublic?: boolean
}

// 更新工作流请求接口
export interface UpdateWorkflowRequest extends Partial<CreateWorkflowRequest> {
  version?: string
}

// 执行参数接口
export interface ExecutionParams {
  mode?: 'debug' | 'production' | 'preview'
  timeout?: number
  inputs?: Record<string, unknown>
}

// 导入这些类型以避免循环依赖
import type { Workflow, WorkflowNode, WorkflowEdge, ExecutionResult } from './workflow'
