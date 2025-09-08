# BaseTable 组件使用指南

## 🎯 设计理念

BaseTable 组件采用简洁直观的设计风格，参考现代管理系统的表格设计，具有以下特点：

- **简洁明了**: 清晰的边框分隔，易于阅读
- **功能丰富**: 支持选择、排序、自定义渲染等
- **响应式设计**: 适配各种屏幕尺寸
- **高度可定制**: 支持插槽自定义内容

## 📋 基本用法

### 1. 简单表格

```vue
<template>
  <BaseTable
    :columns="columns"
    :data="tableData"
    :loading="isLoading"
  />
</template>

<script setup>
import BaseTable from '@/components/base/BaseTable.vue'

const columns = [
  { key: 'name', title: '姓名', width: '150px' },
  { key: 'age', title: '年龄', width: '100px', align: 'center' },
  { key: 'email', title: '邮箱', width: '200px' }
]

const tableData = [
  { name: '张三', age: 25, email: 'zhangsan@example.com' },
  { name: '李四', age: 30, email: 'lisi@example.com' }
]
</script>
```

### 2. 带选择功能的表格

```vue
<template>
  <BaseTable
    :columns="columns"
    :data="tableData"
    :selected-rows="selectedRows"
    checkbox-column
    @selection-change="handleSelectionChange"
  />
</template>

<script setup>
const selectedRows = ref([])

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
  console.log('选中的行:', selection)
}
</script>
```

### 3. 自定义列内容

```vue
<template>
  <BaseTable
    :columns="columns"
    :data="tableData"
  >
    <!-- 状态列自定义渲染 -->
    <template #status="{ row }">
      <span 
        class="status-badge"
        :class="`status-badge--${row.status}`"
      >
        {{ getStatusText(row.status) }}
      </span>
    </template>
    
    <!-- 操作列 -->
    <template #actions="{ row }">
      <div class="action-buttons">
        <BaseButton size="sm" @click="handleEdit(row)">编辑</BaseButton>
        <BaseButton size="sm" variant="danger" @click="handleDelete(row)">删除</BaseButton>
      </div>
    </template>
  </BaseTable>
</template>
```

## 🔧 Props 配置

### 基础配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `columns` | `Column[]` | `[]` | 列配置数组 |
| `data` | `any[]` | `[]` | 表格数据 |
| `loading` | `boolean` | `false` | 加载状态 |
| `empty-text` | `string` | `'暂无数据'` | 空数据提示文本 |

### 样式配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `bordered` | `boolean` | `true` | 是否显示边框 |
| `striped` | `boolean` | `false` | 是否显示斑马纹 |
| `hoverable` | `boolean` | `true` | 是否启用悬停效果 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 表格尺寸 |

### 功能配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `selectable` | `boolean` | `false` | 是否可选择行 |
| `checkbox-column` | `boolean` | `false` | 是否显示复选框列 |
| `selected-rows` | `any[]` | `[]` | 已选择的行 |
| `row-key` | `string \| Function` | - | 行数据的唯一标识 |

## 📊 Column 配置

### 基本属性

```typescript
interface Column {
  key: string          // 数据字段名
  title: string        // 列标题
  width?: string       // 列宽度
  align?: 'left' | 'center' | 'right'  // 对齐方式
  sortable?: boolean   // 是否可排序
  render?: Function    // 自定义渲染函数
}
```

### 示例配置

```javascript
const columns = [
  {
    key: 'name',
    title: '用户名',
    width: '150px',
    align: 'left'
  },
  {
    key: 'status',
    title: '状态',
    width: '100px',
    align: 'center',
    sortable: true
  },
  {
    key: 'actions',
    title: '操作',
    width: '120px',
    align: 'center'
  }
]
```

## 🎨 样式定制

### 状态徽章样式

```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge--active {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-badge--inactive {
  background: rgba(107, 114, 128, 0.1);
  color: #4b5563;
}
```

### 操作按钮样式

```css
.action-buttons {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
}
```

## 📱 响应式设计

表格组件自动适配不同屏幕尺寸：

- **桌面端**: 完整的表格布局
- **平板端**: 适当调整间距和字体
- **移动端**: 自动转换为卡片式布局

## 🔄 事件处理

### 选择事件

```vue
<template>
  <BaseTable
    @selection-change="handleSelectionChange"
    @row-click="handleRowClick"
  />
</template>

<script setup>
const handleSelectionChange = (selectedRows) => {
  console.log('选中行数:', selectedRows.length)
}

const handleRowClick = (row, index) => {
  console.log('点击行:', row, '索引:', index)
}
</script>
```

### 排序事件

```vue
<template>
  <BaseTable
    @sort-change="handleSortChange"
  />
</template>

<script setup>
const handleSortChange = (column, order) => {
  console.log('排序字段:', column.key, '排序方向:', order)
}
</script>
```

## 💡 最佳实践

### 1. 数据处理

```javascript
// 推荐：使用计算属性处理表格数据
const tableData = computed(() => {
  return rawData.value.map(item => ({
    ...item,
    // 添加额外的显示字段
    displayName: `${item.firstName} ${item.lastName}`,
    statusText: getStatusText(item.status)
  }))
})
```

### 2. 加载状态

```javascript
// 推荐：正确处理加载状态
const fetchData = async () => {
  isLoading.value = true
  try {
    const response = await api.getData()
    tableData.value = response.data
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    isLoading.value = false
  }
}
```

### 3. 性能优化

```javascript
// 推荐：使用 rowKey 提升渲染性能
const rowKey = (row) => row.id

// 推荐：大数据集使用虚拟滚动
const pageSize = 50
const currentPage = ref(1)
```

## 🎯 实际应用示例

### 用户管理表格

```vue
<template>
  <BaseTable
    :columns="userColumns"
    :data="users"
    :loading="loading"
    checkbox-column
    hoverable
    @selection-change="handleUserSelection"
  >
    <template #avatar="{ row }">
      <img :src="row.avatar" class="user-avatar" />
    </template>
    
    <template #status="{ row }">
      <span class="status-badge" :class="`status-${row.status}`">
        {{ row.statusText }}
      </span>
    </template>
    
    <template #actions="{ row }">
      <BaseButton size="sm" @click="editUser(row)">编辑</BaseButton>
      <BaseButton size="sm" variant="danger" @click="deleteUser(row)">删除</BaseButton>
    </template>
  </BaseTable>
</template>
```

### 工作流管理表格

```vue
<template>
  <BaseTable
    :columns="workflowColumns"
    :data="workflows"
    :loading="loading"
  >
    <template #progress="{ row }">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${row.progress}%` }"
        ></div>
      </div>
      <span class="progress-text">{{ row.progress }}%</span>
    </template>
  </BaseTable>
</template>
```

## 🚀 高级功能

### 1. 自定义空状态

```vue
<template>
  <BaseTable :data="[]" empty-text="没有找到相关数据">
    <template #empty>
      <div class="custom-empty">
        <img src="/empty-state.svg" alt="空状态" />
        <p>暂时没有数据</p>
        <BaseButton @click="refresh">刷新数据</BaseButton>
      </div>
    </template>
  </BaseTable>
</template>
```

### 2. 批量操作

```vue
<template>
  <div>
    <div v-if="selectedRows.length > 0" class="batch-actions">
      <span>已选择 {{ selectedRows.length }} 项</span>
      <BaseButton @click="batchDelete">批量删除</BaseButton>
      <BaseButton @click="batchExport">批量导出</BaseButton>
    </div>
    
    <BaseTable
      :selected-rows="selectedRows"
      checkbox-column
      @selection-change="selectedRows = $event"
    />
  </div>
</template>
```

---

这个表格组件提供了简洁直观的设计风格，同时保持了高度的灵活性和可定制性。通过合理使用插槽和事件，可以满足各种复杂的业务需求。
