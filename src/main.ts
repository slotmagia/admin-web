import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

// 引入样式
import '@vue-flow/core/dist/style.css'
import './assets/styles/main.css'

// 创建应用实例
const app = createApp(App)

// 创建Pinia实例
const pinia = createPinia()

// 配置Pinia持久化插件
pinia.use(piniaPluginPersistedstate)

// 安装插件
app.use(pinia)
app.use(router)

// 挂载应用
app.mount('#app')
