export const appDark = useDark({
  onChanged(dark: boolean) {
    dark ? document.body.setAttribute('arco-theme', 'dark') :
      document.body.removeAttribute('arco-theme');
    dark ? document.documentElement.classList.add('dark') :
      document.documentElement.classList.remove('dark')
  },
})

export const toggleDark = useToggle(appDark)

export const theme = computed(() => {
  return appDark.value ? 'dark' : 'light'
})