# Vue-Flow AI工作流编辑器开发提示词文档

## 📚 目录

1. [项目概述](#项目概述)
2. [核心组件开发提示词](#核心组件开发提示词)
3. [架构设计提示词](#架构设计提示词)
4. [业务逻辑提示词](#业务逻辑提示词)
5. [UI/UX设计提示词](#uiux设计提示词)
6. [扩展功能提示词](#扩展功能提示词)
7. [性能优化提示词](#性能优化提示词)
8. [测试与调试提示词](#测试与调试提示词)

## 🎯 项目概述

基于Vue 3 + @vue-flow/core构建的现代化AI工作流编辑器，提供类似n8n的可视化工作流设计能力。

### 技术栈
- **前端框架**: Vue 3 (Composition API)
- **工作流引擎**: @vue-flow/core
- **构建工具**: Vite
- **状态管理**: Pinia (推荐)
- **UI组件**: 自定义组件库
- **后端集成**: Go规则引擎

---

## 🧩 核心组件开发提示词

### 1. 节点组件开发

#### 基础节点组件提示词
```prompt
基于Vue 3 Composition API和@vue-flow/core创建一个可复用的工作流节点组件：

要求：
1. 使用vue-flow的Handle组件处理连接点
2. 支持节点类型：input、output、default、custom
3. 集成node-resizer插件支持节点大小调整
4. 实现节点状态管理（idle、running、success、error）
5. 支持自定义图标和主题色彩
6. 添加节点工具栏（复制、删除、设置）
7. 实现节点数据验证和错误提示

组件结构：
- NodeWrapper.vue (通用节点容器)
- NodeHeader.vue (节点头部)
- NodeBody.vue (节点主体内容)
- NodeFooter.vue (节点底部)
- NodeHandle.vue (自定义连接点)

代码示例应包含：
- defineProps和defineEmits的正确使用
- vue-flow的Position枚举使用
- 响应式状态管理
- CSS模块化样式
```

#### AI节点特化提示词
```prompt
为AI工作流创建特化的智能节点组件：

AI节点类型：
1. LLM节点 - 大语言模型调用
2. 数据处理节点 - 数据清洗和转换
3. 条件判断节点 - 智能分支逻辑
4. 循环节点 - 批处理和迭代
5. 聚合节点 - 数据汇总和分析
6. 通知节点 - 消息推送和告警

每个节点需要：
- 参数配置面板（使用vue-flow的Panel组件）
- 实时预览功能
- 执行状态指示器
- 性能监控集成
- 错误日志收集
- 版本兼容性检查

使用@vue-flow/core的最佳实践：
- 正确实现nodeTypes映射
- 使用useVueFlow组合式函数
- 集成vue-flow的事件系统
```

### 2. 连线系统开发

#### 智能连线提示词
```prompt
基于@vue-flow/core开发智能连线系统：

核心功能：
1. 使用ConnectionLine组件自定义连线样式
2. 实现连线验证逻辑（isValidConnection）
3. 添加连线动画效果（数据流动）
4. 支持条件分支连线（true/false路径）
5. 连线中间节点插入功能
6. 批量连线操作

连线类型：
- default: 标准数据连线
- smoothstep: 平滑阶梯连线
- straight: 直线连线
- custom: 自定义贝塞尔曲线

实现要点：
- 使用vue-flow的ConnectionMode配置
- 集成edgeTypes自定义边类型
- 实现onConnect回调处理
- 添加连线右键菜单
- 支持连线标签和权重显示

代码应展示：
- Edge组件的完整实现
- 连线验证函数编写
- 动画效果的CSS实现
- 事件处理的最佳实践
```

### 3. 工具栏和面板组件

#### 工具栏开发提示词
```prompt
创建功能丰富的工作流编辑器工具栏：

使用vue-flow内置组件：
- Panel组件作为工具栏容器
- MiniMap组件提供导航
- Controls组件提供缩放控制
- Background组件设置画布背景

工具栏功能模块：
1. 文件操作（新建、打开、保存、导出）
2. 编辑操作（撤销、重做、复制、粘贴）
3. 视图控制（缩放、适应、全屏）
4. 调试工具（运行、暂停、单步执行）
5. 布局工具（自动排列、对齐工具）

组件设计要求：
- 响应式布局适配
- 快捷键支持
- 图标统一设计
- 状态同步更新
- 无障碍访问支持

集成@vue-flow/core的：
- useVueFlow钩子函数
- ReactFlowInstance方法
- 视图状态管理
```

---

## 🏗️ 架构设计提示词

### 1. 状态管理架构

#### Pinia状态管理提示词
```prompt
为vue-flow工作流编辑器设计Pinia状态管理架构：

Store模块划分：
1. workflow.js - 工作流核心状态
2. nodes.js - 节点管理状态
3. edges.js - 连线管理状态
4. ui.js - 界面状态管理
5. execution.js - 执行引擎状态
6. collaboration.js - 协作状态

workflow.js要求：
- 管理vue-flow的nodes和edges状态
- 集成useVueFlow的响应式数据
- 实现撤销/重做功能栈
- 提供工作流序列化/反序列化
- 支持版本控制和分支管理

关键状态字段：
- currentWorkflow: ReactFlowJsonObject
- history: UndoRedoStack
- executionState: ExecutionStatus
- collaborators: User[]

actions应包含：
- 与@vue-flow/core的双向绑定
- 批量操作优化
- 异步状态处理
- 错误状态管理
```

### 2. 组件通信架构

#### 事件系统设计提示词
```prompt
基于vue-flow事件系统设计组件通信架构：

利用@vue-flow/core事件：
- onNodesChange: 节点变更监听
- onEdgesChange: 连线变更监听
- onConnect: 连接创建监听
- onNodeClick: 节点点击事件
- onEdgeClick: 连线点击事件
- onSelectionChange: 选择变更事件

自定义事件总线：
- 使用mitt或tiny-emitter
- 定义事件类型和载荷接口
- 实现事件优先级和过滤
- 添加事件调试和日志

事件类型定义：
- workflow:saved
- node:validated
- execution:started
- collaboration:user-joined
- ui:theme-changed

实现要点：
- 事件解耦和模块化
- 内存泄漏防护
- 异步事件处理
- 事件重放和调试
```

### 3. 插件系统架构

#### 可扩展插件系统提示词
```prompt
设计vue-flow工作流编辑器的插件系统：

插件接口规范：
```typescript
interface WorkflowPlugin {
  name: string
  version: string
  install(app: App, vueFlowInstance: VueFlowStore): void
  nodeTypes?: Record<string, Component>
  edgeTypes?: Record<string, Component>
  commands?: Record<string, Function>
}
```

插件注册机制：
- 使用Vue 3的plugin系统
- 集成vue-flow的nodeTypes和edgeTypes
- 动态组件注册和卸载
- 插件依赖关系解析

核心插件分类：
1. 节点插件（AI、数据处理、通信等）
2. 连线插件（条件分支、数据管道等）
3. 面板插件（属性编辑、调试等）
4. 主题插件（样式、动画等）
5. 工具插件（导入导出、协作等）

插件开发工具：
- 脚手架生成器
- 调试工具集
- 文档生成器
- 测试框架集成
```

---

## 💼 业务逻辑提示词

### 1. 工作流执行引擎

#### 执行引擎核心提示词
```prompt
基于vue-flow数据结构实现工作流执行引擎：

引擎架构设计：
1. 解析vue-flow的nodes和edges为执行图
2. 实现拓扑排序确定执行顺序
3. 支持串行、并行、条件分支执行
4. 集成错误处理和重试机制
5. 提供执行状态实时反馈到vue-flow节点

执行器接口：
```typescript
interface ExecutionEngine {
  parse(workflow: ReactFlowJsonObject): ExecutionGraph
  execute(graph: ExecutionGraph): Promise<ExecutionResult>
  pause(): void
  resume(): void
  stop(): void
  getStatus(): ExecutionStatus
}
```

与vue-flow集成：
- 使用useVueFlow更新节点状态
- 实时更新连线动画效果
- 在vue-flow画布上显示执行进度
- 错误节点高亮显示

执行模式：
- 调试模式：单步执行和断点
- 生产模式：高性能批处理
- 预览模式：模拟执行不实际调用

性能优化：
- 使用Web Workers进行后台计算
- 实现执行结果缓存
- 支持增量执行和差异更新
```

### 2. 数据流管理

#### 数据管道设计提示词
```prompt
为vue-flow工作流设计数据流管理系统：

数据流架构：
1. 基于vue-flow的edge连接定义数据流向
2. 实现类型安全的数据传递
3. 支持数据转换和映射
4. 提供数据验证和清洗

数据类型系统：
- 基础类型：string、number、boolean、object
- 复合类型：array、file、stream
- AI类型：prompt、embedding、model-output
- 自定义类型：可扩展类型定义

数据传递机制：
- 同步传递：直接内存引用
- 异步传递：Promise/Observable
- 流式传递：ReadableStream
- 缓存传递：持久化存储

与@vue-flow/core集成：
- 在edge组件上显示数据类型
- 连接验证基于数据类型兼容性
- 实时数据预览和调试
- 数据血缘关系可视化

实现考虑：
- 大数据量处理优化
- 内存管理和垃圾回收
- 数据安全和隐私保护
- 跨域和跨服务数据传递
```

### 3. AI集成服务

#### AI服务集成提示词
```prompt
为vue-flow工作流编辑器集成AI服务：

AI服务抽象层：
```typescript
interface AIService {
  provider: 'openai' | 'anthropic' | 'local'
  model: string
  execute(prompt: string, context: any): Promise<AIResponse>
  stream?(prompt: string): AsyncIterator<string>
  validate(config: AIConfig): ValidationResult
}
```

AI节点类型：
1. LLM节点：文本生成和对话
2. 嵌入节点：向量化处理
3. 分类节点：智能分类
4. 提取节点：信息抽取
5. 总结节点：内容摘要
6. 翻译节点：多语言翻译

与vue-flow集成：
- AI节点的特殊样式和图标
- 实时显示AI处理状态
- 支持流式输出的动画效果
- AI结果的可视化预览

AI工作流优化：
- 智能提示词管理
- 上下文传递优化
- 结果缓存和复用
- 成本监控和控制
- 模型性能分析

错误处理：
- API限流和重试
- 模型异常处理
- 成本超限保护
- 服务降级策略
```

---

## 🎨 UI/UX设计提示词

### 1. 主题系统设计

#### Vue-Flow主题定制提示词
```prompt
为vue-flow工作流编辑器创建完整的主题系统：

基于@vue-flow/core的样式定制：
1. 自定义CSS变量覆盖默认样式
2. 创建暗色/亮色主题变体
3. 实现主题动态切换
4. 支持用户自定义颜色方案

主题配置结构：
```typescript
interface WorkflowTheme {
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    node: NodeTheme
    edge: EdgeTheme
    controls: ControlsTheme
  }
  typography: TypographyTheme
  spacing: SpacingTheme
  animations: AnimationTheme
}
```

vue-flow组件主题：
- Background组件：网格样式、颜色、透明度
- Controls组件：按钮样式、图标、位置
- MiniMap组件：缩略图样式、节点表示
- Panel组件：面板背景、边框、阴影

节点主题定制：
- 节点边框和圆角
- 连接点样式和颜色
- 节点状态指示器
- 节点图标和文字样式

实现要点：
- 使用CSS-in-JS或CSS模块
- 主题切换动画效果
- 响应式设计适配
- 无障碍对比度检查
```

### 2. 交互体验优化

#### 用户交互增强提示词
```prompt
优化vue-flow工作流编辑器的用户交互体验：

基于@vue-flow/core增强功能：
1. 智能节点对齐和吸附
2. 批量选择和操作
3. 快捷键和手势支持
4. 上下文菜单系统
5. 拖拽预览和反馈

利用vue-flow特性：
- SelectionMode：框选模式配置
- PanOnDrag：画布拖拽设置
- NodeDragThreshold：拖拽灵敏度
- ConnectionMode：连接模式设置
- KeyCode：快捷键绑定

交互功能实现：
```typescript
// 使用useVueFlow钩子
const {
  onSelectionChange,
  onNodeDragStop,
  onEdgeUpdate,
  getSelectedNodes,
  getSelectedEdges
} = useVueFlow()
```

用户体验优化：
- 操作撤销/重做视觉反馈
- 加载状态和进度指示
- 错误状态友好提示
- 操作引导和帮助提示
- 性能优化感知提升

移动端适配：
- 触摸手势支持
- 响应式布局调整
- 虚拟键盘处理
- 移动设备性能优化
```

### 3. 动画和过渡效果

#### 动画系统设计提示词
```prompt
为vue-flow工作流编辑器设计动画系统：

vue-flow动画集成：
1. 节点出现/消失动画
2. 连线绘制动画
3. 数据流动效果
4. 状态变更过渡
5. 操作反馈动画

使用Vue 3 Transition组件：
```vue
<TransitionGroup name="node" tag="div">
  <Node v-for="node in nodes" :key="node.id" />
</TransitionGroup>
```

动画类型定义：
- 入场动画：scale、fade、slide
- 出场动画：shrink、dissolve、fly-out
- 状态动画：pulse、glow、shake
- 连线动画：draw、flow、highlight

CSS动画实现：
- 使用transform和opacity优化性能
- 利用CSS动画和关键帧
- 实现缓动函数和时间控制
- 支持动画的暂停和恢复

性能考虑：
- 使用will-change优化渲染
- 动画节流和防抖
- 复杂动画的Web Animations API
- 动画性能监控和调试

用户偏好设置：
- 动画开关控制
- 动画速度调节
- 减少动画模式
- 系统性能自适应
```

---

## 🔌 扩展功能提示词

### 1. 协作功能开发

#### 实时协作系统提示词
```prompt
为vue-flow工作流编辑器开发实时协作功能：

协作架构设计：
1. 基于WebSocket的实时通信
2. 操作冲突检测和解决
3. 用户状态和光标同步
4. 版本控制和分支管理

与@vue-flow/core集成：
- 同步nodes和edges状态变更
- 多用户选择状态显示
- 实时操作广播
- 协作锁定机制

协作状态管理：
```typescript
interface CollaborationState {
  users: CollaboratorUser[]
  cursors: Record<string, CursorPosition>
  selections: Record<string, SelectedElements>
  locks: Record<string, ElementLock>
  operations: OperationHistory[]
}
```

冲突解决策略：
- 基于时间戳的操作排序
- 最后写入获胜(LWW)策略
- 操作变换(OT)算法
- 冲突提示和手动解决

实时功能：
- 用户在线状态指示
- 实时光标位置显示
- 操作历史和回放
- 语音/视频通话集成
- 评论和注释系统

技术实现：
- Socket.io或原生WebSocket
- 状态同步的防抖优化
- 离线状态处理
- 数据一致性保证
```

### 2. 导入导出功能

#### 多格式支持提示词
```prompt
为vue-flow工作流编辑器实现多格式导入导出：

支持格式：
1. Vue Flow原生JSON格式
2. N8N工作流格式兼容
3. Apache Airflow DAG
4. Zapier工作流
5. 自定义XML/YAML格式

导出功能实现：
```typescript
interface ExportService {
  exportToJson(workflow: ReactFlowJsonObject): string
  exportToImage(format: 'png' | 'svg' | 'pdf'): Promise<Blob>
  exportToCode(language: 'python' | 'javascript'): string
  exportTemplate(): WorkflowTemplate
}
```

与vue-flow集成：
- 使用getNodes()和getEdges()获取数据
- 利用getRectOfNodes()计算导出范围
- 使用getViewport()保存视图状态
- 集成toObject()方法完整序列化

导入验证：
- 格式兼容性检查
- 节点类型映射验证
- 数据完整性校验
- 版本兼容性处理

特殊处理：
- 大型工作流的分块处理
- 敏感数据的脱敏导出
- 导出进度和取消支持
- 批量导入导出
- 格式转换优化

图像导出增强：
- 高分辨率渲染
- 自定义水印和标注
- 多页面PDF导出
- SVG矢量图优化
```

### 3. 版本控制系统

#### Git风格版本管理提示词
```prompt
为vue-flow工作流实现Git风格的版本控制：

版本控制架构：
```typescript
interface VersionControl {
  commit(message: string): Promise<CommitHash>
  branch(name: string): Promise<Branch>
  merge(branch: string): Promise<MergeResult>
  diff(commit1: string, commit2: string): WorkflowDiff
  rollback(commit: string): Promise<void>
}
```

与vue-flow数据集成：
- 基于ReactFlowJsonObject的快照
- 增量变更记录和压缩
- 节点级别的变更追踪
- 连线变更的可视化对比

版本可视化：
- 在vue-flow画布上显示变更
- 节点变更的颜色标识
- 连线新增/删除的动画
- 版本时间轴组件

分支管理：
- 并行开发分支支持
- 可视化分支合并
- 冲突解决界面
- 分支权限控制

实现特性：
- 压缩算法优化存储
- 变更日志自动生成
- 标签和里程碑管理
- 团队协作的权限控制
- 自动备份和恢复

用户界面：
- 版本历史浏览器
- 可视化差异对比
- 一键回滚功能
- 分支切换预览
```

---

## ⚡ 性能优化提示词

### 1. 渲染性能优化

#### Vue-Flow性能调优提示词
```prompt
优化vue-flow大规模工作流的渲染性能：

利用@vue-flow/core性能特性：
1. 启用nodeOrigin优化节点定位计算
2. 使用elevateNodesOnSelect减少重排
3. 配置defaultViewport设置合适的初始视图
4. 启用fitViewOnInit自动适配视图

大规模数据优化：
```typescript
// 虚拟化长列表节点
const { nodes, edges } = useVirtualFlow({
  nodeCount: 10000,
  viewportSize: { width: 1200, height: 800 },
  itemSize: { width: 200, height: 100 }
})
```

渲染优化策略：
- 使用v-memo缓存节点渲染
- 实现节点池重用机制
- 连线的LOD(Level of Detail)渲染
- 视口外节点的简化渲染

Vue 3特性利用：
- Teleport优化弹出层渲染
- Suspense处理异步组件加载
- 计算属性和侦听器优化
- defineAsyncComponent懒加载节点

浏览器优化：
- requestAnimationFrame控制渲染频率
- IntersectionObserver监控可见性
- ResizeObserver响应尺寸变化
- Web Workers处理复杂计算

内存管理：
- 及时清理事件监听器
- 避免内存泄漏的常见陷阱
- 使用WeakMap和WeakSet
- 定期垃圾回收触发
```

### 2. 状态更新优化

#### 响应式性能提升提示词
```prompt
优化vue-flow工作流的状态更新性能：

Vue 3响应式优化：
```typescript
// 使用shallowRef减少深度响应
const nodes = shallowRef<Node[]>([])
const edges = shallowRef<Edge[]>([])

// 批量更新优化
const batchUpdate = (updates: () => void) => {
  nextTick(() => {
    updates()
  })
}
```

状态更新策略：
- 防抖动批量更新
- 增量状态同步
- 选择性组件更新
- 状态变更的优先级队列

与vue-flow集成：
- 使用useVueFlow的批量操作API
- 优化onNodesChange回调性能
- 减少不必要的边重新计算
- 节点位置更新的节流处理

数据不可变性：
- 使用immer进行不可变更新
- 结构化克隆优化
- 对象引用比较优化
- 状态快照的高效diff

并发处理：
- 使用Web Workers处理数据转换
- 异步状态更新队列
- 优先级调度系统
- 响应式依赖收集优化

监控和调试：
- 性能监控埋点
- 状态更新时间分析
- 组件渲染次数统计
- 内存使用情况监控
```

### 3. 网络优化

#### 数据传输优化提示词
```prompt
优化vue-flow工作流编辑器的网络性能：

数据压缩策略：
```typescript
// 工作流数据压缩
interface CompressedWorkflow {
  nodes: CompressedNode[]
  edges: CompressedEdge[]
  metadata: WorkflowMetadata
}

const compressWorkflow = (workflow: ReactFlowJsonObject) => {
  // 移除冗余字段
  // 压缩坐标精度
  // 合并相似配置
}
```

增量同步：
- 基于时间戳的增量更新
- 节点级别的变更检测
- 二进制差异传输
- 智能冲突解决

缓存策略：
- 浏览器缓存优化
- Service Worker离线缓存
- 内存缓存LRU算法
- CDN静态资源分发

请求优化：
- GraphQL按需查询
- HTTP/2多路复用
- 请求合并和批处理
- 智能重试和降级

实时通信：
- WebSocket连接池管理
- 消息优先级队列
- 连接状态监控
- 自动重连机制

预加载策略：
- 关键路径资源预加载
- 节点组件懒加载
- 预测性数据获取
- 智能预缓存算法
```

---

## 🧪 测试与调试提示词

### 1. 单元测试

#### Vue-Flow组件测试提示词
```prompt
为vue-flow工作流编辑器编写全面的单元测试：

测试框架配置：
- Vitest + Vue Test Utils
- @vue/test-utils 的vue-flow适配
- Mock @vue-flow/core 依赖
- 组件快照测试

节点组件测试：
```typescript
describe('WorkflowNode', () => {
  it('should render with correct props', () => {
    const wrapper = mount(WorkflowNode, {
      props: {
        id: 'test-node',
        type: 'custom',
        data: { label: 'Test Node' }
      }
    })
    expect(wrapper.text()).toContain('Test Node')
  })

  it('should handle node selection', async () => {
    // 测试节点选择逻辑
  })
})
```

Vue-Flow集成测试：
- useVueFlow钩子的模拟
- 节点和边的状态测试
- 事件处理函数测试
- 响应式数据变更测试

测试覆盖范围：
- 所有节点类型组件
- 连线验证逻辑
- 状态管理Store
- 工具栏操作功能
- 数据导入导出
- 执行引擎逻辑

Mock策略：
- API请求模拟
- 文件操作模拟
- 时间控制模拟
- 浏览器API模拟

性能测试：
- 大规模数据渲染测试
- 内存泄漏检测
- 操作响应时间测试
- 并发操作压力测试
```

### 2. 集成测试

#### E2E测试方案提示词
```prompt
为vue-flow工作流编辑器设计端到端测试：

测试工具选择：
- Playwright/Cypress
- Vue-flow特定的测试辅助工具
- 视觉回归测试
- 性能监控集成

核心流程测试：
```typescript
test('complete workflow creation flow', async ({ page }) => {
  // 1. 打开编辑器
  await page.goto('/editor')
  
  // 2. 添加节点
  await page.click('[data-testid="add-node-button"]')
  await page.click('[data-testid="node-type-llm"]')
  
  // 3. 连接节点
  await page.dragAndDrop(
    '[data-testid="node-output-handle"]',
    '[data-testid="node-input-handle"]'
  )
  
  // 4. 配置参数
  await page.click('[data-testid="node-settings"]')
  await page.fill('[data-testid="prompt-input"]', 'Test prompt')
  
  // 5. 执行工作流
  await page.click('[data-testid="run-workflow"]')
  
  // 6. 验证结果
  await expect(page.locator('[data-testid="execution-status"]'))
    .toHaveText('Success')
})
```

测试场景覆盖：
- 工作流CRUD操作
- 节点拖拽和连接
- 参数配置和验证
- 执行和调试流程
- 协作功能测试
- 导入导出功能
- 主题切换测试

跨浏览器测试：
- Chrome/Firefox/Safari兼容性
- 移动端响应式测试
- 不同屏幕分辨率适配
- 性能基准测试

数据驱动测试：
- 多种工作流模板测试
- 边界条件和异常处理
- 不同用户权限测试
- 大规模数据处理测试
```

### 3. 调试工具

#### 开发者工具提示词
```prompt
为vue-flow工作流编辑器开发调试工具：

Vue DevTools集成：
```typescript
// 自定义vue-flow调试器
const VueFlowDevtools = {
  install(app: App) {
    if (process.env.NODE_ENV === 'development') {
      app.config.globalProperties.$vueFlowDebug = {
        getNodes: () => nodes.value,
        getEdges: () => edges.value,
        getViewport: () => viewport.value,
        exportState: () => ({ nodes, edges, viewport })
      }
    }
  }
}
```

调试面板功能：
- 节点状态实时监控
- 连线数据流跟踪
- 执行路径可视化
- 性能指标显示
- 错误日志收集

工作流调试器：
- 断点设置和单步执行
- 变量监视和修改
- 调用栈追踪
- 时间旅行调试
- 条件断点支持

性能分析工具：
- 渲染性能火焰图
- 内存使用分析
- 网络请求监控
- 用户操作回放
- 性能瓶颈识别

日志系统：
- 结构化日志输出
- 日志级别和过滤
- 远程日志收集
- 错误自动上报
- 调试信息导出

开发辅助功能：
- 热重载优化
- 代码分割分析
- 依赖关系可视化
- Bundle分析工具
- 构建性能监控
```

---

## 📋 开发规范总结

### 代码质量要求
1. **TypeScript强类型**：所有组件和函数必须有完整的类型定义
2. **Vue 3 Composition API**：统一使用组合式API，避免Options API
3. **ESLint + Prettier**：代码格式化和规范检查
4. **单元测试覆盖率**：核心功能测试覆盖率≥80%

### Vue-Flow最佳实践
1. **响应式数据绑定**：正确使用v-model:nodes和v-model:edges
2. **事件处理优化**：合理使用防抖和节流
3. **性能考虑**：大规模数据的虚拟化渲染
4. **类型安全**：利用泛型确保节点和边的类型安全

### 架构设计原则
1. **模块化设计**：组件、状态、工具分离
2. **插件化扩展**：支持第三方节点和功能扩展
3. **状态管理统一**：使用Pinia管理全局状态
4. **错误处理完善**：全局错误边界和用户友好提示

这套提示词文档为vue-flow AI工作流编辑器的开发提供了全面的指导，涵盖了从基础组件到高级功能的各个方面。 