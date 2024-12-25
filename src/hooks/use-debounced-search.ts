import { useState, useEffect, useCallback } from "react"
import Fuse from "fuse.js"

interface FuseOptions<T> {
  keys: Array<keyof T & string>
  threshold?: number
  distance?: number
}

export function useDebouncedSearch<T>(
  data: T[],
  options: FuseOptions<T>,
  delay: number = 300
) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [results, setResults] = useState<T[]>(data)

  // Initialize Fuse instance
  const fuse = new Fuse(data, {
    ...options,
    threshold: options.threshold ?? 0.3,
    distance: options.distance ?? 100,
    keys: options.keys,
  })

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, delay)

    return () => clearTimeout(timer)
  }, [query, delay])

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setResults(data)
      return
    }

    const searchResults = fuse.search(debouncedQuery).map(result => result.item)
    setResults(searchResults)
  }, [debouncedQuery, data])

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
  }, [])

  return {
    query,
    results,
    handleSearch,
  }
} 