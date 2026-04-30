export default defineNuxtPlugin(() => {
  if (!process.client) return

  try {
    localStorage.setItem('nuxt-color-mode', 'light')
  }
  catch {
    // ignore storage errors
  }

  const html = document.documentElement
  html.classList.remove('dark')
  html.classList.add('light')
})
