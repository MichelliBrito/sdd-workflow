import type { FileEntry, FileKind, Step } from '../types'

export type Mark = 'new' | 'updated' | 'used'

export interface TreeNode {
  name: string
  path: string
  isDir: boolean
  kind: FileKind
  mark?: Mark
  /** Algum descendente tem destaque — a pasta abre automaticamente. */
  highlighted: boolean
  entry?: FileEntry
  children: TreeNode[]
}

/**
 * Árvore cumulativa: aplica creates/removes de todos os passos visíveis até o atual
 * e marca o que o passo atual cria, altera ou usa.
 */
export function buildTree(steps: Step[], current: number, expanded: boolean): TreeNode {
  const files = new Map<string, FileEntry>()
  steps.slice(0, current + 1).forEach((step) => {
    step.removes?.forEach((prefix) => {
      for (const p of [...files.keys()]) if (p === prefix || p.startsWith(prefix + '/')) files.delete(p)
    })
    step.creates?.forEach((f) => {
      if (f.expandedOnly && !expanded) return
      files.set(f.path, f)
    })
  })

  const step = steps[current]
  const marks = new Map<string, Mark>()
  step?.uses?.forEach((p) => marks.set(p, 'used'))
  step?.updates?.forEach((p) => marks.set(p, 'updated'))
  step?.creates?.forEach((f) => marks.set(f.path, 'new'))

  const root: TreeNode = { name: '', path: '', isDir: true, kind: 'config', highlighted: false, children: [] }

  // Pastas vazias explícitas (terminam em "/") só aparecem se nada mais existir dentro.
  for (const [path, entry] of files) {
    const isEmptyDir = path.endsWith('/')
    const parts = path.replace(/\/$/, '').split('/')
    let node = root
    parts.forEach((name, i) => {
      const sub = parts.slice(0, i + 1).join('/')
      const last = i === parts.length - 1
      let child = node.children.find((c) => c.name === name)
      if (!child) {
        child = { name, path: sub, isDir: !last || isEmptyDir, kind: entry.kind, highlighted: false, children: [] }
        node.children.push(child)
      }
      if (last) {
        if (!isEmptyDir) child.entry = entry
        const mark = marks.get(path) ?? marks.get(sub)
        if (mark) child.mark = mark
      }
      node = child
    })
  }

  const finish = (n: TreeNode): boolean => {
    n.children.sort((a, b) => Number(b.isDir) - Number(a.isDir) || a.name.localeCompare(b.name))
    const childHit = n.children.map(finish).some(Boolean)
    // No setup tudo é "novo": não abrir pastas recolhidas por isso.
    n.highlighted = childHit && current > 0
    return childHit || !!n.mark
  }
  finish(root)
  return root
}
