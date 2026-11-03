import { useEffect, useState } from 'react'

/** useState que sobrevive a F5 (localStorage). Falha silenciosamente se o storage estiver bloqueado. */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? { ...initial, ...JSON.parse(raw) } : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage indisponível: segue só em memória */
    }
  }, [key, value])

  return [value, setValue] as const
}
