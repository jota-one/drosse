import { ref } from 'vue'

const theme = ref(document.body.classList.contains('dark') ? 'dark' : 'light')

export default function useTheme() {
  const switchTheme = () => {
    const newTheme = theme.value === 'dark' ? 'light' : 'dark'
    document.body.classList.remove('dark', 'light')
    document.body.classList.add(newTheme)
    theme.value = newTheme
  }

  return { theme, switchTheme }
}
