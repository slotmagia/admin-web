<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useAuthStore } from './stores/auth'
  import { useUIStore } from './stores/ui'

  const authStore = useAuthStore()
  const uiStore = useUIStore()

  onMounted(async () => {
    // 初始化UI状态
    uiStore.initialize()
    
    // 初始化认证状态
    await authStore.initializeAuth()
  })
</script>

<template>
  <div id="app" class="app">
    <!-- 路由视图 -->
    <router-view />
  </div>
</template>

<style scoped>
  #app {
    font-family: var(--font-family-sans);
  }
</style>
