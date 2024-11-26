import * as React from "react"
import { Monitor, Moon, Sun } from 'lucide-react'

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<'system' | 'light' | 'dark'>('system')

  const handleThemeChange = (value: string) => {
    if (value) {
      setTheme(value as 'system' | 'light' | 'dark')
      // Add your theme change logic here
    }
  }

  return (
      <ToggleGroup
        variant="outline"
        type="single"
        value={theme}
        onValueChange={handleThemeChange}
        className="bg-background/50 backdrop-blur-xl border rounded-full p-0.5"
      >
        <ToggleGroupItem 
          value="system" 
          aria-label="System theme"
          className="rounded-full data-[state=on]:bg-muted"
        >
          <Monitor className="h-1 w-1" />
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="light" 
          aria-label="Light theme"
          className="rounded-full data-[state=on]:bg-muted"
        >
          <Sun className="h-1 w-1" />
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="dark" 
          aria-label="Dark theme"
          className="rounded-full data-[state=on]:bg-muted"
        >
          <Moon className="h-1 w-1" />
        </ToggleGroupItem>
      </ToggleGroup>
  )
}

