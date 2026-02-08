import { ref, watch } from 'vue'

const THEME_KEY = 'theme'

function getInitialDark(): boolean {
  if (typeof document === 'undefined') return false
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark') return true
  if (saved === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyDark(dark: boolean) {
  if (typeof document === 'undefined') return
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
}

export function initTheme() {
  const dark = getInitialDark()
  applyDark(dark)
}

export function useTheme() {
  const isDark = ref(getInitialDark())

  watch(
    isDark,
    (dark) => {
      applyDark(dark)
    },
    { immediate: false }
  )

  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}
