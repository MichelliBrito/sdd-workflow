import { X } from 'lucide-react'
import { useEffect } from 'react'

const ROWS: [string, string, string, string][] = [
  ['Unidade de trabalho', 'Feature (specs/NNN-nome/)', 'Change (openspec/changes/nome/)', 'Produto: PRD → arquitetura → épicos e stories'],
  ['Melhor para', 'Greenfield / features novas', 'Brownfield / evoluir sistema existente', 'Projetos maiores, simulando um time com papéis (PM, arquiteto, dev)'],
  ['Princípios do projeto', '.specify/memory/constitution.md', 'openspec/config.yaml (context + rules)', '_bmad/config.toml + contexto do projeto (AGENTS.md)'],
  ['Fluxo principal', 'constitution → specify → plan → tasks → implement → converge', 'propose → apply → archive', 'prd → architecture → epics-and-stories → sprint-planning → build'],
  ['Quality gates opcionais', 'clarify, checklist, analyze', 'explore, update, verify, openspec validate', 'brief, ux, code-review, qa e2e, retrospective'],
  ['Formato da spec', 'User stories + FR-001… + critérios de sucesso', 'Deltas ADDED/MODIFIED/REMOVED + Scenario WHEN/THEN', 'PRD (FR/NFR + jornadas) + arquitetura + stories com critérios de aceite'],
  ['Fonte da verdade', 'spec.md de cada feature', 'openspec/specs/ (atualizada no archive)', '_bmad-output/planning-artifacts/'],
  ['Integração com o agente', 'Skills ou commands speckit (ex.: .claude/skills/, .github/skills/, .gemini/commands/)', 'Skills openspec-* + commands opsx (ex.: .claude/, .github/, .cursor/)', 'Skills bmad-* e personas bmad-agent-* (ex.: .claude/skills/, .agents/skills/)'],
  ['Comando no chat', '/speckit-specify, /speckit.specify ou $speckit-specify (varia por agente)', '/opsx:propose, /opsx-propose ou $openspec-propose (varia por agente)', '/bmad-prd ou $bmad-prd (varia por agente)'],
  ['CLI', 'specify (Python, via uv)', 'openspec (Node.js, via npm)', 'bmad-method (Node.js, via npx)'],
]

export function CompareModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-full w-full max-w-6xl overflow-y-auto rounded-xl bg-slate-50 px-8 py-7 shadow-2xl dark:bg-slate-950 dark:ring-1 dark:ring-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Spec Kit × OpenSpec × BMad</h1>
          <button onClick={onClose} className="ml-auto rounded p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          As três aplicam SDD — a especificação vem antes do código e guia o agente — mas organizam o trabalho de formas
          diferentes.
        </p>
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-slate-50 text-xs dark:bg-slate-800/60 tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold"></th>
                <th className="px-5 py-3 font-semibold text-indigo-700 dark:text-indigo-300">Spec Kit</th>
                <th className="px-5 py-3 font-semibold text-indigo-700 dark:text-indigo-300">OpenSpec</th>
              <th className="px-5 py-3 font-semibold text-indigo-700 dark:text-indigo-300">BMad Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ROWS.map(([label, a, b, c]) => (
                <tr key={label}>
                  <td className="px-5 py-3 font-medium whitespace-nowrap text-slate-700 dark:text-slate-200">{label}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{a}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{b}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
