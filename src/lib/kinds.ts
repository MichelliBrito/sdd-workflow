import type { FileKind } from '../types'

export const KIND_STYLE: Record<FileKind, { label: string; text: string; dot: string }> = {
  agent: { label: 'Skill / command do agente', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  spec: { label: 'Artefato de spec', text: 'text-sky-700 dark:text-sky-400', dot: 'bg-sky-500' },
  config: { label: 'Config / templates / scripts', text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400' },
  code: { label: 'Código da aplicação', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
}
