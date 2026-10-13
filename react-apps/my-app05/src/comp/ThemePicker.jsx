import { useThemeStore } from '../stores/themeStore'
import { THEME_KEYS, THEMES } from '../utils/themes'

// 테마 고르기 버튼 묶음
export default function ThemePicker() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  return (
    <div role="radiogroup" aria-label="테마 선택" className="flex gap-0.5 rounded-full border-2 border-line bg-surface p-0.5">
      {THEME_KEYS.map((key) => (
        <button
          key={key}
          role="radio"
          aria-checked={theme === key}
          title={`${THEMES[key].label} 테마`}
          onClick={() => setTheme(key)}
          className={`h-8 w-8 rounded-full text-base transition hover:scale-110 ${
            theme === key ? 'bg-soft ring-2 ring-point' : 'opacity-60 hover:opacity-100'
          }`}
        >
          {THEMES[key].mascot}
        </button>
      ))}
    </div>
  )
}
