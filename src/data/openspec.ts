import type { Agent, FileEntry, Tool } from '../types'

const CHANGE = 'add-todo-tags'
const CDIR = `openspec/changes/${CHANGE}`
const CAP = 'task-tags'
const TODAY = new Date().toISOString().slice(0, 10)
const ARCHIVED = `openspec/changes/archive/${TODAY}-${CHANGE}`

/** Arquivos que o init instala para um workflow OPSX no agente escolhido. */
const workflow = (a: Agent, cmd: string, skillName: string, description: string, expandedOnly = false): FileEntry[] =>
  a.openspec.files(cmd, skillName).map((path) => ({
    path,
    kind: 'agent',
    expandedOnly,
    preview: path.endsWith('SKILL.md')
      ? `---
name: ${skillName}
description: ${description}
---

# Skill instalada pelo "openspec init".
# O agente pode acioná-la sozinho quando o pedido combina com a descrição.
# No ${a.name}, invoque com: ${a.openspec.cmd(cmd, skillName)}`
      : `---
description: "${description}"
---

${description}
...

# No ${a.name}, invoque com: ${a.openspec.cmd(cmd, skillName)}`,
  }))

const SKILL_OF: Record<string, string> = {
  explore: 'openspec-explore',
  propose: 'openspec-propose',
  new: 'openspec-new-change',
  continue: 'openspec-continue-change',
  ff: 'openspec-ff-change',
  update: 'openspec-update-change',
  apply: 'openspec-apply-change',
  verify: 'openspec-verify-change',
  sync: 'openspec-sync-specs',
  archive: 'openspec-archive-change',
}

const PROPOSAL: FileEntry = {
  path: `${CDIR}/proposal.md`,
  kind: 'spec',
  preview: `# Proposal: add-todo-tags

## Why
Usuários não conseguem organizar tarefas por contexto (trabalho, estudos, casa).

## What Changes
- Tarefas passam a aceitar uma ou mais tags
- Novo filtro por tags na lista
- Contador de pendentes por tag

## Capabilities
- **New**: task-tags

## Impact
- src/components/TodoList.tsx, storage em localStorage`,
}

const DESIGN: FileEntry = {
  path: `${CDIR}/design.md`,
  kind: 'spec',
  preview: `# Design: add-todo-tags

## Decisions
- Tags armazenadas como string[] dentro de cada tarefa
- Filtro combina tags com lógica E (todas selecionadas)
- Nomes normalizados para minúsculas

## Risks / Trade-offs
- Tarefas antigas sem "tags" → tratar como []`,
}

const TASKS: FileEntry = {
  path: `${CDIR}/tasks.md`,
  kind: 'spec',
  preview: `## 1. Modelo de dados
- [ ] 1.1 Adicionar campo tags ao tipo Task
- [ ] 1.2 Migrar tarefas salvas sem tags

## 2. Interface
- [ ] 2.1 Criar componente TagPicker
- [ ] 2.2 Criar componente TagFilter
- [ ] 2.3 Exibir contador de pendentes por tag

## 3. Testes
- [ ] 3.1 Testes de filtro por tags`,
}

const DELTA: FileEntry = {
  path: `${CDIR}/specs/${CAP}/spec.md`,
  kind: 'spec',
  preview: `## ADDED Requirements

### Requirement: Tarefa com tags
O sistema SHALL permitir associar uma ou mais tags a uma tarefa.

#### Scenario: Adicionar tag
- **WHEN** o usuário adiciona a tag "estudos" à tarefa "Ler sobre SDD"
- **THEN** a tarefa exibe a tag "estudos"

### Requirement: Filtro por tags
O sistema SHALL filtrar a lista pelas tags selecionadas.

#### Scenario: Filtrar por uma tag
- **WHEN** o usuário seleciona a tag "trabalho"
- **THEN** apenas tarefas com "trabalho" são exibidas`,
}

const MAIN_SPEC: FileEntry = {
  path: `openspec/specs/${CAP}/spec.md`,
  kind: 'spec',
  preview: `# task-tags Specification

## Purpose
Permitir organizar tarefas por tags.

## Requirements

### Requirement: Tarefa com tags
O sistema SHALL permitir associar uma ou mais tags a uma tarefa.

#### Scenario: Adicionar tag
- **WHEN** o usuário adiciona a tag "estudos" à tarefa "Ler sobre SDD"
- **THEN** a tarefa exibe a tag "estudos"
...`,
}

const archived = (e: FileEntry): FileEntry => ({ ...e, path: e.path.replace(CDIR, ARCHIVED) })

export const openspec: Tool = {
  id: 'openspec',
  name: 'OpenSpec',
  docsUrl: 'https://openspec.dev/docs',
  rootName: 'todo-app',
  collapsed: ['src', 'openspec/changes/archive'],
  hasExpandedProfile: true,
  steps: (a) => {
    const C = (c: string) => a.openspec.cmd(c, SKILL_OF[c])
    const F = (c: string) => a.openspec.files(c, SKILL_OF[c])
    return [
      {
        id: 'setup',
        command: 'openspec init',
        phase: 'setup',
        title: 'Instalar e inicializar',
        kind: 'terminal',
        summary:
          `Instala a CLI e inicializa o OpenSpec dentro de um projeto (pode ser um app que já existe — brownfield). Cria a pasta openspec/ e instala os workflows OPSX para o ${a.name} em ${a.openspec.files('*', '*')[0].split('/')[0]}/.`,
        inputs: ['Node.js 22.12+', 'Projeto existente (ex.: app to-do básico)'],
        outputs: ['openspec/config.yaml', 'openspec/specs/', 'openspec/changes/', ...a.openspec.files('*', 'openspec-*')],
        defaultPrompt: `# 1. Instalar a CLI do OpenSpec (requer Node.js 22.12+)
npm install -g @fission-ai/openspec@latest

# 2. Entrar no projeto (pode ser um app que já existe)
cd todo-app

# 3. Inicializar o OpenSpec para o seu agente
openspec init --tools ${a.openspec.key}

# (opcional) habilitar o perfil expandido de workflows
# openspec config profile && openspec update

# 4. Reinicie o agente se ele já estava aberto
${a.launch}`,
        creates: [
          { path: 'package.json', kind: 'code' },
          { path: 'src/App.tsx', kind: 'code' },
          { path: 'src/components/TodoList.tsx', kind: 'code' },
          ...workflow(a, 'explore', 'openspec-explore', 'Enter explore mode - think through ideas before proposing a change'),
          ...workflow(a, 'propose', 'openspec-propose', 'Propose a new change - create it and generate all artifacts in one step'),
          ...workflow(a, 'apply', 'openspec-apply-change', 'Implement tasks from an OpenSpec change'),
          ...workflow(a, 'update', 'openspec-update-change', 'Revise the planning artifacts of an existing change'),
          ...workflow(a, 'sync', 'openspec-sync-specs', 'Sync delta specs from a change into the main specs'),
          ...workflow(a, 'archive', 'openspec-archive-change', 'Archive a completed change'),
          ...workflow(a, 'new', 'openspec-new-change', 'Start a new change as an empty scaffold', true),
          ...workflow(a, 'continue', 'openspec-continue-change', 'Create the next artifact of a change', true),
          ...workflow(a, 'ff', 'openspec-ff-change', 'Fast-forward: create all artifacts needed for implementation', true),
          ...workflow(a, 'verify', 'openspec-verify-change', 'Verify the implementation matches the change artifacts', true),
          ...workflow(a, 'bulk-archive', 'openspec-bulk-archive-change', 'Archive several completed changes at once', true),
          ...workflow(a, 'onboard', 'openspec-onboard', 'Learn the workflow by doing one real change end to end', true),
          {
            path: 'openspec/config.yaml',
            kind: 'config',
            preview: `schema: spec-driven

# Project context (optional)
# Add only constraints that should guide OpenSpec artifacts and workflows.
# Example:
#   context: |
#     Write all artifacts in Brazilian Portuguese

# Per-artifact rules (optional)
#   rules:
#     proposal:
#       - Always state what is out of scope`,
          },
          { path: 'openspec/specs/', kind: 'spec' },
          { path: 'openspec/changes/archive/', kind: 'config' },
        ],
      },
      {
        id: 'explore',
        command: C('explore'),
        phase: 'explore',
        title: 'Explorar a ideia',
        kind: 'prompt',
        optional: true,
        summary:
          'Conversa livre para pensar a mudança antes de virar proposta: alternativas, riscos, perguntas. Não cria arquivos.',
        inputs: ['Sua ideia', 'Código existente', 'openspec/specs/'],
        outputs: ['Discussão no chat (nenhum arquivo)'],
        defaultPrompt: `${C('explore')} Quero adicionar tags às tarefas do meu app de to-do. Me ajude a pensar: tags livres ou pré-definidas? Como filtrar por várias tags ao mesmo tempo? Que impacto isso tem nas tarefas que já estão salvas no localStorage?`,
        uses: F('explore'),
      },
      {
        id: 'propose',
        command: C('propose'),
        phase: 'specify',
        title: 'Propor a mudança',
        kind: 'prompt',
        summary:
          'Cria a pasta da change e gera todos os artefatos de planejamento de uma vez: proposal (por quê/o quê), design (como), tasks (passos) e o delta de spec (ADDED/MODIFIED/REMOVED). Não escreve código.',
        inputs: ['Descrição da mudança', 'openspec/config.yaml', 'openspec/specs/'],
        outputs: ['proposal.md', 'design.md', 'tasks.md', `specs/${CAP}/spec.md (delta)`],
        defaultPrompt: `${C('propose')} ${CHANGE} Adicionar tags às tarefas: cada tarefa pode ter uma ou mais tags (ex.: "trabalho", "estudos", "casa"), o usuário pode filtrar a lista por uma ou mais tags e ver o contador de tarefas pendentes por tag. As tags ficam salvas junto com as tarefas no localStorage. Fora do escopo: cores customizadas e compartilhamento de listas.`,
        creates: [PROPOSAL, DESIGN, TASKS, DELTA],
        uses: F('propose'),
      },
      {
        id: 'new',
        command: C('new'),
        phase: 'specify',
        title: 'Nova change (vazia)',
        kind: 'prompt',
        expandedOnly: true,
        badge: 'Alternativa ao propose',
        summary: `Cria só o esqueleto da change, sem artefatos. Use com ${C('continue')} (um artefato por vez) ou ${C('ff')} (todos de uma vez).`,
        inputs: ['Nome da change'],
        outputs: [`${CDIR}/`],
        defaultPrompt: `${C('new')} ${CHANGE}`,
        creates: [{ path: `${CDIR}/`, kind: 'spec' }],
        uses: F('new'),
      },
      {
        id: 'continue',
        command: C('continue'),
        phase: 'specify',
        title: 'Próximo artefato',
        kind: 'prompt',
        expandedOnly: true,
        badge: 'Alternativa ao propose',
        summary: 'Gera o próximo artefato pendente da change, respeitando dependências (proposal → specs → design → tasks). Rode várias vezes.',
        inputs: ['Change existente'],
        outputs: ['Um artefato por execução'],
        defaultPrompt: `${C('continue')} ${CHANGE}`,
        creates: [PROPOSAL],
        uses: F('continue'),
      },
      {
        id: 'ff',
        command: C('ff'),
        phase: 'specify',
        title: 'Fast-forward',
        kind: 'prompt',
        expandedOnly: true,
        badge: 'Alternativa ao propose',
        summary: 'Gera de uma vez todos os artefatos que faltam para a change ficar pronta para implementar.',
        inputs: ['Change existente'],
        outputs: ['proposal.md', 'design.md', 'tasks.md', 'specs/ (delta)'],
        defaultPrompt: `${C('ff')} ${CHANGE}`,
        creates: [PROPOSAL, DESIGN, TASKS, DELTA],
        uses: F('ff'),
      },
      {
        id: 'update',
        command: C('update'),
        phase: 'specify',
        title: 'Revisar artefatos',
        kind: 'prompt',
        optional: true,
        summary: 'Ajusta os artefatos de uma change já criada (proposal, design, tasks, deltas) a partir do seu feedback.',
        inputs: ['Change existente', 'Seu feedback'],
        outputs: ['Artefatos atualizados'],
        defaultPrompt: `${C('update')} ${CHANGE} Inclua no design como migrar as tarefas antigas salvas sem o campo tags (tratar como lista vazia) e adicione uma task e um cenário de spec para isso.`,
        updates: [DESIGN.path, TASKS.path, DELTA.path],
        uses: F('update'),
      },
      {
        id: 'validate',
        command: 'openspec validate',
        phase: 'specify',
        title: 'Inspecionar pela CLI',
        kind: 'cli',
        optional: true,
        summary: 'Comandos de terminal para listar, visualizar e validar a estrutura da change antes de implementar.',
        inputs: ['openspec/changes/'],
        outputs: ['Saída no terminal'],
        defaultPrompt: `# Listar changes ativas
openspec list

# Ver a proposta e o diff dos requisitos
openspec show ${CHANGE}
openspec show ${CHANGE} --diff

# Validar a estrutura (warnings viram erros)
openspec validate ${CHANGE} --strict

# Painel geral de changes e specs
openspec view`,
      },
      {
        id: 'apply',
        command: C('apply'),
        phase: 'implement',
        title: 'Implementar',
        kind: 'prompt',
        summary: 'Implementa as tasks da change, marcando cada checkbox [x] em tasks.md conforme conclui.',
        inputs: ['tasks.md', 'design.md', 'delta specs'],
        outputs: ['Código alterado/novo', 'tasks.md com [x]'],
        defaultPrompt: `${C('apply')} ${CHANGE}`,
        creates: [
          { path: 'src/lib/tags.ts', kind: 'code' },
          { path: 'src/components/TagPicker.tsx', kind: 'code' },
          { path: 'src/components/TagFilter.tsx', kind: 'code' },
          { path: 'src/lib/tags.test.ts', kind: 'code' },
        ],
        updates: [TASKS.path, 'src/App.tsx', 'src/components/TodoList.tsx'],
        uses: F('apply'),
      },
      {
        id: 'verify',
        command: C('verify'),
        phase: 'implement',
        title: 'Verificar implementação',
        kind: 'prompt',
        expandedOnly: true,
        summary: 'Confere se o código implementado corresponde aos artefatos da change (requisitos, cenários e tasks).',
        inputs: ['Código', 'Artefatos da change'],
        outputs: ['Relatório no chat'],
        defaultPrompt: `${C('verify')} ${CHANGE}`,
        uses: F('verify'),
      },
      {
        id: 'sync',
        command: C('sync'),
        phase: 'archive',
        title: 'Sincronizar specs',
        kind: 'prompt',
        optional: true,
        summary: 'Mescla os deltas da change em openspec/specs/ sem arquivar a change (útil quando outra change depende dessa spec).',
        inputs: ['Delta specs da change'],
        outputs: [`openspec/specs/${CAP}/spec.md`],
        defaultPrompt: `${C('sync')} ${CHANGE}`,
        creates: [MAIN_SPEC],
        uses: F('sync'),
      },
      {
        id: 'archive',
        command: C('archive'),
        phase: 'archive',
        title: 'Arquivar a change',
        kind: 'prompt',
        summary:
          'Fecha o ciclo: move a change para changes/archive/AAAA-MM-DD-nome e mescla os deltas na spec principal (openspec/specs/). A spec passa a refletir o sistema atual.',
        inputs: ['Change com tasks concluídas'],
        outputs: [`openspec/specs/${CAP}/spec.md`, `changes/archive/${TODAY}-${CHANGE}/`],
        defaultPrompt: `${C('archive')} ${CHANGE}`,
        removes: [CDIR],
        creates: [
          archived(PROPOSAL),
          archived(DESIGN),
          archived(TASKS),
          archived(DELTA),
          MAIN_SPEC,
        ],
        uses: F('archive'),
      },
    ]
  },
}
