import { createApp } from 'vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'

import '@vue/repl/style.css'
import 'uno.css'

import App from '@/App.vue'

// @ts-expect-error Custom window property
window.VUE_DEVTOOLS_CONFIG = {
  defaultSelectedAppId: 'repl',
}

const app = createApp(App)

app.use(ArcoVueIcon)

app.mount('#app')
