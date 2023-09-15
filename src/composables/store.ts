import { File, type Store, type StoreState, compileFile } from '@vue/repl'
import { Message } from '@arco-design/web-vue'
import { atou, utoa } from '@/utils/encode'
import { genImportMap, genVueLink, getSkyPack } from '@/utils/dependency'
import { type ImportMap, mergeImportMap } from '@/utils/import-map'
import { IS_DEV } from '@/constants'
import mainCode from '../template/main.vue?raw'
import welcomeCode from '../template/welcome.vue?raw'
import arcoInstallCode from '../template/arco-install.js?raw'
import tsconfigCode from '../template/tsconfig.json?raw'
import { UnwrapNestedRefs } from 'vue'

export interface Initial {
  serializedState?: string
  versions?: Versions
  userOptions?: UserOptions
}
export type VersionKey = 'vue' | 'arco'
export type Versions = Record<VersionKey, string>
export interface UserOptions {
  styleSource?: string
  showHidden?: boolean
}
export type SerializeState = Record<string, string> & {
  _o?: UserOptions
}

const MAIN_FILE = 'src/PlaygroundMain.vue'
const APP_FILE = 'src/App.vue'
const ARCO_INSTALL = 'src/arco-install.js'
const LEGACY_IMPORT_MAP = 'src/import-map.json'
export const IMPORT_MAP = 'import_map.json'
export const TSCONFIG = 'tsconfig.json'

export const useStore = (initial: Initial) => {
  const versions = reactive(
    initial.versions || { vue: 'latest', arco: 'latest' }
  )

  const compiler = shallowRef<typeof import('vue/compiler-sfc')>()
  const userOptions = ref<UserOptions>(initial.userOptions || {})
  const hideFile = computed(() => !IS_DEV && !userOptions.value.showHidden)

  const files = initFiles(initial.serializedState || '')

  const state: StoreState = reactive({
    mainFile: MAIN_FILE,
    files,
    activeFile: files[APP_FILE],
    errors: [],
    vueRuntimeURL: '',
    vueServerRendererURL: '',
    typescriptVersion: 'latest',
    resetFlip: false,
  })

  const bultinImportMap = computed<ImportMap>(() => genImportMap(versions))
  const userImportMap = computed<ImportMap>(() => {
    const code = state.files[IMPORT_MAP]?.code.trim()
    if (!code) return {}
    let map: ImportMap = {}
    try {
      map = JSON.parse(code)
    } catch (err) {
      console.error(err)
    }
    return map
  })
  const importMap = computed<ImportMap>(() =>
    mergeImportMap(bultinImportMap.value, userImportMap.value)
  )

  // eslint-disable-next-line no-console
  console.log('Files:', files, 'Options:', userOptions)

  const store = reactive<Store>({
    state,
    compiler: compiler as any,
    setActive,
    addFile,
    init,
    deleteFile,
    getImportMap,
    renameFile,
    initialShowOutput: false,
    initialOutputMode: 'preview',
    reloadLanguageTools: undefined
  })

  watch(
    importMap.value,
    (content) => {
      state.files[IMPORT_MAP] = new File(
        IMPORT_MAP,
        JSON.stringify(content, undefined, 2),
        hideFile.value
      )
    },
    { immediate: true, deep: true }
  )

  watch(
    () => versions.arco,
    (version) => {
      const file = new File(
        ARCO_INSTALL,
        generateArcoInstallCode(version, userOptions.value.styleSource).trim(),
        hideFile.value
      )
      state.files[ARCO_INSTALL] = file
      compileFile(store, file)
    },
    { immediate: true }
  )

  function generateArcoInstallCode(version: string, styleSource?: string) {
    const style = styleSource
      ? styleSource.replace('#VERSION#', version)
      : getSkyPack('@arco-design/web-vue', version, '/es/index.css')
    return arcoInstallCode.replace('#STYLE#', style)
  }

  async function setVueVersion(version: string) {
    const { compilerSfc, runtimeDom } = genVueLink(version)

    compiler.value = await import(/* @vite-ignore */ compilerSfc)
    state.vueRuntimeURL = runtimeDom
    versions.vue = version

    // eslint-disable-next-line no-console
    console.info(`[@vue/repl] Now using Vue version: ${version}`)
  }

  let inited = false

  async function init() {
    console.log(state)
    if (inited) return

    await setVueVersion(versions.vue)

    state.errors = []
    for (const file of Object.values(state.files)) {
      compileFile(store, file).then((errs) => state.errors.push(...errs))
    }

    watchEffect(() =>
      compileFile(store, state.activeFile).then((errs) => (state.errors = errs))
    )

    watch(
      () => [
        state.files[TSCONFIG]?.code,
        state.typescriptVersion,
        state.locale,
        state.dependencyVersion,
      ],
      useDebounceFn(() => store.reloadLanguageTools?.(), 300),
      { deep: true }
    )

    inited = true
  }

  function getFiles() {
    const exported: Record<string, string> = {}
    for (const file of Object.values(state.files)) {
      if (file.hidden) continue
      exported[file.filename] = file.code
    }
    return exported
  }

  function serialize() {
    const state: SerializeState = { ...getFiles() }
    state._o = userOptions.value
    return utoa(JSON.stringify(state))
  }
  function deserialize(text: string): SerializeState {
    const state = JSON.parse(atou(text))
    return state
  }

  function initFiles(serializedState: string) {
    const files: StoreState['files'] = {}
    if (serializedState) {
      const saved = deserialize(serializedState)
      for (let [filename, file] of Object.entries(saved)) {
        if (filename === '_o') continue
        if (
          ![IMPORT_MAP, TSCONFIG].includes(filename) &&
          !filename.startsWith('src/')
        ) {
          filename = `src/${filename}`
        }
        if (filename === LEGACY_IMPORT_MAP) {
          filename = IMPORT_MAP
        }
        files[filename] = new File(filename, file as string)
      }
      userOptions.value = saved._o || {}
    } else {
      files[APP_FILE] = new File(APP_FILE, welcomeCode)
    }
    files[MAIN_FILE] = new File(MAIN_FILE, mainCode, hideFile.value)
    if (!files[IMPORT_MAP]) {
      files[IMPORT_MAP] = new File(
        IMPORT_MAP,
        JSON.stringify({ imports: {} }, undefined, 2)
      )
    }
    if (!files[TSCONFIG]) {
      files[TSCONFIG] = new File(TSCONFIG, tsconfigCode)
    }
    return files
  }

  function setActive(filename: string) {
    const file = state.files[filename]
    if (file.hidden) return
    state.activeFile = state.files[filename]
  }

  function addFile(fileOrFilename: string | File) {
    const file =
      typeof fileOrFilename === 'string'
        ? new File(fileOrFilename)
        : fileOrFilename
    state.files[file.filename] = file
    setActive(file.filename)
  }

  function renameFile(oldFilename: string, newFilename: string) {
    const file = state.files[oldFilename]

    if (!file) {
      state.errors = [`Could not rename "${oldFilename}", file not found`]
      return
    }

    if (!newFilename || oldFilename === newFilename) {
      state.errors = [`Cannot rename "${oldFilename}" to "${newFilename}"`]
      return
    }

    if (
      file.hidden ||
      [APP_FILE, MAIN_FILE, IMPORT_MAP].includes(oldFilename)
    ) {
      state.errors = [`Cannot rename ${oldFilename}`]
      return
    }

    file.filename = newFilename

    const newFiles: Record<string, File> = {}

    // Preserve iteration order for files
    for (const name of Object.keys(files)) {
      if (name === oldFilename) {
        newFiles[newFilename] = file
      } else {
        newFiles[name] = files[name]
      }
    }

    state.files = newFiles
    compileFile(store, file)
  }

  function deleteFile(filename: string) {
    if (filename === ARCO_INSTALL) {
      Message.warning('You cannot remove it, because Arco Vue requires it.')
      return
    }
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      if (state.activeFile.filename === filename) {
        setActive(APP_FILE)
      }
      delete state.files[filename]
    }
  }

  function getImportMap() {
    return importMap.value
  }

  async function setVersion(key: VersionKey, version: string) {
    switch (key) {
      case 'arco':
        setArcoVueVersion(version)
        break
      case 'vue':
        await setVueVersion(version)
        break
    }
  }

  function setArcoVueVersion(version: string) {
    versions.arco = version
  }


  const utils = {
    versions,
    userOptions,
    serialize,
    setVersion
  }
  Object.assign(store, utils)

  return store as Omit<typeof store, 'init'> & {
    init: typeof init
  } & UnwrapNestedRefs<typeof utils>
}

export type ReplStore = ReturnType<typeof useStore>
