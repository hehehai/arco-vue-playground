<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import {
  getSupportedArcoVersions,
  getSupportedVueVersions,
} from '../utils/dependency'
import LogoArco from '../assets/logo-arco-design.svg'
import LogoArcoDark from '../assets/logo-arco-design-dark.svg'
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

const appDark = useDark({
  selector: 'body',
  attribute: 'arco-theme',
  valueDark: 'dark',
  valueLight: 'light',
  storageKey: 'arco-theme',
})
const replDark = useDark()
const toggleAppTheme = useToggle(appDark)
const toggleReplTheme = useToggle(replDark)

const toggleTheme = () => {
  toggleAppTheme()
  toggleReplTheme()
}

const logoSVG = computed(() => {
  return appDark.value ? LogoArcoDark : LogoArco
})

const versions = reactive<Record<VersionKey, Version>>({
  arco: {
    text: 'Arco Vue',
    published: getSupportedArcoVersions(),
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
      <img class="logo" alt="logo" :src="logoSVG" />
      <div class="title">Playground</div>
    </a-space>

    <a-space class="links">
      <a-space v-for="(v, key) of versions" :key="key">
        <span class="label">{{ v.text }} Version:</span>
        <a-select :model-value="v.active" class="!w-30" size="small" fit-input-width @change="setVersion(key, $event)">
          <a-option v-for="ver of v.published" :key="ver" :value="ver">
            {{ ver }}
          </a-option>
        </a-select>
      </a-space>

      <a-tooltip content="Arco Vue 官网">
        <a-link class="link-icon" href="https://arco.design/" target="_blank">
          <img alt="arco vue" src="../assets/arco-icon.svg" />
        </a-link>
      </a-tooltip>

      <a-tooltip content="Vue 官网">
        <a-link class="link-icon" href="https://staging-cn.vuejs.org/" target="_blank">
          <img alt="vue" src="../assets/vue-icon.svg" />
        </a-link>
      </a-tooltip>

      <a-tooltip content="明暗切换">
        <a-link class="link-icon" @click.prevent="toggleTheme()">
          <icon-moon-fill v-if="appDark" />
          <icon-sun-fill v-else />
        </a-link>
      </a-tooltip>

      <a-tooltip content="分享代码">
        <a-link class="link-icon" @click.prevent="copyLink">
          <icon-share-alt />
        </a-link>
      </a-tooltip>

      <a-tooltip content="查看源码">
        <a-link class="link-icon" href="https://github.com/hehehai/arco-vue-playground" target="_blank">
          <icon-github />
        </a-link>
      </a-tooltip>
    </a-space>
  </nav>
</template>

<style scoped>
.header-nav {
  position: relative;
  z-index: 999;
  display: flex;
  justify-content: space-between;
  height: var(--nav-height);
  padding-left: 10px;
  padding-right: 10px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-2);
}

.header-nav .logo {
  width: 160px;
}

.header-nav .title,
.links .label {
  color: var(--color-text-1);
}

.link-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 26px;
  width: 26px;
  border-radius: var(--border-radius-small);
  color: rgba(var(--primary-6));
}

.link-icon img {
  width: 20px;
  height: 20px;
}

@media (max-width: 720px) {
  .header-nav {
    height: auto;
    flex-wrap: wrap;
    justify-content: center;
  }

  .logo {
    margin: 12px 0;
  }

  .links {
    margin-bottom: 12px;
  }

  .links .label {
    font-size: 12px;
  }

  .link-icon {
    display: none;
  }
}
</style>
