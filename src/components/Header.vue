<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import {
  getSupportedEpVersions,
  getSupportedVueVersions,
} from '../utils/dependency'
import type { ComputedRef } from 'vue'
import type { ReplStore, VersionKey } from '@/composables/store'

const { store } = defineProps<{
  store: ReplStore
}>()

interface Version {
  text: string
  published: ComputedRef<string[]>
  active: string
}

const versions = reactive<Record<VersionKey, Version>>({
  arco: {
    text: 'Arco Vue',
    published: getSupportedEpVersions(),
    active: store.versions.arco,
  },
  vue: {
    text: 'Vue',
    published: getSupportedVueVersions(),
    active: store.versions.vue,
  },
})

async function setVersion(key: VersionKey, v: string) {
  versions[key].active = `loading...`
  await store.setVersion(key, v)
  versions[key].active = v
}

async function copyLink() {
  await navigator.clipboard.writeText(location.href)
  Message.success('Sharable URL has been copied to clipboard.')
}
</script>

<template>
  <nav class="header-nav">
    <a-space class="left">
      <img class="logo" alt="logo" src="../assets/logo.svg" />
      <div class="title">Playground</div>
    </a-space>

    <a-space class="links">
      <a-space v-for="(v, key) of versions" :key="key">
        <span>{{ v.text }} Version:</span>
        <a-select
          :model-value="v.active"
          class="!w-30"
          size="small"
          fit-input-width
          @change="setVersion(key, $event)"
        >
          <a-option v-for="ver of v.published" :key="ver" :value="ver">
            {{ ver }}
          </a-option>
        </a-select>
      </a-space>

      <a-button type="text" size="small" class="share" @click="copyLink">
        <template #icon>
          <icon-share-alt />
        </template>
      </a-button>

      <a-button type="text" size="small" title="View on GitHub" class="github">
        <template #icon>
          <a
            href="https://github.com/hehehai/arco-vue-playground"
            target="_blank"
          >
            <icon-github />
          </a>
        </template>
      </a-button>
    </a-space>
  </nav>
</template>

<style scoped>
.header-nav {
  position: relative;
  z-index: 999;
  display: flex;
  justify-content: space-between;
  height: 56px;
  padding-left: 10px;
  padding-right: 10px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-2);
}

.header-nav .logo {
  width: 160px;
}
</style>
