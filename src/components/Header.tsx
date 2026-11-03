import { Moon, RotateCcw, Sun } from 'lucide-react'
import type { ComponentProps } from 'react'
import type { Tool } from '../types'
import { SettingsMenu } from './SettingsMenu'

interface Props {
  tools: Tool[]
  tool: Tool
  theme: 'light' | 'dark'
  settings: Omit<ComponentProps<typeof SettingsMenu>, 'tool'>
  onTool: (id: Tool['id']) => void
  onTheme: () => void
  onReset: () => void
}

const ghost = 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'

export function Header(p: Props) {
  return (
    <header className="relative flex items-center gap-5 border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2.5">
        <img src="/favicon.svg" alt="" className="h-7 w-7" />
        <div className="leading-tight">
          <div className="font-semibold text-slate-900 dark:text-white">SDD Workflow</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Spec-Driven Development</div>
        </div>
      </div>

      {/* Centralizado sobre a coluna principal (laterais de 21rem e 23rem no App) */}
      <div className="absolute left-[calc(50%-1rem)] flex -translate-x-1/2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        {p.tools.map((t) => (
          <button
            key={t.id}
            onClick={() => p.onTool(t.id)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              p.tool.id === t.id
                ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <SettingsMenu tool={p.tool} {...p.settings} />
        <button
          onClick={p.onTheme}
          title={p.theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          className={`rounded-md border border-slate-200 p-2 dark:border-slate-700 ${ghost}`}
        >
          {p.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={p.onReset}
          className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:bg-rose-950 dark:hover:text-rose-300"
        >
          <RotateCcw size={15} /> Nova simulação
        </button>
      </div>
    </header>
  )
}
