# Vue-Flow AI工作流编辑器开发规范

## 📋 目录

1. [总体架构规范](#总体架构规范)
2. [代码编写规范](#代码编写规范)
3. [组件开发规范](#组件开发规范)
4. [状态管理规范](#状态管理规范)
5. [样式开发规范](#样式开发规范)
6. [测试开发规范](#测试开发规范)
7. [性能优化规范](#性能优化规范)
8. [安全开发规范](#安全开发规范)
9. [文档编写规范](#文档编写规范)
10. [版本控制规范](#版本控制规范)

---

## 🏗️ 总体架构规范

### 1. 技术栈标准

#### 必须使用的技术
- **前端框架**: Vue 3.5+ (Composition API)
- **工作流引擎**: @vue-flow/core ^1.45.0
- **构建工具**: Vite 7.0+
- **包管理器**: npm (统一使用npm，禁止混用yarn/pnpm)
- **TypeScript**: 5.0+ (强制使用，禁止JavaScript)

#### 推荐使用的技术
- **状态管理**: Pinia 2.0+
- **HTTP客户端**: Axios 或 原生 fetch
- **UI组件库**: 自定义组件 + Headless UI
- **图标库**: Heroicons 或 Tabler Icons
- **动画库**: Vue Transition API + CSS动画

### 2. 项目结构规范

```
ai-workflow-editor/
├── src/
│   ├── components/           # 可复用组件
│   │   ├── base/            # 基础UI组件
│   │   ├── workflow/        # 工作流相关组件
│   │   │   ├── nodes/       # 节点组件
│   │   │   ├── edges/       # 连线组件
│   │   │   └── panels/      # 面板组件
│   │   └── common/          # 通用业务组件
│   ├── composables/         # 组合式函数
│   │   ├── useWorkflow.ts   # 工作流逻辑
│   │   ├── useExecution.ts  # 执行引擎
│   │   └── useCollaboration.ts # 协作功能
│   ├── stores/              # Pinia状态管理
│   │   ├── workflow.ts      # 工作流状态
│   │   ├── execution.ts     # 执行状态
│   │   └── ui.ts           # UI状态
│   ├── types/               # TypeScript类型定义
│   │   ├── workflow.ts      # 工作流类型
│   │   ├── nodes.ts         # 节点类型
│   │   └── api.ts          # API类型
│   ├── utils/               # 工具函数
│   ├── services/            # API服务
│   ├── plugins/             # Vue插件
│   └── assets/              # 静态资源
├── tests/                   # 测试文件
│   ├── unit/               # 单元测试
│   ├── integration/        # 集成测试
│   └── e2e/               # 端到端测试
├── docs/                   # 文档
│   ├── api/               # API文档
│   ├── components/        # 组件文档
│   └── guides/           # 开发指南
└── public/                # 公共资源
```

### 3. 模块化设计原则

#### 组件职责分离
- **业务组件**: 处理具体业务逻辑
- **展示组件**: 纯UI展示，无业务逻辑
- **容器组件**: 数据获取和状态管理
- **布局组件**: 页面布局和结构

#### 依赖注入原则
```typescript
// ✅ 正确：通过props传递依赖
interface NodeProps {
  executionService: ExecutionService
  validationService: ValidationService
}

// ❌ 错误：组件内部硬编码依赖
import { executionService } from '@/services/execution'
```

---

## 💻 代码编写规范

### 1. TypeScript规范

#### 类型定义要求
```typescript
// ✅ 必须：完整的接口定义
interface WorkflowNode {
  id: string
  type: NodeType
  position: Position
  data: NodeData
  selected?: boolean
  dragging?: boolean
}

// ✅ 必须：泛型约束
interface NodeComponent<T extends NodeData = NodeData> {
  data: T
  selected: boolean
  onDataChange: (data: T) => void
}

// ❌ 禁止：使用any类型
const nodeData: any = { ... }

// ✅ 正确：使用unknown并进行类型收窄
const nodeData: unknown = { ... }
if (isNodeData(nodeData)) {
  // 类型安全的操作
}
```

#### 类型导出规范
```typescript
// types/workflow.ts
export interface Node { ... }
export interface Edge { ... }
export type NodeType = 'input' | 'output' | 'processor'

// ✅ 统一从index.ts导出
// types/index.ts
export * from './workflow'
export * from './nodes'
export * from './edges'
```

### 2. Vue 3 Composition API规范

#### 组合式函数编写
```typescript
// ✅ 正确的组合式函数结构
export function useWorkflowExecution() {
  // 1. 响应式状态
  const isExecuting = ref(false)
  const executionResult = ref<ExecutionResult | null>(null)
  
  // 2. 计算属性
  const canExecute = computed(() => !isExecuting.value && nodes.value.length > 0)
  
  // 3. 方法
  const executeWorkflow = async () => {
    isExecuting.value = true
    try {
      // 执行逻辑
    } finally {
      isExecuting.value = false
    }
  }
  
  // 4. 生命周期
  onMounted(() => {
    // 初始化逻辑
  })
  
  onUnmounted(() => {
    // 清理逻辑
  })
  
  // 5. 返回API
  return {
    // 状态
    isExecuting: readonly(isExecuting),
    executionResult: readonly(executionResult),
    // 计算属性
    canExecute,
    // 方法
    executeWorkflow
  }
}
```

#### 组件结构规范
```vue
<script setup lang="ts">
// 1. 导入（按类型分组）
import type { PropType } from 'vue'
import { ref, computed, onMounted } from 'vue'
import { useVueFlow } from '@vue-flow/core'

// 2. Props定义
interface Props {
  nodeId: string
  nodeType: NodeType
  nodeData: NodeData
}

const props = withDefaults(defineProps<Props>(), {
  nodeType: 'default'
})

// 3. Emits定义
interface Emits {
  'node-click': [nodeId: string]
  'data-change': [data: NodeData]
}

const emit = defineEmits<Emits>()

// 4. 组合式函数使用
const { getNode, updateNodeData } = useVueFlow()

// 5. 响应式状态
const isSelected = ref(false)
const nodeElement = ref<HTMLElement>()

// 6. 计算属性
const nodeClasses = computed(() => ({
  'node-selected': isSelected.value,
  [`node-${props.nodeType}`]: true
}))

// 7. 方法
const handleClick = () => {
  emit('node-click', props.nodeId)
}

// 8. 生命周期
onMounted(() => {
  // 初始化
})
</script>

<template>
  <!-- 模板内容 -->
</template>

<style scoped>
/* 样式 */
</style>
```

### 3. 命名规范

#### 文件命名
- **组件文件**: PascalCase (`WorkflowEditor.vue`)
- **工具文件**: camelCase (`nodeUtils.ts`)
- **类型文件**: camelCase (`workflow.types.ts`)
- **常量文件**: camelCase (`constants.ts`)

#### 变量命名
```typescript
// ✅ 响应式状态：描述性名词
const selectedNodes = ref<Node[]>([])
const executionStatus = ref<ExecutionStatus>('idle')

// ✅ 计算属性：形容词或is/has/can开头
const isExecuting = computed(() => executionStatus.value === 'running')
const canSaveWorkflow = computed(() => workflow.value.nodes.length > 0)

// ✅ 方法：动词开头
const executeWorkflow = async () => { ... }
const validateNode = (node: Node) => { ... }

// ✅ 事件处理：handle开头
const handleNodeClick = (event: Event) => { ... }
const handleEdgeConnect = (params: Connection) => { ... }
```

#### 组件命名
```typescript
// ✅ 业务组件：功能+组件类型
WorkflowEditor.vue
NodeConfigPanel.vue
ExecutionStatusBar.vue

// ✅ 基础组件：Base前缀
BaseButton.vue
BaseModal.vue
BaseInput.vue

// ✅ 布局组件：Layout前缀
LayoutSidebar.vue
LayoutHeader.vue
```

---

## 🧩 组件开发规范

### 1. Vue-Flow组件集成规范

#### 节点组件开发
```vue
<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'

interface CustomNodeData {
  label: string
  config: Record<string, any>
}

interface Props extends NodeProps<CustomNodeData> {
  // 额外的props
}

const props = defineProps<Props>()

// ✅ 使用vue-flow的类型安全方式
const handleStyle = { background: '#555' }
const targetHandleStyle = { background: '#555' }
</script>

<template>
  <div class="custom-node">
    <!-- ✅ 必须：输入连接点 -->
    <Handle
      id="input"
      type="target"
      :position="Position.Left"
      :style="targetHandleStyle"
    />
    
    <!-- 节点内容 -->
    <div class="node-content">
      {{ props.data.label }}
    </div>
    
    <!-- ✅ 必须：输出连接点 -->
    <Handle
      id="output"
      type="source"
      :position="Position.Right"
      :style="handleStyle"
    />
  </div>
</template>
```

#### 连线组件开发
```vue
<script setup lang="ts">
import { EdgeProps, getBezierPath } from '@vue-flow/core'

interface Props extends EdgeProps {
  // 自定义属性
}

const props = defineProps<Props>()

// ✅ 计算连线路径
const path = computed(() => {
  const [edgePath] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  })
  return edgePath
})
</script>

<template>
  <path
    :d="path"
    :style="{ stroke: props.style?.stroke || '#b1b1b7' }"
    class="vue-flow__edge-path"
    fill="none"
    stroke-width="2"
  />
</template>
```

### 2. 组件Props规范

#### Props定义标准
```typescript
// ✅ 使用interface定义Props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  onClick?: (event: MouseEvent) => void
}

// ✅ 提供默认值
const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  loading: false
})

// ❌ 避免：过多的可选属性
interface BadProps {
  prop1?: string
  prop2?: number
  prop3?: boolean
  // ... 超过10个可选属性
}
```

#### Props验证
```typescript
// ✅ 复杂类型验证
interface NodeData {
  type: NodeType
  config: NodeConfig
}

const isValidNodeData = (data: unknown): data is NodeData => {
  return typeof data === 'object' && 
         data !== null && 
         'type' in data && 
         'config' in data
}
```

### 3. 组件事件规范

#### 事件定义
```typescript
// ✅ 明确的事件类型定义
interface ComponentEmits {
  'update:modelValue': [value: string]
  'node-select': [nodeId: string, event: MouseEvent]
  'edge-create': [params: Connection]
  'workflow-execute': [workflowId: string]
}

const emit = defineEmits<ComponentEmits>()

// ✅ 事件调用
const handleNodeClick = (event: MouseEvent) => {
  emit('node-select', props.nodeId, event)
}
```

#### 事件命名规范
- 使用kebab-case命名
- 动词-名词结构：`node-select`, `edge-create`
- 状态变化：`update:modelValue`, `change`
- 用户交互：`click`, `hover`, `focus`

---

## 🗄️ 状态管理规范

### 1. Pinia Store结构

#### Store定义标准
```typescript
// stores/workflow.ts
export const useWorkflowStore = defineStore('workflow', () => {
  // 1. 状态定义
  const nodes = ref<Node[]>([])
  const edges = ref<Edge[]>([])
  const selectedElements = ref<string[]>([])
  
  // 2. Getters（计算属性）
  const selectedNodes = computed(() => 
    nodes.value.filter(node => selectedElements.value.includes(node.id))
  )
  
  const workflowIsValid = computed(() => 
    nodes.value.length > 0 && edges.value.length > 0
  )
  
  // 3. Actions
  const addNode = (node: Node) => {
    nodes.value.push(node)
  }
  
  const removeNode = (nodeId: string) => {
    nodes.value = nodes.value.filter(node => node.id !== nodeId)
    edges.value = edges.value.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    )
  }
  
  const selectNode = (nodeId: string, multi = false) => {
    if (multi) {
      selectedElements.value.push(nodeId)
    } else {
      selectedElements.value = [nodeId]
    }
  }
  
  // 4. 异步Actions
  const saveWorkflow = async (workflow: Workflow) => {
    try {
      await workflowService.save(workflow)
      // 成功处理
    } catch (error) {
      // 错误处理
      throw error
    }
  }
  
  // 5. 返回API
  return {
    // 状态
    nodes: readonly(nodes),
    edges: readonly(edges),
    selectedElements: readonly(selectedElements),
    // 计算属性
    selectedNodes,
    workflowIsValid,
    // 方法
    addNode,
    removeNode,
    selectNode,
    saveWorkflow
  }
})
```

### 2. 状态同步规范

#### Vue-Flow状态绑定
```vue
<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'
import { useWorkflowStore } from '@/stores/workflow'

const { nodes, edges, onNodesChange, onEdgesChange } = useVueFlow()
const workflowStore = useWorkflowStore()

// ✅ 双向同步
watch(
  () => workflowStore.nodes,
  (newNodes) => {
    nodes.value = newNodes
  },
  { deep: true }
)

// ✅ 监听vue-flow变化
onNodesChange((changes) => {
  workflowStore.applyNodeChanges(changes)
})

onEdgesChange((changes) => {
  workflowStore.applyEdgeChanges(changes)
})
</script>
```

### 3. 状态持久化规范

```typescript
// composables/usePersistence.ts
export function useWorkflowPersistence() {
  const workflowStore = useWorkflowStore()
  
  // ✅ 自动保存
  const { pause, resume } = watchPausable(
    () => workflowStore.$state,
    (state) => {
      localStorage.setItem('workflow-draft', JSON.stringify(state))
    },
    { debounce: 1000, deep: true }
  )
  
  // ✅ 恢复状态
  const restoreWorkflow = () => {
    const saved = localStorage.getItem('workflow-draft')
    if (saved) {
      const state = JSON.parse(saved)
      workflowStore.$patch(state)
    }
  }
  
  return {
    pause,
    resume,
    restoreWorkflow
  }
}
```

---

## 🎨 样式开发规范

### 1. CSS架构规范

#### 样式组织结构
```scss
// styles/
├── base/
│   ├── _reset.scss        # CSS重置
│   ├── _typography.scss   # 字体排版
│   └── _variables.scss    # CSS变量
├── components/
│   ├── _buttons.scss      # 按钮样式
│   ├── _forms.scss        # 表单样式
│   └── _nodes.scss        # 节点样式
├── layout/
│   ├── _grid.scss         # 网格系统
│   └── _containers.scss   # 容器布局
├── themes/
│   ├── _light.scss        # 亮色主题
│   └── _dark.scss         # 暗色主题
└── main.scss              # 主入口文件
```

#### CSS变量规范
```scss
// ✅ 语义化变量命名
:root {
  // 颜色系统
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-primary-active: #1d4ed8;
  
  // 间距系统
  --spacing-xs: 0.25rem;    // 4px
  --spacing-sm: 0.5rem;     // 8px
  --spacing-md: 1rem;       // 16px
  --spacing-lg: 1.5rem;     // 24px
  --spacing-xl: 2rem;       // 32px
  
  // 字体系统
  --font-size-xs: 0.75rem;  // 12px
  --font-size-sm: 0.875rem; // 14px
  --font-size-base: 1rem;   // 16px
  --font-size-lg: 1.125rem; // 18px
  --font-size-xl: 1.25rem;  // 20px
  
  // 圆角系统
  --radius-sm: 0.125rem;    // 2px
  --radius-md: 0.25rem;     // 4px
  --radius-lg: 0.5rem;      // 8px
  --radius-xl: 0.75rem;     // 12px
  
  // 阴影系统
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

### 2. Vue-Flow样式定制

#### 组件样式覆盖
```scss
// ✅ vue-flow样式定制
.vue-flow {
  // 背景样式
  background: var(--color-background);
  
  // 节点样式
  .vue-flow__node {
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    
    &.selected {
      box-shadow: 0 0 0 2px var(--color-primary);
    }
  }
  
  // 连线样式
  .vue-flow__edge {
    &.selected .vue-flow__edge-path {
      stroke: var(--color-primary);
      stroke-width: 3;
    }
  }
  
  // 控制面板样式
  .vue-flow__controls {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
  }
}
```

#### 响应式设计规范
```scss
// ✅ 移动端适配
@media (max-width: 768px) {
  .workflow-editor {
    .sidebar {
      transform: translateX(-100%);
      
      &.open {
        transform: translateX(0);
      }
    }
    
    .vue-flow__controls {
      bottom: 1rem;
      right: 1rem;
    }
  }
}

// ✅ 大屏幕优化
@media (min-width: 1920px) {
  .workflow-editor {
    .properties-panel {
      width: 400px;
    }
  }
}
```

### 3. 主题系统规范

#### 主题切换实现
```typescript
// composables/useTheme.ts
export function useTheme() {
  const currentTheme = ref<'light' | 'dark'>('light')
  
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', currentTheme.value)
  }
  
  onMounted(() => {
    const saved = localStorage.getItem('theme')
    if (saved) {
      currentTheme.value = saved as 'light' | 'dark'
    } else {
      currentTheme.value = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light'
    }
    document.documentElement.setAttribute('data-theme', currentTheme.value)
  })
  
  watch(currentTheme, (theme) => {
    localStorage.setItem('theme', theme)
  })
  
  return {
    currentTheme: readonly(currentTheme),
    toggleTheme
  }
}
```

```scss
// ✅ 主题变量定义
[data-theme="light"] {
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-text: #1e293b;
}

[data-theme="dark"] {
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text: #f1f5f9;
}
```

---

## 🧪 测试开发规范

### 1. 单元测试规范

#### 测试文件结构
```typescript
// tests/unit/components/WorkflowEditor.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkflowEditor from '@/components/WorkflowEditor.vue'

describe('WorkflowEditor', () => {
  let wrapper: VueWrapper<InstanceType<typeof WorkflowEditor>>
  
  beforeEach(() => {
    wrapper = mount(WorkflowEditor, {
      props: {
        initialNodes: mockNodes,
        initialEdges: mockEdges
      }
    })
  })
  
  afterEach(() => {
    wrapper.unmount()
  })
  
  describe('组件渲染', () => {
    it('应该正确渲染工作流编辑器', () => {
      expect(wrapper.find('.workflow-editor').exists()).toBe(true)
    })
    
    it('应该显示初始节点', () => {
      expect(wrapper.findAll('.vue-flow__node')).toHaveLength(mockNodes.length)
    })
  })
  
  describe('用户交互', () => {
    it('应该处理节点点击事件', async () => {
      const node = wrapper.find('[data-testid="node-1"]')
      await node.trigger('click')
      
      expect(wrapper.emitted('node-select')).toBeTruthy()
      expect(wrapper.emitted('node-select')[0]).toEqual(['node-1'])
    })
  })
  
  describe('状态管理', () => {
    it('应该正确更新节点数据', async () => {
      const newData = { label: 'Updated Node' }
      await wrapper.vm.updateNodeData('node-1', newData)
      
      expect(wrapper.vm.nodes.find(n => n.id === 'node-1')?.data).toEqual(newData)
    })
  })
})
```

#### Mock规范
```typescript
// tests/mocks/vue-flow.ts
export const mockUseVueFlow = () => ({
  nodes: ref([]),
  edges: ref([]),
  addNodes: vi.fn(),
  addEdges: vi.fn(),
  removeNodes: vi.fn(),
  removeEdges: vi.fn(),
  onConnect: vi.fn(),
  onNodesChange: vi.fn(),
  onEdgesChange: vi.fn()
})

// 在测试中使用
vi.mock('@vue-flow/core', () => ({
  useVueFlow: mockUseVueFlow,
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right'
  }
}))
```

### 2. 集成测试规范

#### E2E测试场景
```typescript
// tests/e2e/workflow-creation.spec.ts
import { test, expect } from '@playwright/test'

test.describe('工作流创建', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor')
  })
  
  test('应该能创建完整的工作流', async ({ page }) => {
    // 1. 添加起始节点
    await page.click('[data-testid="add-node-button"]')
    await page.click('[data-testid="node-type-input"]')
    
    // 2. 添加处理节点
    await page.click('[data-testid="add-node-button"]')
    await page.click('[data-testid="node-type-llm"]')
    
    // 3. 连接节点
    await page.dragAndDrop(
      '[data-testid="node-1-output"]',
      '[data-testid="node-2-input"]'
    )
    
    // 4. 验证连线创建
    await expect(page.locator('.vue-flow__edge')).toHaveCount(1)
    
    // 5. 保存工作流
    await page.click('[data-testid="save-workflow"]')
    
    // 6. 验证保存成功
    await expect(page.locator('[data-testid="save-status"]')).toHaveText('已保存')
  })
  
  test('应该能执行工作流', async ({ page }) => {
    // 准备工作流
    await setupWorkflow(page)
    
    // 执行工作流
    await page.click('[data-testid="execute-workflow"]')
    
    // 验证执行状态
    await expect(page.locator('[data-testid="execution-status"]')).toHaveText('执行中')
    
    // 等待执行完成
    await page.waitForSelector('[data-testid="execution-complete"]')
    
    // 验证结果
    await expect(page.locator('[data-testid="execution-result"]')).toBeVisible()
  })
})
```

### 3. 测试覆盖率要求

#### 覆盖率标准
- **语句覆盖率**: ≥ 80%
- **分支覆盖率**: ≥ 75%
- **函数覆盖率**: ≥ 85%
- **行覆盖率**: ≥ 80%

#### 测试配置
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 85,
        lines: 80
      },
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
})
```

---

## ⚡ 性能优化规范

### 1. 组件性能规范

#### 组件优化技巧
```vue
<script setup lang="ts">
// ✅ 使用shallowRef减少深度响应式
const nodes = shallowRef<Node[]>([])

// ✅ 使用v-memo缓存昂贵的渲染
const expensiveComputation = computed(() => {
  return nodes.value.map(node => complexCalculation(node))
})

// ✅ 使用markRaw避免不必要的响应式
const staticConfig = markRaw({
  apiEndpoint: '/api/workflow',
  timeout: 5000
})

// ✅ 懒加载组件
const LazyNodeConfigPanel = defineAsyncComponent(() => 
  import('@/components/NodeConfigPanel.vue')
)
</script>

<template>
  <!-- ✅ 使用v-memo缓存列表渲染 -->
  <div
    v-for="node in nodes"
    :key="node.id"
    v-memo="[node.id, node.selected, node.position]"
  >
    <NodeComponent :node="node" />
  </div>
</template>
```

#### 大规模数据处理
```typescript
// composables/useVirtualList.ts
export function useVirtualList<T>(
  items: Ref<T[]>,
  itemHeight: number,
  containerHeight: number
) {
  const scrollTop = ref(0)
  
  const visibleItems = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight)
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 1,
      items.value.length
    )
    
    return items.value.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
      top: (start + index) * itemHeight
    }))
  })
  
  return {
    visibleItems,
    scrollTop,
    totalHeight: computed(() => items.value.length * itemHeight)
  }
}
```

### 2. 渲染性能规范

#### Vue-Flow性能优化
```typescript
// composables/useWorkflowPerformance.ts
export function useWorkflowPerformance() {
  const { nodes, edges, viewport } = useVueFlow()
  
  // ✅ 节流更新
  const throttledNodesUpdate = useDebounceFn((newNodes: Node[]) => {
    nodes.value = newNodes
  }, 16) // 60fps
  
  // ✅ 视口外节点简化渲染
  const visibleNodes = computed(() => {
    return nodes.value.filter(node => {
      return isNodeInViewport(node, viewport.value)
    })
  })
  
  // ✅ LOD连线渲染
  const simplifiedEdges = computed(() => {
    if (viewport.value.zoom < 0.5) {
      return edges.value.map(edge => ({
        ...edge,
        type: 'straight' // 简化连线类型
      }))
    }
    return edges.value
  })
  
  return {
    throttledNodesUpdate,
    visibleNodes,
    simplifiedEdges
  }
}
```

### 3. 内存管理规范

#### 内存泄漏预防
```typescript
// ✅ 正确的事件监听器清理
export function useEventListener(
  target: EventTarget,
  event: string,
  handler: EventListener
) {
  onMounted(() => {
    target.addEventListener(event, handler)
  })
  
  onUnmounted(() => {
    target.removeEventListener(event, handler)
  })
}

// ✅ 定时器清理
export function useInterval(callback: () => void, delay: number) {
  let timer: number | null = null
  
  const start = () => {
    if (timer) return
    timer = setInterval(callback, delay)
  }
  
  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }
  
  onUnmounted(stop)
  
  return { start, stop }
}
```

---

## 🔒 安全开发规范

### 1. 数据验证规范

#### 输入验证
```typescript
// utils/validation.ts
import { z } from 'zod'

// ✅ 使用Zod进行运行时验证
export const NodeDataSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['input', 'output', 'processor']),
  label: z.string().min(1).max(100),
  config: z.record(z.unknown())
})

export const validateNodeData = (data: unknown): NodeData => {
  return NodeDataSchema.parse(data)
}

// ✅ API响应验证
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  error: z.string().optional()
})
```

#### XSS防护
```typescript
// utils/sanitize.ts
import DOMPurify from 'dompurify'

// ✅ HTML内容清理
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  })
}

// ✅ 用户输入清理
export const sanitizeUserInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // 移除HTML标签
    .trim()
    .slice(0, 1000) // 限制长度
}
```

### 2. API安全规范

#### 请求验证
```typescript
// services/api.ts
class ApiService {
  private readonly baseURL: string
  private readonly timeout: number = 10000
  
  constructor(baseURL: string) {
    this.baseURL = baseURL
  }
  
  // ✅ 请求拦截器
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = new URL(endpoint, this.baseURL)
    
    // 验证URL
    if (!this.isValidURL(url)) {
      throw new Error('Invalid URL')
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    
    try {
      const response = await fetch(url.toString(), {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return await response.json()
    } finally {
      clearTimeout(timeoutId)
    }
  }
  
  private isValidURL(url: URL): boolean {
    // 检查协议
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false
    }
    
    // 检查主机名
    if (url.hostname === 'localhost' && process.env.NODE_ENV !== 'development') {
      return false
    }
    
    return true
  }
}
```

### 3. 敏感数据处理

#### 数据脱敏
```typescript
// utils/privacy.ts
export function maskSensitiveData(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret']
  
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        return [key, '***']
      }
      return [key, value]
    })
  )
}

// ✅ 日志脱敏
export function createSafeLogger() {
  return {
    info: (message: string, data?: any) => {
      console.info(message, data ? maskSensitiveData(data) : undefined)
    },
    error: (message: string, error?: Error) => {
      console.error(message, error?.message)
    }
  }
}
```

---

## 📝 文档编写规范

### 1. 代码注释规范

#### JSDoc注释
```typescript
/**
 * 执行工作流
 * @param workflowId - 工作流ID
 * @param options - 执行选项
 * @returns 执行结果的Promise
 * @throws {ValidationError} 当工作流验证失败时抛出
 * @throws {ExecutionError} 当执行过程中发生错误时抛出
 * @example
 * ```typescript
 * const result = await executeWorkflow('workflow-123', {
 *   timeout: 30000,
 *   retries: 3
 * })
 * ```
 */
export async function executeWorkflow(
  workflowId: string,
  options: ExecutionOptions = {}
): Promise<ExecutionResult> {
  // 实现
}
```

#### 组件文档注释
```vue
<script setup lang="ts">
/**
 * 工作流节点组件
 * 
 * @description 用于显示和编辑工作流中的单个节点
 * @author 开发者姓名
 * @since 1.0.0
 * 
 * @example
 * ```vue
 * <WorkflowNode
 *   :node="nodeData"
 *   :selected="isSelected"
 *   @click="handleNodeClick"
 *   @data-change="handleDataChange"
 * />
 * ```
 */

/**
 * 节点属性
 */
interface Props {
  /** 节点数据 */
  node: Node
  /** 是否选中 */
  selected?: boolean
  /** 是否禁用 */
  disabled?: boolean
}
</script>
```

### 2. README规范

#### 项目README结构
```markdown
# Vue-Flow AI工作流编辑器

## 📖 项目简介
基于Vue 3和@vue-flow/core构建的AI工作流可视化编辑器。

## ✨ 特性
- 🎨 直观的拖拽式界面
- 🤖 AI节点集成
- 🔄 实时协作
- 📱 响应式设计

## 🚀 快速开始

### 环境要求
- Node.js 20.19.0+
- npm 10.0.0+

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 📁 项目结构
```
src/
├── components/     # 组件
├── stores/        # 状态管理
├── types/         # 类型定义
└── utils/         # 工具函数
```

## 🤝 贡献指南
请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何参与项目开发。

## 📄 许可证
MIT License
```

### 3. API文档规范

#### 组件API文档
```markdown
# WorkflowEditor API

## Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| initialNodes | `Node[]` | `[]` | 初始节点数据 |
| initialEdges | `Edge[]` | `[]` | 初始连线数据 |
| readonly | `boolean` | `false` | 是否只读模式 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| node-select | `(nodeId: string)` | 节点被选中时触发 |
| workflow-save | `(workflow: Workflow)` | 工作流保存时触发 |

## Slots

| 插槽名 | 说明 |
|--------|------|
| toolbar | 自定义工具栏内容 |
| sidebar | 自定义侧边栏内容 |

## 方法

### executeWorkflow()
执行当前工作流

**返回值:** `Promise<ExecutionResult>`

**示例:**
```typescript
const result = await editorRef.value.executeWorkflow()
```
```

---

## 📦 版本控制规范

### 1. Git工作流规范

#### 分支命名规范
- **主分支**: `main`
- **开发分支**: `develop`
- **功能分支**: `feature/功能名称`
- **修复分支**: `fix/问题描述`
- **发布分支**: `release/版本号`

#### 提交信息规范
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type类型:**
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例:**
```
feat(workflow): 添加AI节点支持

- 新增LLM节点组件
- 集成OpenAI API
- 添加节点配置面板

Closes #123
```

### 2. 版本发布规范

#### 语义化版本控制
- **主版本号**: 不兼容的API修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

#### 发布流程
1. 创建发布分支
2. 更新版本号和CHANGELOG
3. 运行完整测试套件
4. 合并到main分支
5. 创建标签和发布说明

```bash
# 发布流程脚本
npm run test                    # 运行测试
npm run build                   # 构建生产版本
npm version patch               # 更新版本号
git push origin main --tags     # 推送标签
npm publish                     # 发布到npm
```

---

## 📋 规范检查清单

### 开发前检查
- [ ] 确认技术栈版本
- [ ] 配置开发环境
- [ ] 理解项目架构
- [ ] 熟悉编码规范

### 代码提交前检查
- [ ] TypeScript类型检查通过
- [ ] ESLint检查无错误
- [ ] Prettier格式化完成
- [ ] 单元测试覆盖率达标
- [ ] 组件文档完整
- [ ] 性能影响评估

### 功能完成后检查
- [ ] 功能测试通过
- [ ] 兼容性测试完成
- [ ] 性能测试达标
- [ ] 安全检查通过
- [ ] 文档更新完成
- [ ] 代码审查通过

### 发布前检查
- [ ] 完整测试套件通过
- [ ] 生产构建成功
- [ ] 版本号更新正确
- [ ] CHANGELOG更新
- [ ] 发布说明准备
- [ ] 回滚方案确认

---

这套开发规范为Vue-Flow AI工作流编辑器项目提供了全面的指导，确保代码质量、性能和可维护性。开发团队应严格遵循这些规范，并定期审查和更新。 