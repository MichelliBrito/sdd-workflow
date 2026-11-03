import type { Agent, FileEntry, Tool } from '../types'

const PLAN = '_bmad-output/planning-artifacts'
const IMPL = '_bmad-output/implementation-artifacts'

/** Skills instaladas pelo módulo core + BMad Method (bmm) na v6.12. */
const CORE = ['bmad-help', 'bmad-brainstorming', 'bmad-advanced-elicitation', 'bmad-party-mode', 'bmad-review', 'bmad-customize', 'bmad-deep-recon', 'bmad-forge-idea']
const PERSONAS: [string, string][] = [
  ['bmad-agent-analyst', 'Mary · Business Analyst'],
  ['bmad-agent-pm', 'John · Product Manager'],
  ['bmad-agent-ux-designer', 'Sally · UX Designer'],
  ['bmad-agent-architect', 'Winston · System Architect'],
  ['bmad-agent-dev', 'Amelia · Senior Software Engineer'],
]
const PLAN_SKILLS = ['bmad-product-brief', 'bmad-prfaq', 'bmad-prd', 'bmad-ux', 'bmad-architecture', 'bmad-create-epics-and-stories', 'bmad-sprint-planning', 'bmad-project-context', 'bmad-spec']
const SHIP_SKILLS = ['bmad-build', 'bmad-build-auto', 'bmad-code-review', 'bmad-correct-course', 'bmad-qa-generate-e2e-tests', 'bmad-retrospective', 'bmad-walkthrough']

const cfg = (path: string, preview?: string): FileEntry => ({ path, kind: 'config', preview })

const skillFile = (a: Agent, skill: string, persona?: string): FileEntry => ({
  path: `${a.bmad.dir}/${skill}/SKILL.md`,
  kind: 'agent',
  preview: `---
name: ${skill}
description: ${persona ? `Persona ${persona}` : 'Skill do BMad Method'}
---

# Instalada por "npx bmad-method install".
# A skill lê _bmad/config.toml e as customizações em _bmad/custom/.
${persona ? `# Ao ser chamada, o agente "veste" a persona ${persona} e mostra um menu de opções.\n` : ''}
# No ${a.name}, invoque com: ${a.bmad.cmd(skill)}`,
})

export const bmad: Tool = {
  id: 'bmad',
  name: 'BMad Method',
  docsUrl: 'https://docs.bmad-method.org/',
  rootName: 'todo-tags',
  collapsed: ['.claude/skills', '.agents/skills', '.junie/skills', '.github/agents', '_bmad/_config', '_bmad/scripts', '_bmad/core', '_bmad/custom'],
  hasExpandedProfile: false,
  steps: (a) => {
    const C = a.bmad.cmd
    const S = (skill: string) => [`${a.bmad.dir}/${skill}/SKILL.md`]
    const P = (skill: string) => [...S(skill), ...(a.bmad.agentFile ? [a.bmad.agentFile(skill)] : [])]
    return [
      {
        id: 'setup',
        command: 'bmad-method install',
        phase: 'setup',
        title: 'Instalar o BMad',
        kind: 'terminal',
        summary: `O instalador copia as skills do BMad (core + módulo BMad Method) para ${a.bmad.dir}/ e cria a pasta _bmad/ com configuração e scripts. Os documentos que os agentes gerarem vão para _bmad-output/.`,
        inputs: ['Node.js 20.12+', 'uv (usado pelo bmad-build)', `${a.name} instalado`],
        outputs: [`${a.bmad.dir}/bmad-*/SKILL.md`, '_bmad/ (config + scripts)'],
        defaultPrompt: `# 1. Criar a pasta do projeto
mkdir todo-tags && cd todo-tags

# 2. Instalar o BMad Method para o seu agente (modo sem perguntas)
npx bmad-method install --yes --modules bmm --tools ${a.bmad.key}

# (ou rode só "npx bmad-method install" e responda às perguntas)

${a.launch}`,
        creates: [
          ...CORE.map((s) => skillFile(a, s)),
          ...PERSONAS.flatMap(([s, p]) => [
            skillFile(a, s, p),
            ...(a.bmad.agentFile ? [{ path: a.bmad.agentFile(s), kind: 'agent' as const, preview: `LOAD the FULL {project-root}/${a.bmad.dir}/${s}/SKILL.md, READ its entire contents and follow its directions exactly!` }] : []),
          ]),
          ...[...PLAN_SKILLS, ...SHIP_SKILLS].map((s) => skillFile(a, s)),
          cfg(
            '_bmad/config.toml',
            `[core]
project_name = "todo-tags"
user_name = "Professor"
communication_language = "Portuguese"
document_output_language = "Portuguese"
output_folder = "_bmad-output"

[modules.bmm]
planning_artifacts = "_bmad-output/planning-artifacts"
implementation_artifacts = "_bmad-output/implementation-artifacts"
project_knowledge = "docs"`,
          ),
          cfg('_bmad/config.user.toml'),
          cfg('_bmad/bmm/config.yaml'),
          cfg('_bmad/_config/manifest.yaml'),
          cfg('_bmad/_config/files-manifest.csv'),
          cfg('_bmad/_config/bmad-help.csv'),
          cfg('_bmad/core/'),
          cfg('_bmad/scripts/render_skill.py'),
          cfg('_bmad/scripts/resolve_config.py'),
          cfg('_bmad/scripts/resolve_customization.py'),
          cfg('_bmad/scripts/memlog.py'),
          cfg('_bmad/custom/'),
        ],
      },
      {
        id: 'help',
        command: C('bmad-help'),
        phase: 'setup',
        title: 'Pedir orientação',
        kind: 'prompt',
        optional: true,
        summary: 'O "GPS" do BMad: lê o que já existe no projeto e diz qual o próximo passo e qual agente chamar. Use sempre que o aluno se perder.',
        inputs: ['_bmad/_config/bmad-help.csv', 'Artefatos já gerados'],
        outputs: ['Recomendação no chat (nenhum arquivo)'],
        defaultPrompt: `${C('bmad-help')} Quero criar um app de lista de tarefas com tags. Por onde começo?`,
        uses: S('bmad-help'),
      },
      {
        id: 'brainstorming',
        command: C('bmad-brainstorming'),
        phase: 'analysis',
        title: 'Brainstorming',
        kind: 'prompt',
        optional: true,
        badge: 'Mary · Analyst',
        summary: 'Sessão guiada de ideação com técnicas criativas. A IA facilita; as ideias são suas.',
        inputs: ['Sua ideia inicial'],
        outputs: ['_bmad-output/brainstorming/'],
        defaultPrompt: `${C('bmad-brainstorming')} Vamos explorar ideias para um app de to-do com tags: como organizar as tarefas, filtros úteis e o que deixaria o app diferente dos que já existem.`,
        creates: [{ path: '_bmad-output/brainstorming/', kind: 'spec' }],
        uses: S('bmad-brainstorming'),
      },
      {
        id: 'brief',
        command: C('bmad-product-brief'),
        phase: 'analysis',
        title: 'Product brief',
        kind: 'prompt',
        optional: true,
        badge: 'Mary · Analyst',
        summary: 'Resume a visão do produto: problema, público, proposta de valor e escopo. Serve de entrada para o PRD.',
        inputs: ['Brainstorming (se houver)', 'Sua visão do produto'],
        outputs: [`${PLAN}/brief.md`],
        defaultPrompt: `${C('bmad-product-brief')} Produto: app de lista de tarefas com tags para estudantes e profissionais organizarem o dia. Problema: listas comuns misturam contextos (trabalho, estudos, casa). Proposta: tags e filtros rápidos. Escopo inicial: uso pessoal, sem login, dados no navegador.`,
        creates: [
          {
            path: `${PLAN}/brief.md`,
            kind: 'spec',
            preview: `---
title: Todo Tags
status: draft
---

# Product Brief: Todo Tags

## Problema
Listas de tarefas misturam contextos e o usuário perde o foco.

## Público
Estudantes e profissionais que alternam entre trabalho, estudos e casa.

## Proposta de valor
Tags e filtros rápidos para ver só o que importa agora.

## Fora do escopo (MVP)
Login, sincronização, colaboração.`,
          },
          { path: `${PLAN}/addendum.md`, kind: 'spec' },
        ],
        uses: S('bmad-product-brief'),
      },
      {
        id: 'prd',
        command: C('bmad-prd'),
        phase: 'plan',
        title: 'PRD',
        kind: 'prompt',
        badge: 'John · Product Manager',
        summary: 'O Product Requirements Document: requisitos funcionais e não funcionais, jornadas do usuário e critérios de sucesso. É a principal "spec" do BMad.',
        inputs: ['brief.md (se houver)', 'Sua descrição'],
        outputs: [`${PLAN}/prd.md`],
        defaultPrompt: `${C('bmad-prd')} Crie o PRD do app de lista de tarefas com tags: criar, editar, concluir e excluir tarefas; cada tarefa tem título, descrição opcional e uma ou mais tags; filtro por uma ou mais tags; contador de pendentes por tag; tarefas concluídas podem ser ocultadas; os dados ficam salvos no navegador.`,
        creates: [
          {
            path: `${PLAN}/prd.md`,
            kind: 'spec',
            preview: `---
status: draft
---

# PRD: Todo Tags

## Goals
- Organizar tarefas por contexto com tags

## User Journeys
- Ana cria "Estudar SDD" com a tag "estudos" e filtra só os estudos

## Functional Requirements
- FR1: Criar, editar, concluir e excluir tarefas
- FR2: Associar uma ou mais tags a cada tarefa
- FR3: Filtrar a lista por uma ou mais tags
- FR4: Mostrar contador de pendentes por tag

## Non-Functional Requirements
- NFR1: Persistência local, sem backend
- NFR2: Acessível por teclado`,
          },
        ],
        updates: [`${PLAN}/addendum.md`],
        uses: P('bmad-agent-pm').concat(S('bmad-prd')),
      },
      {
        id: 'ux',
        command: C('bmad-ux'),
        phase: 'plan',
        title: 'Design de UX',
        kind: 'prompt',
        optional: true,
        badge: 'Sally · UX Designer',
        summary: 'Define a experiência: fluxos, telas, componentes e padrões de interação, a partir do PRD.',
        inputs: ['prd.md'],
        outputs: [`${PLAN}/ (design de UX)`],
        defaultPrompt: `${C('bmad-ux')} Desenhe a experiência do app: tela única com lista, campo de nova tarefa, seletor de tags e barra de filtros. Priorize uso rápido por teclado e boa leitura em celular.`,
        creates: [{ path: `${PLAN}/ux-design/`, kind: 'spec' }],
        uses: P('bmad-agent-ux-designer').concat(S('bmad-ux')),
      },
      {
        id: 'architecture',
        command: C('bmad-architecture'),
        phase: 'solutioning',
        title: 'Arquitetura',
        kind: 'prompt',
        badge: 'Winston · Architect',
        summary: 'Decisões técnicas: stack, estrutura de pastas, modelo de dados e padrões. Entra aqui a tecnologia — o PRD fica livre dela.',
        inputs: ['prd.md', 'Design de UX (se houver)'],
        outputs: [`${PLAN}/ARCHITECTURE-SPINE.md`],
        defaultPrompt: `${C('bmad-architecture')} Stack: React + TypeScript com Vite, Tailwind CSS, persistência em localStorage (sem backend), testes com Vitest e Testing Library, estado com hooks do React. Estrutura simples: src/components, src/hooks, src/lib.`,
        creates: [
          {
            path: `${PLAN}/ARCHITECTURE-SPINE.md`,
            kind: 'spec',
            preview: `# Architecture Spine: Todo Tags

## Stack
React 19 + TypeScript · Vite · Tailwind · Vitest

## Decisions
- ADR-1: localStorage como persistência (NFR1)
- ADR-2: Estado via hooks, sem lib global

## Data Model
Task { id, title, description?, done, tags: string[] }

## Source Tree
src/components · src/hooks · src/lib · tests/`,
          },
        ],
        uses: P('bmad-agent-architect').concat(S('bmad-architecture')),
      },
      {
        id: 'epics',
        command: C('bmad-create-epics-and-stories'),
        phase: 'solutioning',
        title: 'Épicos e stories',
        kind: 'prompt',
        badge: 'John · Product Manager',
        summary: 'Quebra o PRD e a arquitetura em épicos e user stories com critérios de aceite, prontos para implementar um por vez.',
        inputs: ['prd.md', 'ARCHITECTURE-SPINE.md'],
        outputs: [`${PLAN}/epics.md`],
        defaultPrompt: `${C('bmad-create-epics-and-stories')} Organize em épicos pequenos e entregáveis: primeiro o CRUD de tarefas com persistência, depois tags e filtros. Cada story com critérios de aceite em Given/When/Then.`,
        creates: [
          {
            path: `${PLAN}/epics.md`,
            kind: 'spec',
            preview: `# Epics: Todo Tags

## Epic 1: Tarefas básicas
### Story 1.1: Criar tarefa
**Acceptance Criteria**
- Given a lista vazia, When crio "Estudar SDD", Then ela aparece como pendente

### Story 1.2: Persistir no navegador
...

## Epic 2: Tags e filtros
### Story 2.1: Adicionar tags a uma tarefa
### Story 2.2: Filtrar por tags`,
          },
        ],
        uses: S('bmad-create-epics-and-stories'),
      },
      {
        id: 'context',
        command: C('bmad-project-context'),
        phase: 'solutioning',
        title: 'Contexto do projeto',
        kind: 'prompt',
        optional: true,
        summary: 'Grava as regras e convenções do projeto num bloco gerenciado do AGENTS.md, que qualquer agente lê antes de codar.',
        inputs: ['ARCHITECTURE-SPINE.md', 'Código existente'],
        outputs: ['AGENTS.md (bloco gerenciado)'],
        defaultPrompt: `${C('bmad-project-context')} Registre as convenções: TypeScript estrito, componentes funcionais, testes ao lado da regra de negócio em src/lib e textos da interface em português.`,
        creates: [{ path: 'AGENTS.md', kind: 'config', preview: '<!-- BMAD:PROJECT-CONTEXT START -->\n## Convenções\n- TypeScript estrito\n- Testes em Vitest para src/lib\n<!-- BMAD:PROJECT-CONTEXT END -->' }],
        uses: S('bmad-project-context'),
      },
      {
        id: 'sprint',
        command: C('bmad-sprint-planning'),
        phase: 'tasks',
        title: 'Sprint planning',
        kind: 'prompt',
        summary: 'Lê os épicos e gera o sprint-status.yaml: a fila de stories com o status de cada uma (backlog → em andamento → feito).',
        inputs: ['epics.md'],
        outputs: [`${IMPL}/sprint-status.yaml`],
        defaultPrompt: `${C('bmad-sprint-planning')}`,
        creates: [
          {
            path: `${IMPL}/sprint-status.yaml`,
            kind: 'spec',
            preview: `development_status:
  epic-1: in-progress
  1-1-criar-tarefa: backlog
  1-2-persistir-no-navegador: backlog
  epic-2: backlog
  2-1-adicionar-tags: backlog
  2-2-filtrar-por-tags: backlog`,
          },
        ],
        uses: S('bmad-sprint-planning'),
      },
      {
        id: 'build',
        command: C('bmad-build'),
        phase: 'implement',
        title: 'Implementar a story',
        kind: 'prompt',
        badge: 'Amelia · Developer',
        summary: 'Implementa uma story por sessão: planeja, codifica, testa e atualiza o status. Repita para cada story da sprint (precisa do uv instalado).',
        inputs: ['sprint-status.yaml', 'Story da vez', 'ARCHITECTURE-SPINE.md'],
        outputs: ['Código e testes', 'sprint-status.yaml atualizado'],
        defaultPrompt: `${C('bmad-build')} Implemente a story 1.1 (Criar tarefa) seguindo a arquitetura. Escreva os testes primeiro e pare para eu revisar ao final.`,
        creates: [
          { path: 'package.json', kind: 'code' },
          { path: 'src/lib/types.ts', kind: 'code' },
          { path: 'src/lib/storage.ts', kind: 'code' },
          { path: 'src/hooks/useTasks.ts', kind: 'code' },
          { path: 'src/components/TaskForm.tsx', kind: 'code' },
          { path: 'src/App.tsx', kind: 'code' },
          { path: 'tests/useTasks.test.ts', kind: 'code' },
        ],
        updates: [`${IMPL}/sprint-status.yaml`],
        uses: P('bmad-agent-dev').concat(S('bmad-build')),
      },
      {
        id: 'review',
        command: C('bmad-code-review'),
        phase: 'verify',
        title: 'Code review',
        kind: 'prompt',
        optional: true,
        summary: 'Revisão com vários revisores (correção, segurança, aderência à story e à arquitetura) e triagem dos achados.',
        inputs: ['Código da story', 'Story e arquitetura'],
        outputs: ['Achados no chat'],
        defaultPrompt: `${C('bmad-code-review')} Revise a implementação da story 1.1 contra os critérios de aceite e a arquitetura.`,
        uses: S('bmad-code-review'),
      },
      {
        id: 'qa',
        command: C('bmad-qa-generate-e2e-tests'),
        phase: 'verify',
        title: 'Testes E2E',
        kind: 'prompt',
        optional: true,
        badge: 'Amelia · Developer',
        summary: 'Gera testes ponta a ponta para as funcionalidades já implementadas.',
        inputs: ['Código', 'Stories concluídas'],
        outputs: ['Suíte de testes E2E'],
        defaultPrompt: `${C('bmad-qa-generate-e2e-tests')} Gere testes E2E para criar, concluir e filtrar tarefas.`,
        creates: [{ path: 'tests/e2e/tasks.spec.ts', kind: 'code' }],
        uses: S('bmad-qa-generate-e2e-tests'),
      },
      {
        id: 'retro',
        command: C('bmad-retrospective'),
        phase: 'verify',
        title: 'Retrospectiva',
        kind: 'prompt',
        optional: true,
        badge: 'Amelia · Developer',
        summary: 'Ao fechar um épico, revisa o que funcionou, o que não funcionou e o que levar para o próximo.',
        inputs: ['Épico concluído', 'sprint-status.yaml'],
        outputs: [`Retrospectiva em ${IMPL}/`],
        defaultPrompt: `${C('bmad-retrospective')} Faça a retrospectiva do Epic 1.`,
        updates: [`${IMPL}/sprint-status.yaml`],
        uses: S('bmad-retrospective'),
      },
    ]
  },
}
