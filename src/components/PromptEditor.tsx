import { Check, Copy, RotateCcw, Terminal, MessageSquareText } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useClipboard } from '../hooks/useClipboard'
import type { StepKind } from '../types'

interface Props {
  kind: StepKind
  agentName: string
  value: string
  isDefault: boolean
  onChange: (v: string) => void
  onRestore: () => void
  onCopied: () => void
}

export function PromptEditor({ kind, agentName, value, isDefault, onChange, onRestore, onCopied }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const { copied, copy } = useClipboard()
  const terminal = kind !== 'prompt'

  // auto-resize
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + 2}px`
  }, [value])

  const doCopy = () => {
    copy(value)
    onCopied()
  }

  return (
    <div className={`overflow-hidden rounded-xl border shadow-sm ${terminal ? 'border-slate-800 bg-slate-900 dark:border-slate-700 dark:bg-slate-950' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'}`}>
      <div
        className={`flex items-center gap-2 border-b px-4 py-2 text-xs font-medium ${
          terminal ? 'border-slate-700 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400'
        }`}
      >
        {terminal ? <Terminal size={14} /> : <MessageSquareText size={14} />}
        {terminal ? 'Terminal da IDE' : `Prompt para o ${agentName}`}
        {!isDefault && <span className="rounded bg-amber-100 px-1.5 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200">editado</span>}
        <span className="ml-auto hidden font-normal sm:inline">⌘/Ctrl + Enter copia</span>
      </div>
      <textarea
        ref={ref}
        value={value}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault()
            doCopy()
          }
        }}
        className={`block min-h-36 w-full resize-none px-4 py-3 font-mono text-[15px] leading-relaxed outline-none ${
          terminal ? 'bg-slate-900 text-emerald-300 caret-emerald-300 dark:bg-slate-950' : 'bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100'
        }`}
      />
      <div className={`flex items-center gap-2 border-t px-3 py-2 ${terminal ? 'border-slate-700' : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60'}`}>
        <button
          onClick={doCopy}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
            copied ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
        <button
          onClick={onRestore}
          disabled={isDefault}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition disabled:opacity-40 ${
            terminal ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <RotateCcw size={15} /> Restaurar default
        </button>
      </div>
    </div>
  )
}
