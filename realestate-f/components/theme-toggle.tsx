// components/theme-toggle.tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
            <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300 dark:hidden" />
            <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300 hidden dark:block" />
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}