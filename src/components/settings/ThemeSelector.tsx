import { Circle } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface ThemeOption {
  value: 'light' | 'dark' | 'black'
  label: string
  icon: React.ReactNode
  description: string
  preview: string[]
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const themes: ThemeOption[] = [
    {
      value: 'light',
      label: 'Light',
      icon: <Circle className="h-5 w-5" />,
      description: 'Bright and welcoming',
      preview: ['#FEF7EF', '#FFFFFF', '#232D3F']
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <Circle className="h-5 w-5" />,
      description: 'Easy on the eyes',
      preview: ['#111827', '#1F2937', '#F9FAFB']
    },
    {
      value: 'black',
      label: 'Black',
      icon: <Circle className="h-5 w-5" />,
      description: 'OLED perfection',
      preview: ['#000000', '#0F0F0F', '#FFFFFF']
    }
  ]

  if (!mounted) return null

  return (
    <div className="space-y-3">
      {themes.map((option) => {
        const isSelected = theme === option.value
        
        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`
              w-full p-4 rounded-xl border-2 transition-all duration-200
              flex items-center gap-4 text-left
              ${isSelected 
                ? 'border-sage bg-sage/5 shadow-sm' 
                : 'border-gray-200 hover:border-gray-300 bg-surface'
              }
            `}
          >
            <div className={`
              p-2 rounded-lg transition-colors
              ${isSelected 
                ? 'bg-sage text-white' 
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              {option.icon}
            </div>
            
            <div className="flex-1">
              <div className="font-semibold text-content-primary">
                {option.label}
              </div>
              <div className="text-xs text-content-tertiary">
                {option.description}
              </div>
            </div>
            
            <div className="flex gap-1">
              {option.preview.map((color, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border border-border-subtle"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-sage flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
