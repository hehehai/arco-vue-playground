<script setup lang="ts">
import { Repl } from '@vue/repl'
import Monaco from '@vue/repl/monaco-editor'
import { Message } from '@arco-design/web-vue'
import Header from '@/components/Header.vue'
import { type UserOptions, type Versions, useStore } from '@/composables/store'
import type { BuiltInParserName } from 'prettier'
import type { SFCOptions } from '@vue/repl'
import type { Fn } from '@vueuse/core'
import { theme } from './composables/dark'

const loading = ref(true)

// enable experimental features
const sfcOptions: SFCOptions = {
  script: {
    reactivityTransform: true,
    defineModel: true,
  },
}

const initialUserOptions: UserOptions = {}

const params = new URLSearchParams(location.search)

const initialVersions: Versions = {
  arco: params.get('arco') || 'latest',
  vue: params.get('vue') || 'latest',
}

const store = useStore({
  serializedState: location.hash.slice(1),
  userOptions: initialUserOptions,
  versions: initialVersions,
})

const tipMsg = () => {
  Message.info({
    content:
      '服务和资源均在国外(免费的)，国内网络预计延迟2~3s(仅首次加载)，请等待一下🤪',
  })
}

store.init().then(() => {
  loading.value = false
  tipMsg()
})

// eslint-disable-next-line no-console
console.log('Store:', store)

const handleKeydown = (evt: KeyboardEvent) => {
  if ((evt.ctrlKey || evt.metaKey) && evt.code === 'KeyS') {
    evt.preventDefault()
    return
  }

  // NOTE: ctrl or alt + shift + f => format code
  if ((evt.altKey || evt.ctrlKey) && evt.shiftKey && evt.code === 'KeyF') {
    evt.preventDefault()
    formatCode()
    return
  }
}

let loadedFormat = false
const formatCode = async () => {
  let close: Fn | undefined
  if (!loadedFormat) {
    ;({ close } = Message.info({
      content: 'Loading Prettier...',
      duration: 0,
    }))
  }

  const [format, parserHtml, parserTypeScript, parserBabel, parserPostcss] =
    await Promise.all([
      import('prettier/standalone').then((r) => r.format),
      import('prettier/parser-html').then((m) => m.default),
      import('prettier/parser-typescript').then((m) => m.default),
      import('prettier/parser-babel').then((m) => m.default),
      import('prettier/parser-postcss').then((m) => m.default),
    ])
  loadedFormat = true
  close?.()

  const file = store.state.activeFile
  let parser: BuiltInParserName
  if (file.filename.endsWith('.vue')) {
    parser = 'vue'
  } else if (file.filename.endsWith('.js')) {
    parser = 'babel'
  } else if (file.filename.endsWith('.ts')) {
    parser = 'typescript'
  } else if (file.filename.endsWith('.json')) {
    parser = 'json'
  } else {
    return
  }
  file.code = await format(file.code, {
    parser,
    plugins: [parserHtml, parserTypeScript, parserBabel, parserPostcss],
    semi: false,
    singleQuote: true,
  })
}

// persist state
watchEffect(() => history.replaceState({}, '', `#${store.serialize()}`))
</script>

<template>
  <div class="antialiased">
    <Header :store="store" />
    <a-spin :loading="loading" tip="Loading ..." class="loading-wrapper">
      <Repl
        v-if="!loading"
        ref="repl"
        class="play-repl"
        :editor="Monaco"
        :store="store"
        :theme="theme"
        auto-resize
        :sfc-options="sfcOptions"
        :clear-console="false"
        show-compile-output
        :show-import-map="store.userOptions.showHidden || false"
        @keydown="handleKeydown"
      />
    </a-spin>
  </div>
</template>

<style>
body {
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  --base: #444;
  --nav-height: 52px;
}

.antialiased .play-repl {
  height: calc(100vh - var(--nav-height) - 1px);
}

.dark .play-repl,
.play-repl {
  --color-branding: rgb(var(--primary-6)) !important;
  --color-branding-dark: rgb(var(--primary-6)) !important;
}

.loading-wrapper {
  width: 100%;
  min-height: calc(100vh - var(--nav-height) - 1px);
}
</style>
