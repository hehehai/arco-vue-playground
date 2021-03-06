import { getCurrentInstance } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'

let installed = false
await loadStyle()

export function arcoInstall() {
  if (installed) return
  const instance = getCurrentInstance()
  instance.appContext.app.use(ArcoVue)
  instance.appContext.app.use(ArcoVueIcon)
  installed = true
}

export function loadStyle() {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '#STYLE#'
    link.addEventListener('load', resolve)
    link.addEventListener('error', reject)
    document.body.append(link)
  })
}
