import { BookOpen, Check, ChevronDown, Columns2, Minus, Plus, SlidersHorizontal } from 'lucide-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import type { Agent, AgentId, Tool } from '../types'
import { Toggle } from './Toggle'

interface Props {
  tool: Tool
  agents: Agent[]
  agent: Agent
  showOptional: boolean
  expanded: boolean
  onAgent: (id: AgentId) => void
  onShowOptional: (v: boolean) => void
  onExpanded: (v: boolean) => void
  onCompare: () => void
  onFont: (delta: number) => void
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-slate-100 px-4 py-3 last:border-b-0 dark:border-slate-800">
      <div className="mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{title}</div>
      {children}
    </div>
  )
}

const item = 'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'

/** Agrupa as opções secundárias para o aluno focar nos passos. */
export function SettingsMenu(p: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition ${
          open
            ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-200'
            : 'border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
        }`}
      >
        <SlidersHorizontal size={15} />
        <span className="text-slate-500 dark:text-slate-400">Agente:</span>
        <span className="font-medium">{p.agent.name}</span>
        <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <Section title="Agente / harness">
            <div className="grid grid-cols-2 gap-1">
              {p.agents.map((a) => {
                const active = a.id === p.agent.id
                return (
                  <button
                    key={a.id}
                    onClick={() => p.onAgent(a.id)}
                    className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-sm transition ${
                      active
                        ? 'border-indigo-400 bg-indigo-50 font-medium text-indigo-700 dark:border-indigo-600 dark:bg-indigo-950 dark:text-indigo-200'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {a.name}
                    {active && <Check size={14} />}
                  </button>
                )
              })}
            </div>
          </Section>

          <Section title="Passos exibidos">
            <div className="space-y-2.5">
              <Toggle label="Passos opcionais" checked={p.showOptional} onChange={p.onShowOptional} />
              {p.tool.hasExpandedProfile && (
                <div>
                  <Toggle label="Perfil expandido" checked={p.expanded} onChange={p.onExpanded} />
                  <div className="mt-1 pl-11 text-xs text-slate-500 dark:text-slate-400">new, continue, ff, verify…</div>
                </div>
              )}
            </div>
          </Section>

          <Section title="Mais">
            <button
              className={item}
              onClick={() => {
                setOpen(false)
                p.onCompare()
              }}
            >
              <Columns2 size={15} /> Comparar ferramentas
            </button>
            <a href={p.tool.docsUrl} target="_blank" rel="noreferrer" className={item}>
              <BookOpen size={15} /> Documentação do {p.tool.name}
            </a>
            <div className={`${item} hover:bg-transparent dark:hover:bg-transparent`}>
              <span className="flex-1">Tamanho da fonte</span>
              <div className="flex items-center rounded-md border border-slate-200 dark:border-slate-700">
                <button onClick={() => p.onFont(-0.1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800" title="Diminuir">
                  <Minus size={13} />
                </button>
                <span className="px-1 text-xs text-slate-500">Aa</span>
                <button onClick={() => p.onFont(0.1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800" title="Aumentar">
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </Section>
        </div>
      )}
    </div>
  )
}
