import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 引入样式
import '@vue-flow/core/dist/style.css'
import './assets/styles/main.css'

// 创建应用实例
const app = createApp(App)

// 创建Pinia实例
const pinia = createPinia()

// 安装插件
app.use(pinia)

// 挂载应用
app.mount('#app')
