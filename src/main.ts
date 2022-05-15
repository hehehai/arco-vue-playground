import { createApp } from 'vue'
import '@arco-design/web-vue/es/message/style/index.css'

import '@vue/repl/style.css'
import 'uno.css'

import App from '@/App.vue'

// @ts-expect-error Custom window property
window.VUE_DEVTOOLS_CONFIG = {
  defaultSelectedAppId: 'repl',
}

const app = createApp(App)

app.mount('#app')
