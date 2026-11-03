import { ArrowLeft, ArrowRight, CheckCheck } from 'lucide-react'
import { PHASES } from '../lib/phases'
import type { Step } from '../types'
import { PromptEditor } from './PromptEditor'

interface Props {
  step: Step
  index: number
  total: number
  agentName: string
  toolName: string
  prompt: string
  onPrompt: (v: string) => void
  onRestore: () => void
  onCopied: () => void
  onPrev: () => void
  onNext: () => void
  onFinish: () => void
  finished: boolean
}

function Files({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-wrap items-baseline gap-1.5">
      <span className="w-10 shrink-0 text-xs font-medium text-slate-400 dark:text-slate-500">{label}</span>
      {items.map((it) => (
        <span
          key={it}
          className="rounded border border-slate-200 px-1.5 py-px font-mono text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400"
        >
          {it}
        </span>
      ))}
    </div>
  )
}

export function StepPanel(p: Props) {
  const { step } = p
  const phase = PHASES[step.phase]
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-8 py-7">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="rounded-full border border-indigo-200 bg-white px-2.5 py-0.5 font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300">
            {p.toolName}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 font-semibold ${phase.chip}`}>{phase.label}</span>
          <span>
            Passo {p.index} de {p.total - 1}
          </span>
          {step.optional && <span className="rounded-full bg-slate-200 px-2 py-0.5 dark:bg-slate-800">opcional</span>}
          {step.badge && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-700 dark:bg-violet-900/60 dark:text-violet-200">
              {step.badge}
            </span>
          )}
        </div>
        <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-3xl font-semibold text-slate-900 dark:text-white">
          <code className={`font-mono ${phase.text}`}>{step.command}</code>
          <span className="text-lg font-normal text-slate-500 dark:text-slate-400">{step.title}</span>
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">{step.summary}</p>
        <div className="mt-4 space-y-1.5">
          <Files label="Lê" items={step.inputs} />
          <Files label="Gera" items={step.outputs} />
        </div>
      </div>

      <PromptEditor
        kind={step.kind}
        agentName={p.agentName}
        value={p.prompt}
        isDefault={p.prompt === step.defaultPrompt}
        onChange={p.onPrompt}
        onRestore={p.onRestore}
        onCopied={p.onCopied}
      />

      <div className="flex justify-between">
        <button
          onClick={p.onPrev}
          disabled={p.index === 0}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 disabled:invisible dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={16} /> Anterior
        </button>
        {p.index < p.total - 1 ? (
          <button
            onClick={p.onNext}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Próximo <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={p.onFinish}
            disabled={p.finished}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <CheckCheck size={16} /> {p.finished ? 'Workflow concluído' : 'Finalizar'}
          </button>
        )}
      </div>
    </div>
  )
}
