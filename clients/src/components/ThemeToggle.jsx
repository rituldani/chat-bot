import React, { useEffect, useState } from 'react'
// import { Moon, Sun } from 'lucide-react'
import { BsMoon, BsSun } from 'react-icons/bs'


const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 bg-gray-200 dark:bg-gray-800 text-black dark:text-white p-2 rounded-full shadow-md"
    >
      {isDark ? <BsSun size={20} /> : <BsMoon size={20} />}
    </button>
  )
}

export default ThemeToggle
