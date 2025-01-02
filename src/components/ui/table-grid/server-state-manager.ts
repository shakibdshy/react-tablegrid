import { useCallback, useEffect, useReducer } from 'react'
import type { TableState } from './types'
import type { ServerSideConfig } from './utility-types'

interface ServerState<T> {
  loading: boolean
  data: T[]
  error: Error | null
  currentPage: number
  totalPages: number
}

type ServerAction<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: T[] }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'SET_PAGE'; payload: number }

function serverStateReducer<T>(
  state: ServerState<T>,
  action: ServerAction<T>
): ServerState<T> {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload }
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload }
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload }
    default:
      return state
  }
}

export function useServerState<T>(
  config: ServerSideConfig<T>,
  tableState: TableState<T>
) {
  const [state, dispatch] = useReducer(serverStateReducer<T>, {
    loading: false,
    data: [],
    error: null,
    currentPage: 0,
    totalPages: Math.ceil(config.totalRows / config.pageSize),
  })

  const fetchData = useCallback(async () => {
    if (!config.enabled) return

    dispatch({ type: 'FETCH_START' })

    try {
      const data = await config.onFetch({
        page: state.currentPage,
        pageSize: config.pageSize,
        sortColumn: tableState.sortColumn,
        sortDirection: tableState.sortDirection,
        filters: {
          search: tableState.filterValue,
        },
      })
      dispatch({ type: 'FETCH_SUCCESS', payload: data })
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error })
    }
  }, [
    config,
    state.currentPage,
    tableState.sortColumn,
    tableState.sortDirection,
    tableState.filterValue,
  ])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    ...state,
    setPage: (page: number) => dispatch({ type: 'SET_PAGE', payload: page }),
    refetch: fetchData,
  }
} 