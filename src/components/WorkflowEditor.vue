<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { VueFlow, useVueFlow, Panel } from '@vue-flow/core'
  import { useWorkflowStore } from '@/stores/workflow'
  import { useUIStore } from '@/stores/ui'
  import NodeToolbar from './workflow/panels/NodeToolbar.vue'
  import ExecutionPanel from './workflow/panels/ExecutionPanel.vue'
  import LLMNode from './workflow/nodes/LLMNode.vue'
  import ConditionNode from './workflow/nodes/ConditionNode.vue'
  import LoopNode from './workflow/nodes/LoopNode.vue'
  import ApiNode from './workflow/nodes/ApiNode.vue'
  import AggregateNode from './workflow/nodes/AggregateNode.vue'
  import type { NodeType, AINodeData, WorkflowNode, WorkflowEdge } from '@/types'

  // 初始化Vue Flow
  const { addNodes, addEdges, onConnect, screenToFlowCoordinate } = useVueFlow()
  
  // 声明store变量
  let workflowStore: ReturnType<typeof useWorkflowStore>
  let uiStore: ReturnType<typeof useUIStore>

  // 画布容器引用
  const vueFlowWrapper = ref<HTMLElement>()

  // 生成唯一ID
  const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const generateEdgeId = () => `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // 示例数据
  const initialNodes = [
    {
      id: '1',
      type: 'input',
      position: { x: 250, y: 25 },
      data: {
        label: '开始节点',
        config: {},
        status: 'idle'
      }
    },
    {
      id: '2',
      type: 'llm',
      position: { x: 100, y: 125 },
      data: {
        label: 'AI处理节点',
        config: {},
        status: 'idle',
        prompt: '请分析以下内容...',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        provider: 'openai'
      } as AINodeData
    }
  ]

  const initialEdges: WorkflowEdge[] = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'default' as const
    }
  ]

  // 处理拖拽添加节点
  const handleDrop = (event: DragEvent) => {
    event.preventDefault()

    if (!event.dataTransfer) return

    try {
      const templateData = event.dataTransfer.getData('application/json')
      const template = JSON.parse(templateData)

      // 将屏幕坐标转换为流程图坐标
      const position = screenToFlowCoordinate({
        x: event.clientX,
        y: event.clientY
      })

      createNodeFromTemplate(template, position)
    } catch (error) {
      console.error('Failed to add node from drop:', error)
    }
  }

  // 从模板创建节点
  const createNodeFromTemplate = (template: any, position: { x: number; y: number }) => {
    if (!workflowStore) return

    const newNode: WorkflowNode = {
      id: generateId(),
      type: template.type as NodeType,
      position,
      data: {
        ...template.defaultData,
        label: template.label
      }
    }

    addNodes([newNode])
    workflowStore.addNode(newNode)
  }

  // 处理从工具栏添加节点
  const handleAddNode = (template: any, position: { x: number; y: number }) => {
    createNodeFromTemplate(template, position)
  }

  // 防止默认拖拽行为
  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy'
    }
  }

  // 处理节点数据更新
  const handleNodeDataUpdate = (nodeId: string, newData: any) => {
    if (!workflowStore) return
    workflowStore.updateNode(nodeId, { data: newData })
  }

  // 处理节点点击
  const handleNodeClick = (nodeId: string) => {
    if (!workflowStore) return
    workflowStore.selectNode(nodeId)
  }

  // 连接处理
  onConnect(params => {
    if (!workflowStore) return

    const edge: WorkflowEdge = {
      id: generateEdgeId(),
      source: params.source,
      target: params.target,
      type: 'default' as const,
      ...(params.sourceHandle && { sourceHandle: params.sourceHandle }),
      ...(params.targetHandle && { targetHandle: params.targetHandle })
    }
    addEdges([edge])
    workflowStore.addEdge(edge)
  })

  // 组件挂载时初始化
  onMounted(() => {
    // 初始化stores
    workflowStore = useWorkflowStore()
    uiStore = useUIStore()

    // 添加示例节点
    addNodes(initialNodes)
    addEdges(initialEdges)

    // 同步到状态管理
    workflowStore.addNodes(initialNodes as WorkflowNode[])
    workflowStore.addEdges(initialEdges)
  })
</script>

<template>
  <div class="workflow-editor">
    <!-- 侧边栏 -->
    <div
      v-if="!uiStore || !uiStore.sidebarCollapsed"
      class="sidebar"
      :style="{ width: `${uiStore?.layoutConfig.sidebarWidth || 280}px` }"
    >
      
      
      <div style="border: 2px solid blue; margin: 10px;">
        <NodeToolbar @add-node="handleAddNode" />
      </div>
    </div>

    <!-- 主编辑区域 -->
    <div class="editor-main">
      <!-- 顶部工具栏 -->
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <button
            v-if="uiStore"
            @click="uiStore.toggleSidebar()"
            class="toolbar-button"
            :title="uiStore.sidebarCollapsed ? '显示侧边栏' : '隐藏侧边栏'"
          >
            {{ uiStore.sidebarCollapsed ? '☰' : '✕' }}
          </button>
          <button
            v-else
            class="toolbar-button"
            disabled
            title="加载中..."
          >
            ☰
          </button>

          <div class="toolbar-separator"></div>

          <button
            class="toolbar-button"
            :disabled="!workflowStore?.canUndo"
            @click="workflowStore?.undo()"
            title="撤销"
          >
            ↶
          </button>
          <button
            class="toolbar-button"
            :disabled="!workflowStore?.canRedo"
            @click="workflowStore?.redo()"
            title="重做"
          >
            ↷
          </button>

          <div class="toolbar-separator"></div>

          <button class="toolbar-button" title="运行工作流">▶️</button>
          <button class="toolbar-button" title="停止">⏹️</button>
        </div>

        <div class="toolbar-center">
          <div class="workflow-info">
            <span class="workflow-stats">
              节点: {{ workflowStore?.workflowStats.nodeCount || 0 }} | 连线:
              {{ workflowStore?.workflowStats.edgeCount || 0 }}
            </span>
          </div>
        </div>

        <div class="toolbar-right">
          <button class="toolbar-button" title="适应视图">🎯</button>
          <button class="toolbar-button" title="缩放重置">🔍</button>
          <button
            v-if="uiStore"
            @click="uiStore.togglePropertiesPanel()"
            class="toolbar-button"
            :title="uiStore.propertiesPanelCollapsed ? '显示属性面板' : '隐藏属性面板'"
          >
            {{ uiStore.propertiesPanelCollapsed ? '📋' : '✕' }}
          </button>
          <button
            v-if="uiStore"
            @click="uiStore.toggleFullscreen()"
            class="toolbar-button"
            title="全屏"
          >
            ⛶
          </button>
        </div>
      </div>

      <!-- Vue Flow 画布 -->
      <div
        ref="vueFlowWrapper"
        class="vue-flow-wrapper"
        @drop="handleDrop"
        @dragover="handleDragOver"
      >
        <VueFlow 
          fit-view-on-init 
          class="vue-flow-container"
        >
          <!-- 自定义节点模板 -->
          <template #node-input="props">
            <div class="custom-node input-node">
              <div class="node-content">📥 {{ props.data.label }}</div>
            </div>
          </template>

          <template #node-llm="props">
            <LLMNode
              :id="props.id"
              :data="props.data"
              :selected="props.selected"
              @update:data="handleNodeDataUpdate(props.id, $event)"
              @node-click="handleNodeClick"
            />
          </template>

          <template #node-condition="props">
            <ConditionNode
              :id="props.id"
              :data="props.data"
              :selected="props.selected"
              @update:data="handleNodeDataUpdate(props.id, $event)"
              @node-click="handleNodeClick"
            />
          </template>

          <template #node-loop="props">
            <LoopNode
              :id="props.id"
              :data="props.data"
              :selected="props.selected"
              @update:data="handleNodeDataUpdate(props.id, $event)"
              @node-click="handleNodeClick"
            />
          </template>

          <template #node-api="props">
            <ApiNode
              :id="props.id"
              :data="props.data"
              :selected="props.selected"
              @update:data="handleNodeDataUpdate(props.id, $event)"
              @node-click="handleNodeClick"
            />
          </template>

          <template #node-aggregate="props">
            <AggregateNode
              :id="props.id"
              :data="props.data"
              :selected="props.selected"
              @update:data="handleNodeDataUpdate(props.id, $event)"
              @node-click="handleNodeClick"
            />
          </template>

          <template #node-default="props">
            <div class="custom-node default-node">
              <div class="node-content">⚙️ {{ props.data.label }}</div>
            </div>
          </template>

          <template #node-output="props">
            <div class="custom-node output-node">
              <div class="node-content">📤 {{ props.data.label }}</div>
            </div>
          </template>

          <!-- 自定义面板 -->
          <Panel position="top-right" class="workflow-panel">
            <div class="panel-content">
              <div class="panel-title">工作流控制</div>
              <div class="panel-buttons">
                <button class="panel-button primary">保存</button>
                <button class="panel-button">导出</button>
              </div>
            </div>
          </Panel>
        </VueFlow>
      </div>
    </div>

    <!-- 右侧属性面板 -->
    <div
      v-if="!uiStore || !uiStore.propertiesPanelCollapsed"
      class="properties-panel"
      :style="{ width: `${uiStore?.layoutConfig.propertiesPanelWidth || 320}px` }"
    >
      <ExecutionPanel />
    </div>
  </div>
</template>

<style scoped>
  .workflow-editor {
    width: 100%;
    height: 100%;
    display: flex;
    background: var(--color-background);
  }

  .sidebar {
    height: 100%;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    overflow: hidden;
    transition: width var(--transition-normal);
  }

  .editor-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .editor-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    height: 48px;
  }

  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .toolbar-center {
    flex: 1;
    justify-content: center;
  }

  .toolbar-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
    transition: var(--transition-fast);
    font-size: var(--font-size-sm);
  }

  .toolbar-button:hover {
    background: var(--color-surface-hover);
    color: var(--color-primary);
  }

  .toolbar-separator {
    width: 1px;
    height: 20px;
    background: var(--color-border);
    margin: 0 var(--spacing-xs);
  }

  .workflow-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .workflow-stats {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .vue-flow-wrapper {
    flex: 1;
    position: relative;
  }

  .vue-flow-container {
    width: 100%;
    height: 100%;
    background: var(--vf-background);
  }

  .custom-node {
    background: var(--vf-node-bg);
    border: 2px solid var(--vf-node-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    min-width: 150px;
    padding: var(--spacing-md);
    transition: var(--transition-fast);
  }

  .custom-node:hover {
    box-shadow: var(--shadow-lg);
  }

  .input-node {
    border-color: var(--color-success);
  }

  .default-node {
    border-color: var(--color-primary);
  }

  .output-node {
    border-color: var(--color-warning);
  }

  .node-content {
    color: var(--vf-node-text);
    font-weight: var(--font-weight-medium);
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
  }

  /* Vue Flow 面板样式 */
  .workflow-panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  .panel-content {
    padding: var(--spacing-md);
  }

  .panel-title {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--spacing-sm);
  }

  .panel-buttons {
    display: flex;
    gap: var(--spacing-sm);
  }

  .panel-button {
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-background);
    color: var(--color-text);
    font-size: var(--font-size-xs);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .panel-button:hover {
    background: var(--color-surface-hover);
  }

  .panel-button.primary {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-text-inverse);
  }

  .panel-button.primary:hover {
    background: var(--color-primary-hover);
  }

  .properties-panel {
    height: 100%;
    background: var(--color-surface);
    border-left: 1px solid var(--color-border);
    overflow: hidden;
    transition: width var(--transition-normal);
  }

  /* 拖拽时的样式 */
  .vue-flow-wrapper[data-dragging='true'] {
    cursor: copy;
  }

  .vue-flow-wrapper[data-dragging='true'] .vue-flow-container {
    pointer-events: none;
  }
</style>
