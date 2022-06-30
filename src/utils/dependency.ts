import { compare } from 'compare-versions'
import type { MaybeRef } from '@vueuse/core'
import type { Versions } from '@/composables/store'
import type { Ref } from 'vue'
import type { ImportMap } from '@/utils/import-map'

export const getSkyPack = (
  pkg: string,
  version: string | undefined = '',
  path = ''
) => {
  version = version ? `@${version}` : ''
  return `https://cdn.skypack.dev/${pkg}${version}${path}`
}

export const genJsdelivrLink = (
  pkg: string,
  version: string | undefined,
  path = ''
) => {
  version = version ? `@${version}` : ''
  return `https://cdn.jsdelivr.net/npm/${pkg}${version}${path}`
}

export const genVueLink = (version: string) => {
  const compilerSfc = getSkyPack(
    '@vue/compiler-sfc',
    version,
    '/dist/compiler-sfc.esm-browser.js'
  )
  const runtimeDom = getSkyPack(
    '@vue/runtime-dom',
    version,
    '/dist/runtime-dom.esm-browser.js'
  )
  return {
    compilerSfc,
    runtimeDom,
  }
}

export const genImportMap = ({
  vue,
  arco,
}: Partial<Versions> = {}): ImportMap => {
  interface Dependency {
    pkg?: string
    version?: string
    path?: string
    source?: 'skyPack' | 'jsdelivr'
  }
  const deps: Record<string, Dependency> = {
    vue: {
      pkg: '@vue/runtime-dom',
      version: vue,
      path: '/dist/runtime-dom.esm-browser.js',
      source: 'jsdelivr',
    },
    '@vue/shared': {
      version: vue,
      path: '/dist/shared.esm-bundler.js',
      source: 'jsdelivr',
    },
    '@arco-design/web-vue': {
      pkg: '@arco-design/web-vue',
      version: arco,
      path: '/es/index.js',
      source: 'jsdelivr',
    },
    '@arco-design/web-vue/es/icon': {
      pkg: '@arco-design/web-vue',
      version: arco,
      path: '/es/icon/index.js',
      source: 'jsdelivr',
    },
    '@arco-design/web-vue/': {
      pkg: '@arco-design/web-vue',
      version: arco,
      path: '/',
      source: 'jsdelivr',
    },
  }

  const arcoDesignWebVueDeps: Record<string, Dependency> = {
    'resize-observer-polyfill': {
      pkg: 'resize-observer-polyfill',
      source: 'skyPack',
    },
    'compute-scroll-into-view': {
      pkg: 'compute-scroll-into-view',
      source: 'skyPack',
    },
    'scroll-into-view-if-needed': {
      pkg: 'scroll-into-view-if-needed',
      source: 'skyPack',
    },
    'b-tween': {
      pkg: 'b-tween',
      source: 'skyPack',
    },
    'b-validate': {
      pkg: 'b-validate',
      source: 'skyPack',
    },
    'number-precision': {
      pkg: 'number-precision',
      source: 'skyPack',
    },
    dayjs: {
      pkg: 'dayjs',
      source: 'skyPack',
    },
    'dayjs/plugin/customParseFormat': {
      pkg: 'dayjs',
      path: '/plugin/customParseFormat.js',
      source: 'skyPack',
    },
    'dayjs/plugin/isBetween': {
      pkg: 'dayjs',
      path: '/plugin/isBetween.js',
      source: 'skyPack',
    },
    'dayjs/plugin/weekOfYear': {
      pkg: 'dayjs',
      path: '/plugin/weekOfYear.js',
      source: 'skyPack',
    },
    'dayjs/plugin/advancedFormat': {
      pkg: 'dayjs',
      path: '/plugin/advancedFormat.js',
      source: 'skyPack',
    },
    'dayjs/plugin/weekYear': {
      pkg: 'dayjs',
      path: '/plugin/weekYear.js',
      source: 'skyPack',
    },
    'dayjs/plugin/quarterOfYear': {
      pkg: 'dayjs',
      path: '/plugin/quarterOfYear.js',
      source: 'skyPack',
    },
    'dayjs/locale/zh-cn': {
      pkg: 'dayjs',
      path: '/locale/zh-cn.js',
      source: 'skyPack',
    },
  }

  return {
    imports: Object.fromEntries(
      Object.entries({ ...deps, ...arcoDesignWebVueDeps }).map(([key, dep]) => [
        key,
        (dep.source === 'skyPack' ? getSkyPack : genJsdelivrLink)(
          dep.pkg ?? key,
          dep.version,
          dep.path
        ),
      ])
    ),
  }
}

export const getVersions = (pkg: MaybeRef<string>) => {
  const url = computed(
    () => `https://data.jsdelivr.com/v1/package/npm/${unref(pkg)}`
  )
  return useFetch(url, {
    initialData: [],
    afterFetch: (ctx) => ((ctx.data = ctx.data.versions), ctx),
    refetch: true,
  }).json<string[]>().data as Ref<string[]>
}

export const getSupportedVueVersions = () => {
  const versions = $(getVersions('vue'))
  return computed(() => {
    const canUserVersions = versions.filter((version) => compare(version, '3.2.0', '>='))
    if (canUserVersions.length) {
      canUserVersions.unshift('latest')
    }
    return canUserVersions
  }
  )
}

export const getSupportedArcoVersions = () => {
  const versions = $(getVersions('@arco-design/web-vue'))
  return computed(() => {
    const canUserVersions = versions.filter((version) => compare(version, '2.28.0', '>='))
    if (canUserVersions.length) {
      canUserVersions.unshift('latest')
    }
    return canUserVersions
  })
}
