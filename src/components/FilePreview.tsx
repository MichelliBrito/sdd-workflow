import { X } from 'lucide-react'
import { useEffect } from 'react'
import { KIND_STYLE } from '../lib/kinds'
import type { FileEntry } from '../types'

const FALLBACK: Record<FileEntry['kind'], string> = {
  agent: 'Arquivo de instruções do agente instalado pela ferramenta.',
  spec: 'Artefato de especificação gerado pelo agente neste workflow.',
  config: 'Arquivo de configuração/infra da ferramenta. Normalmente você não edita à mão: os comandos usam estes templates e scripts.',
  code: 'Código da aplicação. O conteúdo real depende do que o agente gerar no seu projeto.',
}

export function FilePreview({ entry, rootName, onClose }: { entry: FileEntry; rootName: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const style = KIND_STYLE[entry.kind]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6 backdrop-blur-sm" onClick={onClose}>
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3 dark:border-slate-700">
          <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
          <div className="min-w-0">
            <div className="truncate font-mono text-sm text-slate-900 dark:text-slate-100">
              {rootName}/{entry.path}
            </div>
            <div className="text-xs text-slate-500">{style.label} · conteúdo de exemplo</div>
          </div>
          <button onClick={onClose} className="ml-auto rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <pre className="overflow-auto bg-slate-50 px-5 py-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-slate-800 dark:bg-slate-950 dark:text-slate-200">
          {entry.preview ?? FALLBACK[entry.kind]}
        </pre>
      </div>
    </div>
  )
}
