'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

type LoadingContextType = {
  isGlobalLoading: boolean
  registerLoader: (id: string) => void
  unregisterLoader: (id: string) => void
  isFontLoaded: boolean
  setFontLoaded: (loaded: boolean) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [activeLoaders, setActiveLoaders] = useState<Set<string>>(new Set())
  const [isFontLoaded, setIsFontLoaded] = useState(false)

  const registerLoader = useCallback((id: string) => {
    setActiveLoaders(prev => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const unregisterLoader = useCallback((id: string) => {
    setActiveLoaders(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const setFontLoaded = useCallback((loaded: boolean) => {
    setIsFontLoaded(loaded)
  }, [])

  // Global loading is true if fonts are not loaded OR there are active loaders
  const isGlobalLoading = !isFontLoaded || activeLoaders.size > 0

  return (
    <LoadingContext.Provider
      value={{
        isGlobalLoading,
        registerLoader,
        unregisterLoader,
        isFontLoaded,
        setFontLoaded,
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
