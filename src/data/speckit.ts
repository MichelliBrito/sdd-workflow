import type { Agent, FileEntry, Tool } from '../types'

const FEATURE = 'specs/001-todo-tags'

const skill = (a: Agent, cmd: string, description: string): FileEntry => {
  const path = a.speckit.file(cmd)
  const usage = `# No ${a.name}, invoque com: ${a.speckit.cmd(cmd)} <seu texto>`
  const preview = path.endsWith('.toml')
    ? `description = "${description}"

prompt = """
## User Input

\`\`\`text
{{args}}
\`\`\`
...
"""

${usage}`
    : `---
name: "speckit-${cmd}"
description: "${description}"
metadata:
  author: "github-spec-kit"
---

## User Input

\`\`\`text
$ARGUMENTS
\`\`\`

You **MUST** consider the user input before proceeding (if not empty).
...

${usage}
# Tudo que vem depois do comando entra em $ARGUMENTS.`
  return { path, kind: 'agent', preview }
}

const SKILLS: [string, string][] = [
  ['constitution', 'Create or update the project constitution.'],
  ['specify', 'Create or update the feature specification from a natural language feature description.'],
  ['clarify', 'Identify underspecified areas in the current feature spec by asking up to 5 targeted clarification questions.'],
  ['plan', 'Execute the implementation planning workflow using the plan template to generate design artifacts.'],
  ['checklist', 'Generate a custom checklist for the current feature based on user requirements.'],
  ['tasks', 'Generate an actionable, dependency-ordered tasks.md for the feature.'],
  ['analyze', 'Perform a non-destructive cross-artifact consistency and quality analysis.'],
  ['implement', 'Execute the implementation plan by processing and executing all tasks defined in tasks.md.'],
  ['converge', 'Assess the codebase against spec, plan and tasks and append remaining work as tasks.'],
  ['taskstoissues', 'Convert existing tasks into actionable, dependency-ordered GitHub issues.'],
]

const cfg = (path: string, preview?: string): FileEntry => ({ path, kind: 'config', preview })

export const speckit: Tool = {
  id: 'speckit',
  name: 'Spec Kit',
  docsUrl: 'https://github.github.io/spec-kit/',
  rootName: 'todo-tags',
  collapsed: ['.specify/scripts', '.specify/templates', '.specify/integrations', '.specify/workflows'],
  hasExpandedProfile: false,
  steps: (a) => [
    {
      id: 'setup',
      command: 'specify init',
      phase: 'setup',
      title: 'Instalar e inicializar',
      kind: 'terminal',
      summary:
        `Instala a CLI "specify" e cria o projeto já integrado ao ${a.name}. O init instala os comandos speckit na pasta do agente (${a.speckit.file('*').split('/').slice(0, 2).join('/')}/) e cria a pasta .specify com templates, scripts e a constituição (ainda vazia).`,
      inputs: ['Python 3.11+ e uv instalados', `${a.name} instalado`],
      outputs: [a.speckit.file('*'), '.specify/ (memory, templates, scripts)'],
      defaultPrompt: `# 1. Instalar a CLI do Spec Kit (requer Python 3.11+ e uv)
uv tool install specify-cli

# 2. Criar o projeto com a integração do seu agente
specify init todo-tags --integration ${a.speckit.key}

# 3. Entrar no projeto
cd todo-tags

${a.launch}`,
      creates: [
        ...SKILLS.map(([c, d]) => skill(a, c, d)),
        cfg(
          '.specify/memory/constitution.md',
          `# [PROJECT_NAME] Constitution

## Core Principles

### [PRINCIPLE_1_NAME]
[PRINCIPLE_1_DESCRIPTION]

### [PRINCIPLE_2_NAME]
[PRINCIPLE_2_DESCRIPTION]
...

<!-- Template vazio: será preenchido pelo comando constitution -->`,
        ),
        cfg('.specify/memory/.constitution-template.json'),
        cfg('.specify/templates/spec-template.md'),
        cfg('.specify/templates/plan-template.md'),
        cfg('.specify/templates/tasks-template.md'),
        cfg('.specify/templates/checklist-template.md'),
        cfg('.specify/templates/constitution-template.md'),
        cfg('.specify/scripts/bash/create-new-feature.sh'),
        cfg('.specify/scripts/bash/setup-plan.sh'),
        cfg('.specify/scripts/bash/setup-tasks.sh'),
        cfg('.specify/scripts/bash/check-prerequisites.sh'),
        cfg('.specify/scripts/bash/common.sh'),
        cfg('.specify/scripts/bash/resolve-template.sh'),
        cfg(`.specify/integrations/${a.speckit.key}.manifest.json`),
        cfg('.specify/integrations/speckit.manifest.json'),
        cfg('.specify/workflows/speckit/workflow.yml'),
        cfg('.specify/workflows/workflow-registry.json'),
        cfg('.specify/integration.json', `{\n  "integration": "${a.speckit.key}"\n}`),
        cfg('.specify/init-options.json'),
      ],
    },
    {
      id: 'constitution',
      command: a.speckit.cmd('constitution'),
      phase: 'principles',
      title: 'Constituição do projeto',
      kind: 'prompt',
      summary:
        'Define os princípios inegociáveis do projeto (qualidade, testes, UX, restrições). Todos os passos seguintes consultam a constituição. Roda uma vez por projeto.',
      inputs: ['.specify/memory/constitution.md (template)'],
      outputs: ['.specify/memory/constitution.md (preenchida)'],
      defaultPrompt: `${a.speckit.cmd('constitution')} Crie os princípios para um app de lista de tarefas (to-do) com tags:
- Simplicidade primeiro: sem dependências desnecessárias
- Código testável: toda regra de negócio coberta por testes automatizados
- Acessibilidade: navegação completa por teclado e contraste AA
- Os dados do usuário ficam no navegador (sem backend nesta versão)
- Interface em português do Brasil`,
      updates: ['.specify/memory/constitution.md'],
      uses: [a.speckit.file('constitution')],
    },
    {
      id: 'specify',
      command: a.speckit.cmd('specify'),
      phase: 'specify',
      title: 'Especificar a feature',
      kind: 'prompt',
      summary:
        'Descreve O QUE e POR QUE — sem falar de tecnologia. Gera a pasta da feature com spec.md (user stories, requisitos funcionais, critérios de sucesso) e um checklist de qualidade da spec.',
      inputs: ['Descrição em linguagem natural', 'constitution.md'],
      outputs: [`${FEATURE}/spec.md`, `${FEATURE}/checklists/requirements.md`, '.specify/feature.json'],
      defaultPrompt: `${a.speckit.cmd('specify')} Quero um app de lista de tarefas onde eu possa criar, editar, concluir e excluir tarefas. Cada tarefa tem um título, uma descrição opcional e uma ou mais tags (ex.: "trabalho", "estudos", "casa"). Quero filtrar a lista por uma ou mais tags e ver quantas tarefas pendentes existem em cada tag. Tarefas concluídas aparecem riscadas e podem ser ocultadas. As tarefas devem continuar lá quando eu fechar e reabrir o navegador.`,
      creates: [
        {
          path: `${FEATURE}/spec.md`,
          kind: 'spec',
          preview: `# Feature Specification: Lista de tarefas com tags

**Feature Branch**: \`001-todo-tags\`
**Status**: Draft

## User Scenarios & Testing

### User Story 1 - Criar e concluir tarefas (Priority: P1)
Como usuário, quero criar tarefas e marcá-las como concluídas...

**Acceptance Scenarios**:
1. **Given** a lista vazia, **When** crio "Estudar SDD", **Then** ela aparece como pendente.

### User Story 2 - Organizar por tags (Priority: P2)
...

## Requirements

### Functional Requirements
- **FR-001**: O sistema DEVE permitir criar tarefas com título obrigatório.
- **FR-002**: Cada tarefa DEVE aceitar uma ou mais tags.
- **FR-003**: O usuário DEVE poder filtrar por uma ou mais tags.
- **FR-004**: O sistema DEVE manter as tarefas após fechar o navegador.
- **FR-005**: [NEEDS CLARIFICATION: existe limite de tags por tarefa?]

### Key Entities
- **Tarefa**: título, descrição, status, tags
- **Tag**: nome

## Success Criteria
- **SC-001**: Usuário cria e etiqueta uma tarefa em menos de 10 segundos.`,
        },
        {
          path: `${FEATURE}/checklists/requirements.md`,
          kind: 'spec',
          preview: `# Specification Quality Checklist: Lista de tarefas com tags

## Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs

## Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable`,
        },
        cfg('.specify/feature.json', `{\n  "feature_directory": "${FEATURE}"\n}`),
      ],
      uses: [a.speckit.file('specify')],
    },
    {
      id: 'clarify',
      command: a.speckit.cmd('clarify'),
      phase: 'specify',
      title: 'Esclarecer ambiguidades',
      kind: 'prompt',
      optional: true,
      summary:
        `A IA faz até 5 perguntas sobre lacunas da spec (uma por vez, com opções) e grava as respostas de volta no spec.md numa seção "Clarifications". Rode antes do ${a.speckit.cmd('plan')}.`,
      inputs: [`${FEATURE}/spec.md`],
      outputs: [`${FEATURE}/spec.md (seção Clarifications)`],
      defaultPrompt: `${a.speckit.cmd('clarify')} Foque em: limite de tags por tarefa, se as tags têm cores, a ordenação padrão da lista e o que acontece com as tarefas quando uma tag em uso é excluída.`,
      updates: [`${FEATURE}/spec.md`, `${FEATURE}/checklists/requirements.md`],
      uses: [a.speckit.file('clarify')],
    },
    {
      id: 'plan',
      command: a.speckit.cmd('plan'),
      phase: 'plan',
      title: 'Plano técnico',
      kind: 'prompt',
      summary:
        'Agora sim entra a tecnologia. Gera o plano de implementação e os artefatos de design: pesquisa de decisões, modelo de dados, contratos e um guia de validação. Checa o plano contra a constituição.',
      inputs: ['spec.md', 'constitution.md', 'Sua escolha de stack'],
      outputs: ['plan.md', 'research.md', 'data-model.md', 'contracts/', 'quickstart.md'],
      defaultPrompt: `${a.speckit.cmd('plan')} Use React + TypeScript com Vite. Estilo com Tailwind CSS. Persistência em localStorage (sem backend). Testes com Vitest e Testing Library. Estado com hooks do React (sem Redux). Estrutura simples: src/components, src/hooks, src/lib.`,
      creates: [
        {
          path: `${FEATURE}/plan.md`,
          kind: 'spec',
          preview: `# Implementation Plan: Lista de tarefas com tags

**Branch**: \`001-todo-tags\` | **Spec**: [spec.md](./spec.md)

## Technical Context
**Language/Version**: TypeScript 5 / React 19
**Primary Dependencies**: Vite, Tailwind CSS
**Storage**: localStorage
**Testing**: Vitest + Testing Library

## Constitution Check
- [x] Simplicidade: sem libs de estado globais
- [x] Testável: regras em src/lib cobertas por testes

## Project Structure
src/
├── components/
├── hooks/
└── lib/`,
        },
        {
          path: `${FEATURE}/research.md`,
          kind: 'spec',
          preview: `# Research

## Decision: localStorage para persistência
**Rationale**: requisito FR-004 sem backend.
**Alternatives considered**: IndexedDB (complexo demais para o escopo).`,
        },
        {
          path: `${FEATURE}/data-model.md`,
          kind: 'spec',
          preview: `# Data Model

## Task
| Campo       | Tipo      | Regra                 |
|-------------|-----------|-----------------------|
| id          | string    | uuid                  |
| title       | string    | obrigatório, 1..120   |
| description | string?   |                       |
| done        | boolean   | default false         |
| tags        | string[]  | 0..5, minúsculas      |`,
        },
        {
          path: `${FEATURE}/contracts/ui-contract.md`,
          kind: 'spec',
          preview: `# UI Contract

- <TaskForm onSubmit(task)>
- <TagFilter selected: string[] onChange(tags)>
- useTasks(): { tasks, add, toggle, remove, filterByTags }`,
        },
        {
          path: `${FEATURE}/quickstart.md`,
          kind: 'spec',
          preview: `# Quickstart (validação manual)

1. npm install && npm run dev
2. Crie "Estudar SDD" com a tag "estudos"
3. Filtre por "estudos" → só ela aparece
4. Recarregue a página → a tarefa continua lá`,
        },
      ],
      uses: [a.speckit.file('plan')],
    },
    {
      id: 'checklist',
      command: a.speckit.cmd('checklist'),
      phase: 'plan',
      title: 'Checklist de requisitos',
      kind: 'prompt',
      optional: true,
      summary:
        'Gera checklists que funcionam como "testes unitários para os requisitos": verificam se a spec está completa, clara e consistente num domínio (UX, segurança, acessibilidade...).',
      inputs: ['spec.md', 'plan.md'],
      outputs: [`${FEATURE}/checklists/<dominio>.md`],
      defaultPrompt: `${a.speckit.cmd('checklist')} Gere um checklist de UX e acessibilidade para os requisitos de filtro por tags e de edição de tarefas.`,
      creates: [
        {
          path: `${FEATURE}/checklists/ux.md`,
          kind: 'spec',
          preview: `# UX & Accessibility Checklist

- [ ] CHK001 O comportamento do filtro com várias tags (E/OU) está definido? [Clarity, Spec §FR-003]
- [ ] CHK002 Há requisito de foco por teclado no seletor de tags? [Coverage]
- [ ] CHK003 O estado vazio do filtro está especificado? [Edge Case]`,
        },
      ],
      uses: [a.speckit.file('checklist')],
    },
    {
      id: 'tasks',
      command: a.speckit.cmd('tasks'),
      phase: 'tasks',
      title: 'Quebrar em tarefas',
      kind: 'prompt',
      summary:
        'Transforma o plano em tasks.md: tarefas numeradas, ordenadas por dependência e agrupadas por user story. [P] marca o que pode rodar em paralelo.',
      inputs: ['plan.md', 'spec.md', 'data-model.md', 'contracts/'],
      outputs: [`${FEATURE}/tasks.md`],
      defaultPrompt: `${a.speckit.cmd('tasks')} Organize por user story, marque com [P] o que puder rodar em paralelo e coloque os testes antes da implementação (TDD).`,
      creates: [
        {
          path: `${FEATURE}/tasks.md`,
          kind: 'spec',
          preview: `# Tasks: Lista de tarefas com tags

## Phase 1: Setup
- [ ] T001 Criar projeto Vite React-TS
- [ ] T002 [P] Configurar Tailwind e Vitest

## Phase 2: Foundational
- [ ] T003 Definir tipo Task em src/lib/types.ts
- [ ] T004 [P] Teste do storage em tests/storage.test.ts
- [ ] T005 Implementar src/lib/storage.ts

## Phase 3: User Story 1 - Criar e concluir (P1)
- [ ] T006 [US1] Teste de useTasks
- [ ] T007 [US1] Implementar src/hooks/useTasks.ts
...`,
        },
      ],
      uses: [a.speckit.file('tasks')],
    },
    {
      id: 'analyze',
      command: a.speckit.cmd('analyze'),
      phase: 'tasks',
      title: 'Análise de consistência',
      kind: 'prompt',
      optional: true,
      summary:
        'Análise somente leitura que cruza spec.md, plan.md e tasks.md procurando requisitos sem task, contradições e violações da constituição. Não altera arquivos.',
      inputs: ['spec.md', 'plan.md', 'tasks.md', 'constitution.md'],
      outputs: ['Relatório no chat (nenhum arquivo)'],
      defaultPrompt: `${a.speckit.cmd('analyze')} Verifique se todo requisito da spec tem pelo menos uma task e se o plano respeita a constituição.`,
      uses: [a.speckit.file('analyze')],
    },
    {
      id: 'implement',
      command: a.speckit.cmd('implement'),
      phase: 'implement',
      title: 'Implementar',
      kind: 'prompt',
      summary:
        'Executa as tarefas do tasks.md em ordem, marcando [X] conforme conclui. Respeita dependências, roda testes e checa os checklists antes de começar.',
      inputs: ['tasks.md', 'plan.md', 'checklists/'],
      outputs: ['Código-fonte e testes', 'tasks.md com [X]'],
      defaultPrompt: `${a.speckit.cmd('implement')} Implemente a Phase 1 (Setup) e a Phase 2 (Foundational) primeiro e pare para eu revisar antes de seguir para as user stories.`,
      creates: [
        { path: 'package.json', kind: 'code' },
        { path: 'src/lib/types.ts', kind: 'code' },
        { path: 'src/lib/storage.ts', kind: 'code' },
        { path: 'src/hooks/useTasks.ts', kind: 'code' },
        { path: 'src/components/TaskForm.tsx', kind: 'code' },
        { path: 'src/components/TagFilter.tsx', kind: 'code' },
        { path: 'src/App.tsx', kind: 'code' },
        { path: 'tests/storage.test.ts', kind: 'code' },
        { path: 'tests/useTasks.test.ts', kind: 'code' },
      ],
      updates: [`${FEATURE}/tasks.md`],
      uses: [a.speckit.file('implement')],
    },
    {
      id: 'converge',
      command: a.speckit.cmd('converge'),
      phase: 'verify',
      title: 'Convergir código × spec',
      kind: 'prompt',
      summary:
        'Compara o código com spec, plan e tasks. Quando encontra lacunas, acrescenta novas tasks ao tasks.md (nunca apaga). Repita implement → converge até o relatório dizer "Converged".',
      inputs: ['Código-fonte', 'spec.md', 'plan.md', 'tasks.md'],
      outputs: ['tasks.md com novas tasks (se houver gaps)', 'Relatório "Converged" ou pendências'],
      defaultPrompt: `${a.speckit.cmd('converge')}`,
      updates: [`${FEATURE}/tasks.md`],
      uses: [a.speckit.file('converge')],
    },
  ],
}
