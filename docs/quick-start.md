# Vue-Flow AI工作流编辑器快速开始指南

## 🚀 环境准备

### 系统要求
- **Node.js**: 20.19.0 或更高版本
- **npm**: 10.0.0 或更高版本
- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

### 开发工具推荐
- **IDE**: VSCode + Volar 插件
- **浏览器**: Chrome/Edge 最新版本
- **Git**: 2.20.0 或更高版本

## 📦 项目初始化

### 1. 克隆项目
```bash
git clone <repository-url>
cd ai-workflow-editor
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置开发环境
```bash
# 安装必要的开发依赖
npm install -D @vue/eslint-config-typescript @typescript-eslint/eslint-plugin
npm install -D @vue/eslint-config-prettier eslint-plugin-import
npm install -D vitest @vue/test-utils jsdom
npm install -D @types/node
```

## 🛠️ 开发工作流

### 启动开发服务器
```bash
npm run dev
```
应用将在 `http://localhost:5173` 启动

### 代码质量检查
```bash
# ESLint 检查
npm run lint

# TypeScript 类型检查
npm run type-check

# 代码格式化
npm run format
```

### 运行测试
```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监视模式运行测试
npm run test:watch
```

### 构建生产版本
```bash
npm run build
```

## 🧩 核心概念

### Vue-Flow 集成
项目基于 `@vue-flow/core` 构建，主要概念包括：

- **节点 (Nodes)**: 工作流中的处理单元
- **边 (Edges)**: 连接节点的数据流
- **句柄 (Handles)**: 节点的连接点
- **视口 (Viewport)**: 画布的视图区域

### 组件架构
```
src/
├── components/
│   ├── base/           # 基础UI组件
│   ├── workflow/       # 工作流组件
│   │   ├── nodes/      # 节点组件
│   │   ├── edges/      # 连线组件
│   │   └── panels/     # 面板组件
│   └── common/         # 通用组件
```

## 📝 第一个节点组件

创建一个简单的AI节点组件：

```vue
<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'

interface AINodeData {
  label: string
  prompt: string
  model: string
}

interface Props extends NodeProps<AINodeData> {}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:data': [data: AINodeData]
}>()

const updatePrompt = (prompt: string) => {
  emit('update:data', { ...props.data, prompt })
}
</script>

<template>
  <div class="ai-node">
    <!-- 输入句柄 -->
    <Handle
      id="input"
      type="target"
      :position="Position.Left"
    />
    
    <!-- 节点内容 -->
    <div class="node-header">
      <h3>{{ data.label }}</h3>
    </div>
    
    <div class="node-body">
      <textarea
        :value="data.prompt"
        @input="updatePrompt(($event.target as HTMLTextAreaElement).value)"
        placeholder="输入AI提示词..."
        class="prompt-input"
      />
    </div>
    
    <!-- 输出句柄 -->
    <Handle
      id="output"
      type="source"
      :position="Position.Right"
    />
  </div>
</template>

<style scoped>
.ai-node {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.node-header h3 {
  margin: 0 0 12px 0;
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
}

.prompt-input {
  width: 100%;
  min-height: 60px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 8px;
  font-size: 12px;
  resize: none;
}

.prompt-input:focus {
  outline: none;
  border-color: #3b82f6;
}
</style>
```

## 🎯 使用工作流编辑器

### 基本用法
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import type { Node, Edge } from '@vue-flow/core'

// 初始化节点和边
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    label: 'Input Node',
    position: { x: 250, y: 25 }
  },
  {
    id: '2',
    type: 'ai',
    data: { label: 'AI Node', prompt: '', model: 'gpt-3.5-turbo' },
    position: { x: 100, y: 125 }
  }
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' }
]

const nodes = ref(initialNodes)
const edges = ref(initialEdges)
</script>

<template>
  <div style="height: 400px">
    <VueFlow v-model:nodes="nodes" v-model:edges="edges">
      <!-- 自定义节点在这里注册 -->
    </VueFlow>
  </div>
</template>
```

## 🔧 开发最佳实践

### 1. 组件命名规范
- 组件文件使用 PascalCase：`WorkflowEditor.vue`
- 组件名使用多个单词：避免与HTML元素冲突

### 2. TypeScript 使用
```typescript
// ✅ 推荐：明确的类型定义
interface NodeData {
  label: string
  config: Record<string, unknown>
}

// ❌ 避免：使用 any 类型
const data: any = {}
```

### 3. 响应式数据管理
```typescript
// ✅ 推荐：使用 readonly 暴露状态
export function useWorkflow() {
  const nodes = ref<Node[]>([])
  
  return {
    nodes: readonly(nodes),
    addNode: (node: Node) => nodes.value.push(node)
  }
}
```

### 4. 事件处理
```vue
<script setup lang="ts">
// ✅ 推荐：明确的事件类型
interface Emits {
  'node-click': [nodeId: string, event: MouseEvent]
}

const emit = defineEmits<Emits>()
</script>
```

## 🐛 常见问题

### Q: 节点无法拖拽？
A: 确保节点组件没有阻止默认的拖拽行为，检查CSS的 `pointer-events` 属性。

### Q: 连线无法创建？
A: 验证 Handle 组件的 `type` 属性设置正确（source/target）。

### Q: TypeScript 类型错误？
A: 确保安装了正确的类型定义包，并检查 `tsconfig.json` 配置。

### Q: 样式不生效？
A: 检查 Vue 文件中的 `<style scoped>` 标签，确保样式隔离正确。

## 📚 进一步学习

- [Vue-Flow 官方文档](https://vueflow.dev/)
- [Vue 3 组合式API](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Vite 构建工具](https://vitejs.dev/guide/)

## 🤝 贡献代码

在提交代码前，请确保：

1. 运行 `npm run lint` 检查代码质量
2. 运行 `npm run test` 确保测试通过
3. 遵循项目的 Git 提交规范
4. 更新相关文档

---

现在您已经准备好开始开发Vue-Flow AI工作流编辑器了！如有问题，请查看项目文档或提交Issue。 