import type { Agent } from '../types'

/**
 * Caminhos e sintaxe conferidos com `specify init --integration <key>` (specify-cli 1.0.13)
 * e `openspec init --tools <key>` (openspec 1.14.3).
 * BMad (bmad-method 6.12): pastas tiradas de tools/installer/ide/platform-codes.yaml do repositório.
 */
export const AGENTS: Agent[] = [
  {
    id: 'claude',
    name: 'Claude Code',
    launch: '# Abrir o Claude Code no terminal da IDE\nclaude',
    speckit: { key: 'claude', cmd: (c) => `/speckit-${c}`, file: (c) => `.claude/skills/speckit-${c}/SKILL.md` },
    bmad: { key: 'claude-code', cmd: (s) => `/${s}`, dir: '.claude/skills' },
    openspec: {
      key: 'claude',
      cmd: (c) => `/opsx:${c}`,
      files: (c, s) => [`.claude/commands/opsx/${c}.md`, `.claude/skills/${s}/SKILL.md`],
    },
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    launch: '# Abrir o Copilot Chat (modo Agent) no VS Code ou IntelliJ',
    speckit: { key: 'copilot', cmd: (c) => `/speckit-${c}`, file: (c) => `.github/skills/speckit-${c}/SKILL.md` },
    bmad: {
      key: 'github-copilot',
      cmd: (s) => `/${s}`,
      dir: '.agents/skills',
      agentFile: (s) => `.github/agents/${s}.agent.md`,
    },
    openspec: {
      key: 'github-copilot',
      cmd: (c) => `/opsx-${c}`,
      files: (c, s) => [`.github/prompts/opsx-${c}.prompt.md`, `.github/skills/${s}/SKILL.md`],
    },
  },
  {
    id: 'cursor',
    name: 'Cursor',
    launch: '# Abrir o chat do Cursor (modo Agent) neste projeto',
    speckit: { key: 'cursor-agent', cmd: (c) => `/speckit-${c}`, file: (c) => `.cursor/skills/speckit-${c}/SKILL.md` },
    bmad: { key: 'cursor', cmd: (s) => `/${s}`, dir: '.agents/skills' },
    openspec: {
      key: 'cursor',
      cmd: (c) => `/opsx-${c}`,
      files: (c, s) => [`.cursor/commands/opsx-${c}.md`, `.cursor/skills/${s}/SKILL.md`],
    },
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    launch: '# Abrir o Gemini CLI no terminal da IDE\ngemini',
    speckit: { key: 'gemini', cmd: (c) => `/speckit.${c}`, file: (c) => `.gemini/commands/speckit.${c}.toml` },
    bmad: { key: 'gemini', cmd: (s) => `/${s}`, dir: '.agents/skills' },
    openspec: {
      key: 'gemini',
      cmd: (c) => `/opsx:${c}`,
      files: (c, s) => [`.gemini/commands/opsx/${c}.toml`, `.gemini/skills/${s}/SKILL.md`],
    },
  },
  {
    id: 'codex',
    name: 'Codex',
    launch: '# Abrir o Codex no terminal da IDE\ncodex',
    speckit: { key: 'codex', cmd: (c) => `$speckit-${c}`, file: (c) => `.agents/skills/speckit-${c}/SKILL.md` },
    bmad: { key: 'codex', cmd: (s) => `$${s}`, dir: '.agents/skills' },
    openspec: {
      key: 'codex',
      cmd: (_c, s) => `$${s}`,
      files: (_c, s) => [`.agents/skills/${s}/SKILL.md`],
    },
  },
  {
    id: 'junie',
    name: 'Junie (JetBrains)',
    launch: '# Abrir o Junie no IntelliJ / JetBrains IDE',
    speckit: { key: 'junie', cmd: (c) => `/speckit.${c}`, file: (c) => `.junie/commands/speckit-${c}.md` },
    bmad: { key: 'junie', cmd: (s) => `/${s}`, dir: '.junie/skills' },
    openspec: {
      key: 'junie',
      cmd: (c) => `/opsx-${c}`,
      files: (c, s) => [`.junie/commands/opsx-${c}.md`, `.junie/skills/${s}/SKILL.md`],
    },
  },
]
