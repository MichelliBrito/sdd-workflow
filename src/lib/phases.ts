import type { PhaseId } from '../types'

interface PhaseStyle {
  label: string
  /** Círculo numerado no stepper. */
  circle: string
  /** Fundo + borda esquerda do passo ativo. */
  active: string
  text: string
  chip: string
}

// Classes completas (não interpoladas) para o Tailwind detectar.
export const PHASES: Record<PhaseId, PhaseStyle> = {
  setup: {
    label: 'Setup',
    circle: 'border-slate-400 text-slate-600 dark:text-slate-300',
    active: 'bg-slate-100 border-l-slate-500 dark:bg-slate-800/70',
    text: 'text-slate-700 dark:text-slate-200',
    chip: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  },
  principles: {
    label: 'Princípios',
    circle: 'border-violet-400 text-violet-600 dark:text-violet-300',
    active: 'bg-violet-50 border-l-violet-500 dark:bg-violet-950/50',
    text: 'text-violet-700 dark:text-violet-300',
    chip: 'bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-200',
  },
  explore: {
    label: 'Explorar',
    circle: 'border-violet-400 text-violet-600 dark:text-violet-300',
    active: 'bg-violet-50 border-l-violet-500 dark:bg-violet-950/50',
    text: 'text-violet-700 dark:text-violet-300',
    chip: 'bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-200',
  },
  analysis: {
    label: 'Análise',
    circle: 'border-violet-400 text-violet-600 dark:text-violet-300',
    active: 'bg-violet-50 border-l-violet-500 dark:bg-violet-950/50',
    text: 'text-violet-700 dark:text-violet-300',
    chip: 'bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-200',
  },
  specify: {
    label: 'Especificar',
    circle: 'border-sky-400 text-sky-600 dark:text-sky-300',
    active: 'bg-sky-50 border-l-sky-500 dark:bg-sky-950/50',
    text: 'text-sky-700 dark:text-sky-300',
    chip: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200',
  },
  plan: {
    label: 'Planejar',
    circle: 'border-indigo-400 text-indigo-600 dark:text-indigo-300',
    active: 'bg-indigo-50 border-l-indigo-500 dark:bg-indigo-950/50',
    text: 'text-indigo-700 dark:text-indigo-300',
    chip: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200',
  },
  solutioning: {
    label: 'Solução',
    circle: 'border-cyan-400 text-cyan-600 dark:text-cyan-300',
    active: 'bg-cyan-50 border-l-cyan-500 dark:bg-cyan-950/50',
    text: 'text-cyan-700 dark:text-cyan-300',
    chip: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-200',
  },
  tasks: {
    label: 'Tarefas',
    circle: 'border-amber-400 text-amber-600 dark:text-amber-300',
    active: 'bg-amber-50 border-l-amber-500 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    chip: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  },
  implement: {
    label: 'Implementar',
    circle: 'border-emerald-400 text-emerald-600 dark:text-emerald-300',
    active: 'bg-emerald-50 border-l-emerald-500 dark:bg-emerald-950/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200',
  },
  verify: {
    label: 'Verificar',
    circle: 'border-rose-400 text-rose-600 dark:text-rose-300',
    active: 'bg-rose-50 border-l-rose-500 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    chip: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200',
  },
  archive: {
    label: 'Arquivar',
    circle: 'border-rose-400 text-rose-600 dark:text-rose-300',
    active: 'bg-rose-50 border-l-rose-500 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    chip: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200',
  },
}
