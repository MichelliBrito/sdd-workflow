# SDD Workflow

App didático para aulas de **Spec-Driven Development**: mostra o passo a passo do **GitHub Spec Kit**, do **OpenSpec** e do **BMad Method**, com prompts editáveis/copiáveis para colar no seu agente (Claude Code, GitHub Copilot, Cursor, Gemini CLI, Codex ou Junie) e a estrutura de arquivos que cada ferramenta gera.

```bash
npm install
npm run dev        # http://localhost:5173
```

- Edições de prompt ficam no navegador (localStorage); **Nova simulação** limpa tudo.
- Atalhos: `←/→` navegam entre passos, `⌘/Ctrl + Enter` copia o prompt.
- Conteúdo das ferramentas: `src/data/speckit.ts`, `src/data/openspec.ts` e `src/data/bmad.ts` (prompts default, arquivos criados por passo, previews).
- Agentes (flag do init, sintaxe do comando, pastas): `src/data/agents.ts`.
- Modo claro/escuro no botão sol/lua do topo.

Estruturas conferidas rodando `specify init --integration <agente>` (specify-cli 1.0.13) e `openspec init --tools <agente>` (openspec 1.14.3) para cada agente da lista.
BMad Method modelado sobre a v6.12 (`bmad-method` 6.12.4 no npm), a partir do código-fonte do repositório (module-help.csv, platform-codes.yaml, install-paths.js); o instalador não foi executado.
