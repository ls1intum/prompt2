import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface DarkModeContextProps {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const DarkModeContext = createContext<DarkModeContextProps | undefined>(undefined)

export const useDarkMode = (): DarkModeContextProps => {
  const context = useContext(DarkModeContext)
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}

const getSystemTheme = (): Theme => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) return savedTheme
    return 'system'
  })

  useEffect(() => {
    const root = document.documentElement
    const currentTheme = theme === 'system' ? getSystemTheme() : theme

    if (currentTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const root = document.documentElement
        if (e.matches) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [theme])

  return <DarkModeContext.Provider value={{ theme, setTheme }}>{children}</DarkModeContext.Provider>
}

export default DarkModeProvider
