<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import WorkflowEditor from './components/WorkflowEditor.vue'
  import { useUIStore } from './stores/ui'

  // 使用ref来管理UI状态
  const isDarkMode = ref(false)
  let uiStore: ReturnType<typeof useUIStore>

  onMounted(() => {
    // 在组件挂载后初始化Pinia store
    uiStore = useUIStore()
    
    // 初始化主题和用户偏好
    uiStore.initialize()
    
    // 同步暗色模式状态
    isDarkMode.value = uiStore.isDarkMode
  })

  // 切换主题函数
  const toggleTheme = () => {
    if (uiStore) {
      uiStore.toggleTheme()
      isDarkMode.value = uiStore.isDarkMode
    }
  }
</script>

<template>
  <div id="app" class="h-screen flex flex-col">
    <header class="bg-surface border-b px-4 py-2">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold">AI 工作流编辑器</h1>
        <div class="flex items-center gap-2">
          <button
            @click="toggleTheme"
            class="px-3 py-1 rounded bg-primary text-white hover:bg-primary-hover transition"
          >
            {{ isDarkMode ? '☀️' : '🌙' }}
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-hidden">
      <WorkflowEditor />
    </main>
  </div>
</template>

<style scoped>
  #app {
    font-family: var(--font-family-sans);
  }
</style>
