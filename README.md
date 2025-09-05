# Vue-Flow AI工作流编辑器

[![Vue](https://img.shields.io/badge/Vue-3.5+-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vue Flow](https://img.shields.io/badge/Vue%20Flow-1.45.0+-FF6B6B?style=flat&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==&logoColor=white)](https://vueflow.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.0+-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

基于Vue 3 + @vue-flow/core构建的现代化AI工作流可视化编辑器，提供类似n8n的拖拽式工作流设计能力。

## ✨ 核心特性

- 🎨 **直观的可视化界面** - 拖拽式节点编辑，所见即所得
- 🤖 **AI节点集成** - 支持LLM、数据处理、条件判断等AI节点
- 🔄 **实时执行引擎** - 支持串行、并行、条件分支执行模式
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🔌 **插件化架构** - 可扩展的节点和功能插件系统
- 🎯 **TypeScript** - 完整的类型定义，开发体验优秀
- ⚡ **高性能渲染** - 优化的大规模工作流渲染性能
- 🔒 **安全可靠** - 完善的数据验证和安全机制

## 🚀 快速开始

### 环境要求
- Node.js 20.19.0+
- npm 10.0.0+

### 安装和运行
```bash
# 克隆项目
git clone <repository-url>
cd ai-workflow-editor

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

详细的安装和配置指南请参考 [快速开始文档](./docs/quick-start.md)。

## 📋 项目结构

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
│   ├── stores/              # Pinia状态管理
│   ├── types/               # TypeScript类型定义
│   ├── utils/               # 工具函数
│   ├── services/            # API服务
│   └── assets/              # 静态资源
├── docs/                    # 项目文档
│   ├── development-prompts.md     # 开发提示词文档
│   ├── development-standards.md   # 开发规范文档
│   └── quick-start.md            # 快速开始指南
├── tests/                   # 测试文件
└── public/                  # 公共资源
```

## 📚 文档

### 核心文档
- [📖 快速开始指南](./docs/quick-start.md) - 项目搭建和基础使用
- [🔧 开发规范](./docs/development-standards.md) - 完整的开发规范和最佳实践
- [💡 开发提示词](./docs/development-prompts.md) - AI辅助开发的提示词集合

### 技术文档
- [Vue-Flow 官方文档](https://vueflow.dev/) - 工作流引擎核心文档
- [Vue 3 官方文档](https://cn.vuejs.org/) - Vue.js框架文档
- [TypeScript 手册](https://www.typescriptlang.org/docs/) - TypeScript语言文档

## 🧩 核心组件

### 节点系统
- **基础节点**: 输入、输出、处理节点
- **AI节点**: LLM调用、文本处理、智能分析
- **控制节点**: 条件判断、循环、延时
- **数据节点**: 数据转换、验证、聚合

### 工作流引擎
- 拓扑排序执行算法
- 异步任务调度
- 错误处理和重试机制
- 实时状态监控

### 用户界面
- 拖拽式节点编辑器
- 属性配置面板
- 工具栏和快捷操作
- 响应式布局设计

## 🛠️ 开发工具链

- **构建工具**: Vite 7.0+
- **代码规范**: ESLint + Prettier
- **测试框架**: Vitest + Vue Test Utils
- **类型检查**: TypeScript 5.0+
- **状态管理**: Pinia 2.0+

## 📈 性能特性

- **虚拟化渲染** - 支持大规模节点渲染
- **增量更新** - 最小化重新渲染
- **懒加载** - 按需加载组件和资源
- **内存优化** - 有效的内存管理和垃圾回收

## 🔧 开发脚本

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run preview          # 预览生产构建

# 代码质量
npm run lint             # ESLint检查
npm run lint:fix         # 自动修复ESLint错误
npm run format           # Prettier格式化
npm run type-check       # TypeScript类型检查

# 测试
npm run test             # 运行测试
npm run test:coverage    # 生成测试覆盖率报告
npm run test:watch       # 监视模式运行测试
```

## 🤝 贡献指南

我们欢迎任何形式的贡献！在参与项目开发前，请：

1. 阅读 [开发规范文档](./docs/development-standards.md)
2. 了解 [快速开始指南](./docs/quick-start.md)
3. 查看现有的 Issues 和 Pull Requests
4. 遵循项目的编码标准和提交规范

### 提交规范
我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

例如：
```
feat(workflow): 添加AI节点支持

- 新增LLM节点组件
- 集成OpenAI API
- 添加节点配置面板

Closes #123
```

## 🐛 问题反馈

如果您遇到任何问题或有功能建议，请：

1. 查看 [常见问题](./docs/quick-start.md#常见问题)
2. 搜索现有的 Issues
3. 创建新的 Issue 并提供详细信息

## 📄 许可证

本项目采用 [MIT License](./LICENSE) 许可证。

## 🙏 致谢

感谢以下优秀的开源项目：

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Vue Flow](https://vueflow.dev/) - Vue的流程图库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - 带类型的JavaScript

---

<div align="center">
  <strong>🌟 如果这个项目对您有帮助，请给我们一个星标！</strong>
</div>
