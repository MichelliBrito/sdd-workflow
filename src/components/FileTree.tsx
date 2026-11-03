import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from 'lucide-react'
import { useState } from 'react'
import type { Mark, TreeNode } from '../lib/buildTree'
import { KIND_STYLE } from '../lib/kinds'
import type { FileEntry } from '../types'

interface Props {
  root: TreeNode
  rootName: string
  collapsed: string[]
  onOpen: (e: FileEntry) => void
}

const MARK: Record<Mark, { label: string; cls: string; row: string }> = {
  new: { label: '✚ novo', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200', row: 'bg-emerald-50 dark:bg-emerald-950/40' },
  updated: { label: '✎ alterado', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200', row: 'bg-amber-50 dark:bg-amber-950/30' },
  used: { label: '◀ usa', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200', row: 'bg-indigo-50 dark:bg-indigo-950/50' },
}

function Node({ node, depth, collapsed, overrides, setOverride, onOpen }: {
  node: TreeNode
  depth: number
  collapsed: string[]
  overrides: Record<string, boolean>
  setOverride: (path: string, open: boolean) => void
  onOpen: (e: FileEntry) => void
}) {
  const style = KIND_STYLE[node.kind]
  const mark = node.mark && MARK[node.mark]
  const pad = { paddingLeft: depth * 14 + 8 }

  if (node.isDir) {
    const open = overrides[node.path] ?? (node.highlighted || !collapsed.includes(node.path))
    return (
      <li>
        <button
          onClick={() => setOverride(node.path, !open)}
          style={pad}
          className={`flex w-full items-center gap-1 rounded py-0.5 pr-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 ${mark?.row ?? ''}`}
        >
          {open ? <ChevronDown size={13} className="text-slate-400" /> : <ChevronRight size={13} className="text-slate-400" />}
          {open ? <FolderOpen size={15} className="text-slate-400" /> : <Folder size={15} className="text-slate-400" />}
          <span className="truncate text-slate-700 dark:text-slate-300">{node.name}/</span>
          {!open && node.highlighted && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
          {mark && <span className={`ml-auto shrink-0 rounded px-1.5 text-[10px] font-medium ${mark.cls}`}>{mark.label}</span>}
        </button>
        {open && node.children.length > 0 && (
          <ul>
            {node.children.map((c) => (
              <Node key={c.path} node={c} depth={depth + 1} collapsed={collapsed} overrides={overrides} setOverride={setOverride} onOpen={onOpen} />
            ))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <li>
      <button
        onClick={() => node.entry && onOpen(node.entry)}
        style={{ paddingLeft: depth * 14 + 22 }}
        className={`flex w-full items-center gap-1.5 rounded py-0.5 pr-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 ${mark?.row ?? ''}`}
      >
        <File size={14} className={style.text} />
        <span className={`truncate ${style.text}`}>{node.name}</span>
        {mark && <span className={`ml-auto shrink-0 rounded px-1.5 text-[10px] font-medium ${mark.cls}`}>{mark.label}</span>}
      </button>
    </li>
  )
}

export function FileTree({ root, rootName, collapsed, onOpen }: Props) {
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const setOverride = (path: string, open: boolean) => setOverrides((o) => ({ ...o, [path]: open }))

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-4 pb-2">
        <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Estrutura do projeto</div>
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Como aparece no explorer da IDE · clique num arquivo</div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3 font-mono text-[13px]">
        <div className="flex items-center gap-1.5 px-2 py-0.5 font-semibold text-slate-800 dark:text-slate-100">
          <FolderOpen size={15} className="text-indigo-500" /> {rootName}/
        </div>
        <ul>
          {root.children.map((c) => (
            <Node key={c.path} node={c} depth={1} collapsed={collapsed} overrides={overrides} setOverride={setOverride} onOpen={onOpen} />
          ))}
        </ul>
      </div>
      <div className="space-y-1 border-t border-slate-200 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
        {Object.entries(KIND_STYLE).map(([k, s]) => (
          <div key={k} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} /> {s.label}
          </div>
        ))}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {Object.values(MARK).map((m) => (
            <span key={m.label} className={`rounded px-1.5 text-[10px] font-medium ${m.cls}`}>
              {m.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
