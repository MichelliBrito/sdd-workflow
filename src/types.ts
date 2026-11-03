/** Categoria do arquivo — define a cor na árvore e na legenda. */
export type FileKind = 'agent' | 'spec' | 'config' | 'code'

export interface FileEntry {
  /** Caminho relativo à raiz do projeto. Termina com "/" para pastas vazias. */
  path: string
  kind: FileKind
  /** Conteúdo de exemplo exibido no preview. */
  preview?: string
  /** Só existe no perfil expandido (OpenSpec). */
  expandedOnly?: boolean
}

export type StepKind = 'terminal' | 'prompt' | 'cli'

export type PhaseId =
  | 'setup'
  | 'principles'
  | 'explore'
  | 'analysis'
  | 'specify'
  | 'plan'
  | 'solutioning'
  | 'tasks'
  | 'implement'
  | 'verify'
  | 'archive'

export interface Step {
  id: string
  /** Comando como o aluno digita no agente escolhido (ex.: "/speckit-plan"). */
  command: string
  title: string
  kind: StepKind
  phase: PhaseId
  optional?: boolean
  /** Só aparece com o perfil expandido ligado (OpenSpec). */
  expandedOnly?: boolean
  /** Ex.: "Alternativa ao propose". */
  badge?: string
  summary: string
  inputs: string[]
  outputs: string[]
  defaultPrompt: string
  creates?: FileEntry[]
  /** Arquivos existentes que o passo altera. */
  updates?: string[]
  /** Prefixos de caminho removidos (ex.: change arquivada). */
  removes?: string[]
  /** Skills/commands do agente usados no passo. */
  uses?: string[]
}

export type AgentId = 'claude' | 'copilot' | 'cursor' | 'gemini' | 'codex' | 'junie'

export interface Agent {
  id: AgentId
  name: string
  /** Linhas finais do passo de setup: como abrir o agente. */
  launch: string
  speckit: {
    key: string
    cmd: (c: string) => string
    file: (c: string) => string
  }
  bmad: {
    key: string
    /** Invocação de uma skill bmad-* no chat. */
    cmd: (skill: string) => string
    /** Pasta onde o instalador grava as skills. */
    dir: string
    /** Arquivos extras por skill de persona (ex.: .github/agents no Copilot). */
    agentFile?: (skill: string) => string
  }
  openspec: {
    key: string
    cmd: (c: string, skill: string) => string
    /** Arquivos instalados para um workflow (command e/ou skill). */
    files: (c: string, skill: string) => string[]
  }
}

export interface Tool {
  id: 'speckit' | 'openspec' | 'bmad'
  name: string
  docsUrl: string
  rootName: string
  /** Pastas que começam recolhidas na árvore. */
  collapsed: string[]
  hasExpandedProfile: boolean
  steps: (agent: Agent) => Step[]
}
