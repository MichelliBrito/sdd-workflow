import { useCallback, useEffect, useMemo, useState } from 'react'
import { CompareModal } from './components/CompareTab'
import { FilePreview } from './components/FilePreview'
import { FileTree } from './components/FileTree'
import { Header } from './components/Header'
import { StepPanel } from './components/StepPanel'
import { Stepper } from './components/Stepper'
import { AGENTS } from './data/agents'
import { bmad } from './data/bmad'
import { openspec } from './data/openspec'
import { speckit } from './data/speckit'
import { usePersistentState } from './hooks/usePersistentState'
import { buildTree } from './lib/buildTree'
import type { AgentId, FileEntry, Tool } from './types'

const TOOLS: Tool[] = [speckit, openspec, bmad]

type ToolId = Tool['id']

interface State {
  toolId: ToolId
  agentId: AgentId
  theme: 'light' | 'dark'
  stepId: Record<string, string>
  /** Prompts editados por "ferramenta:agente" → passo. */
  prompts: Record<string, Record<string, string>>
  done: Record<string, Record<string, boolean>>
  showOptional: boolean
  expanded: boolean
  font: number
}

const prefersDark = () => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

const INITIAL: State = {
  toolId: 'speckit',
  agentId: 'claude',
  theme: prefersDark() ? 'dark' : 'light',
  stepId: {},
  prompts: {},
  done: {},
  showOptional: true,
  expanded: false,
  font: 1,
}

export default function App() {
  const [state, setState] = usePersistentState<State>('sdd-demo:v1', INITIAL)
  const [preview, setPreview] = useState<FileEntry | null>(null)
  const [comparing, setComparing] = useState(false)
  const set = useCallback((patch: Partial<State>) => setState((s) => ({ ...s, ...patch })), [setState])

  const tool = TOOLS.find((t) => t.id === state.toolId) ?? speckit
  const agent = AGENTS.find((a) => a.id === state.agentId) ?? AGENTS[0]
  const promptKey = `${tool.id}:${agent.id}`
  const steps = useMemo(
    () =>
      tool
        .steps(agent)
        .filter((s) => (state.showOptional || !s.optional) && (state.expanded || !tool.hasExpandedProfile || !s.expandedOnly)),
    [tool, agent, state.showOptional, state.expanded],
  )
  const current = Math.max(0, steps.findIndex((s) => s.id === state.stepId[tool.id]))
  const step = steps[current]
  const prompts = state.prompts[promptKey] ?? {}
  const done = state.done[tool.id] ?? {}
  const prompt = prompts[step.id] ?? step.defaultPrompt

  const tree = useMemo(() => buildTree(steps, current, state.expanded), [steps, current, state.expanded])

  const go = useCallback(
    (i: number) => {
      const next = steps[Math.min(steps.length - 1, Math.max(0, i))]
      setState((s) => ({ ...s, stepId: { ...s.stepId, [tool.id]: next.id } }))
    },
    [steps, tool.id, setState],
  )

  const setPrompt = (value: string | undefined) =>
    setState((s) => {
      const forKey = { ...(s.prompts[promptKey] ?? {}) }
      if (value === undefined) delete forKey[step.id]
      else forKey[step.id] = value
      return { ...s, prompts: { ...s.prompts, [promptKey]: forKey } }
    })

  const setDone = (id: string, value: boolean) =>
    setState((s) => ({ ...s, done: { ...s.done, [tool.id]: { ...(s.done[tool.id] ?? {}), [id]: value } } }))

  // ←/→ navegam entre passos (fora de campos de texto)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (comparing || preview || t.closest('textarea, input')) return
      if (e.key === 'ArrowRight') {
        setDone(steps[current].id, true)
        go(current + 1)
      }
      if (e.key === 'ArrowLeft') go(current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, current, comparing, preview])

  useEffect(() => {
    document.documentElement.style.fontSize = `${state.font * 100}%`
  }, [state.font])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
  }, [state.theme])

  const reset = () => {
    if (confirm('Começar uma nova simulação? Prompts editados e progresso serão apagados.')) {
      setState({ ...INITIAL, toolId: state.toolId, agentId: state.agentId, theme: state.theme, font: state.font })
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        tools={TOOLS}
        tool={tool}
        theme={state.theme}
        settings={{
          agents: AGENTS,
          agent,
          showOptional: state.showOptional,
          expanded: state.expanded,
          onAgent: (agentId) => set({ agentId }),
          onShowOptional: (showOptional) => set({ showOptional }),
          onExpanded: (expanded) => set({ expanded }),
          onCompare: () => setComparing(true),
          onFont: (d) => set({ font: Math.min(1.6, Math.max(0.8, +(state.font + d).toFixed(1))) }),
        }}
        onTool={(toolId) => set({ toolId })}
        onTheme={() => set({ theme: state.theme === 'dark' ? 'light' : 'dark' })}
        onReset={reset}
      />

      <div className="grid min-h-0 flex-1 grid-cols-[21rem_minmax(0,1fr)_23rem]">
        <aside className="min-h-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <Stepper
            toolName={tool.name}
            steps={steps}
            current={current}
            done={done}
            onSelect={go}
            onToggleDone={(id) => setDone(id, !done[id])}
          />
        </aside>

        <main className="min-h-0 overflow-y-auto">
          <StepPanel
            key={`${tool.id}-${step.id}`}
            step={step}
            agentName={agent.name}
            toolName={tool.name}
            index={current}
            total={steps.length}
            prompt={prompt}
            onPrompt={setPrompt}
            onRestore={() => setPrompt(undefined)}
            onCopied={() => setDone(step.id, true)}
            onPrev={() => go(current - 1)}
            finished={steps.every((s) => done[s.id])}
            onFinish={() =>
              setState((s) => ({
                ...s,
                done: { ...s.done, [tool.id]: { ...(s.done[tool.id] ?? {}), ...Object.fromEntries(steps.map((st) => [st.id, true])) } },
              }))
            }
            onNext={() => {
              setDone(step.id, true)
              go(current + 1)
            }}
          />
        </main>

        <aside className="min-h-0 border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <FileTree key={promptKey} root={tree} rootName={tool.rootName} collapsed={tool.collapsed} onOpen={setPreview} />
        </aside>
      </div>

      {comparing && <CompareModal onClose={() => setComparing(false)} />}
      {preview && <FilePreview entry={preview} rootName={tool.rootName} onClose={() => setPreview(null)} />}
    </div>
  )
}
