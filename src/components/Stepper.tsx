import { Check } from 'lucide-react'
import { PHASES } from '../lib/phases'
import type { Step } from '../types'

interface Props {
  toolName: string
  steps: Step[]
  current: number
  done: Record<string, boolean>
  onSelect: (i: number) => void
  onToggleDone: (id: string) => void
}

export function Stepper({ toolName, steps, current, done, onSelect, onToggleDone }: Props) {
  const total = steps.length
  const completed = steps.filter((s) => done[s.id]).length

  return (
    <nav className="flex h-full flex-col">
      <div className="px-5 pt-4 pb-3">
        <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Workflow</div>
        <div className="mt-0.5 text-xl font-semibold text-indigo-700 dark:text-indigo-300">{toolName}</div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(completed / total) * 100}%` }} />
        </div>
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {completed} de {total} concluídos
        </div>
      </div>
      <ol className="flex-1 overflow-y-auto px-3 pb-4">
        {steps.map((s, i) => {
          const phase = PHASES[s.phase]
          const newPhase = i === 0 || steps[i - 1].phase !== s.phase
          const active = i === current
          const isDone = done[s.id]
          return (
            <li key={s.id}>
              {newPhase && (
                <div className={`mt-3 mb-1 px-2 text-[11px] font-semibold tracking-wider uppercase ${phase.text}`}>
                  {phase.label}
                </div>
              )}
              <div
                className={`flex items-start gap-3 rounded-r-lg border-l-4 px-3 py-2.5 transition ${
                  active ? phase.active : 'border-l-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <button
                  onClick={() => onToggleDone(s.id)}
                  title={isDone ? 'Desmarcar' : 'Marcar como concluído'}
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                    isDone
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : `bg-white dark:bg-slate-900 ${phase.circle} ${s.optional ? 'border-dashed' : ''}`
                  }`}
                >
                  {isDone ? <Check size={14} strokeWidth={3} /> : i}
                </button>
                <button onClick={() => onSelect(i)} className="min-w-0 flex-1 text-left">
                  <div
                    className={`font-mono text-sm break-all ${active ? `font-semibold ${phase.text}` : 'text-slate-800 dark:text-slate-200'}`}
                  >
                    {s.command}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400">
                    {s.title}
                    {s.optional && (
                      <span className="rounded bg-slate-200 px-1.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        opcional
                      </span>
                    )}
                    {s.expandedOnly && (
                      <span className="rounded bg-violet-100 px-1.5 text-[10px] text-violet-700 dark:bg-violet-900/60 dark:text-violet-200">
                        expandido
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
