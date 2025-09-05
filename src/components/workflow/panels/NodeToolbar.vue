<script setup lang="ts">
  import { ref } from 'vue'
  import type { NodeType, AINodeData, NodeData, ConditionNodeData, LoopNodeData, AggregateNodeData, ApiNodeData } from '@/types'

  interface NodeTemplate {
    id: string
    type: NodeType
    label: string
    icon: string
    description: string
    category: string
    defaultData: Partial<NodeData>
  }

  const emit = defineEmits<{
    'add-node': [template: NodeTemplate, position: { x: number; y: number }]
  }>()

  // 节点模板定义
  const nodeTemplates: NodeTemplate[] = [
    {
      id: 'input-node',
      type: 'input',
      label: '输入节点',
      icon: '📥',
      description: '工作流的起始点',
      category: '基础',
      defaultData: {
        label: '输入节点',
        config: {},
        status: 'idle',
      },
    },
    {
      id: 'llm-node',
      type: 'llm',
      label: 'LLM节点',
      icon: '🤖',
      description: '大语言模型处理',
      category: 'AI',
      defaultData: {
        label: 'AI处理',
        config: {},
        status: 'idle',
        prompt: '',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        provider: 'openai',
      } as AINodeData,
    },
    {
      id: 'processor-node',
      type: 'processor',
      label: '数据处理',
      icon: '⚙️',
      description: '数据转换和处理',
      category: '处理',
      defaultData: {
        label: '数据处理',
        config: {},
        status: 'idle',
      },
    },
    {
      id: 'condition-node',
      type: 'condition',
      label: '条件判断',
      icon: '🔀',
      description: '基于条件的分支',
      category: '逻辑',
      defaultData: {
        label: '条件判断',
        config: {},
        status: 'idle',
        condition: '',
      } as ConditionNodeData,
    },
    {
      id: 'loop-node',
      type: 'loop',
      label: '循环节点',
      icon: '🔄',
      description: '重复执行流程',
      category: '逻辑',
      defaultData: {
        label: '循环节点',
        config: {},
        status: 'idle',
        iterationType: 'count',
        maxIterations: 10,
      } as LoopNodeData,
    },
    {
      id: 'aggregate-node',
      type: 'aggregate',
      label: '聚合节点',
      icon: '📊',
      description: '数据聚合和统计',
      category: '处理',
      defaultData: {
        label: '聚合节点',
        config: {},
        status: 'idle',
        aggregationType: 'sum',
        inputFields: [],
        outputField: 'result',
      } as AggregateNodeData,
    },
    {
      id: 'api-node',
      type: 'api',
      label: 'API调用',
      icon: '🌐',
      description: 'HTTP API接口调用',
      category: '集成',
      defaultData: {
        label: 'API调用',
        config: {},
        status: 'idle',
        url: '',
        method: 'GET',
        timeout: 5000,
        retries: 0,
      } as ApiNodeData,
    },
    {
      id: 'output-node',
      type: 'output',
      label: '输出节点',
      icon: '📤',
      description: '工作流的终点',
      category: '基础',
      defaultData: {
        label: '输出节点',
        config: {},
        status: 'idle',
      },
    },
  ]

  // 按类别分组的节点
  const nodeCategories = ref([
    {
      name: '基础',
      nodes: nodeTemplates.filter(n => n.category === '基础'),
    },
    {
      name: 'AI',
      nodes: nodeTemplates.filter(n => n.category === 'AI'),
    },
    {
      name: '处理',
      nodes: nodeTemplates.filter(n => n.category === '处理'),
    },
    {
      name: '逻辑',
      nodes: nodeTemplates.filter(n => n.category === '逻辑'),
    },
    {
      name: '集成',
      nodes: nodeTemplates.filter(n => n.category === '集成'),
    },
  ])

  // 当前展开的类别
  const expandedCategories = ref<Set<string>>(new Set(['基础', 'AI', '处理', '逻辑', '集成']))

  // 拖拽状态
  const draggedNode = ref<NodeTemplate | null>(null)

  // 切换类别展开状态
  const toggleCategory = (categoryName: string) => {
    if (expandedCategories.value.has(categoryName)) {
      expandedCategories.value.delete(categoryName)
    } else {
      expandedCategories.value.add(categoryName)
    }
  }

  // 处理拖拽开始
  const handleDragStart = (event: DragEvent, template: NodeTemplate) => {
    draggedNode.value = template

    // 设置拖拽数据
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify(template))
      event.dataTransfer.effectAllowed = 'copy'
    }
  }

  // 处理拖拽结束
  const handleDragEnd = () => {
    draggedNode.value = null
  }

  // 添加节点到画布中心
  const addNodeToCenter = (template: NodeTemplate) => {
    // 默认在画布中心添加节点
    const centerPosition = { x: 400, y: 300 }
    emit('add-node', template, centerPosition)
  }
</script>

<template>
  <div class="node-toolbar">
    <div class="toolbar-header">
      <h3 class="toolbar-title">节点库</h3>
      <div class="toolbar-subtitle">拖拽或点击添加节点</div>
    </div>

    <div class="toolbar-content">
      <div v-for="category in nodeCategories" :key="category.name" class="node-category">
        <div class="category-header" @click="toggleCategory(category.name)">
          <span class="category-toggle">
            {{ expandedCategories.has(category.name) ? '▼' : '▶' }}
          </span>
          <span class="category-name">{{ category.name }}</span>
          <span class="category-count">({{ category.nodes.length }})</span>
        </div>

        <transition name="category-slide">
          <div v-if="expandedCategories.has(category.name)" class="category-nodes">
            <div
              v-for="template in category.nodes"
              :key="template.id"
              class="node-template"
              :class="{ 'node-template--dragging': draggedNode?.id === template.id }"
              draggable="true"
              @dragstart="handleDragStart($event, template)"
              @dragend="handleDragEnd"
              @click="addNodeToCenter(template)"
            >
              <div class="node-icon">{{ template.icon }}</div>
              <div class="node-info">
                <div class="node-label">{{ template.label }}</div>
                <div class="node-description">{{ template.description }}</div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .node-toolbar {
    width: 100%;
    height: 100%;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
  }

  .toolbar-header {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-background);
  }

  .toolbar-title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
  }

  .toolbar-subtitle {
    margin-top: var(--spacing-xs);
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .toolbar-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-sm);
  }

  .node-category {
    margin-bottom: var(--spacing-md);
  }

  .category-header {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm);
    background: var(--color-surface-hover);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: var(--transition-fast);
    user-select: none;
  }

  .category-header:hover {
    background: var(--color-border);
  }

  .category-toggle {
    width: 16px;
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    transition: var(--transition-fast);
  }

  .category-name {
    flex: 1;
    margin-left: var(--spacing-sm);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text);
  }

  .category-count {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .category-nodes {
    padding: var(--spacing-sm) 0;
  }

  .node-template {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);
    cursor: grab;
    transition: var(--transition-fast);
    user-select: none;
  }

  .node-template:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
    transform: translateX(2px);
  }

  .node-template:active {
    cursor: grabbing;
  }

  .node-template--dragging {
    opacity: 0.5;
    transform: rotate(5deg);
  }

  .node-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-lg);
    background: var(--color-surface);
    border-radius: var(--radius-md);
    margin-right: var(--spacing-sm);
  }

  .node-info {
    flex: 1;
    min-width: 0;
  }

  .node-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text);
    margin-bottom: 2px;
  }

  .node-description {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* 动画效果 */
  .category-slide-enter-active,
  .category-slide-leave-active {
    transition: all var(--transition-normal);
    overflow: hidden;
  }

  .category-slide-enter-from,
  .category-slide-leave-to {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }

  .category-slide-enter-to,
  .category-slide-leave-from {
    opacity: 1;
    max-height: 500px;
  }

  /* 滚动条样式 */
  .toolbar-content::-webkit-scrollbar {
    width: 6px;
  }

  .toolbar-content::-webkit-scrollbar-track {
    background: var(--color-surface);
  }

  .toolbar-content::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: var(--radius-full);
  }

  .toolbar-content::-webkit-scrollbar-thumb:hover {
    background: var(--color-text-muted);
  }
</style>
