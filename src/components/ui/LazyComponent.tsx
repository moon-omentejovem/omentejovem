'use client'

import React, { lazy, Suspense, useState, useEffect, useRef, type ComponentType } from 'react'

interface LazyComponentProps {
  fallback?: React.ReactNode
  errorFallback?: ComponentType<{ error: Error; resetErrorBoundary: () => void }>
  children: React.ReactNode
}

function DefaultErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
      <h3 className="text-red-800 font-medium">Algo deu errado</h3>
      <p className="text-red-600 text-sm mt-1">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
      >
        Tentar novamente
      </button>
    </div>
  )
}

function DefaultLoadingFallback() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  )
}

// Componente ErrorBoundary simples (sem dependência externa)
class SimpleErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: ComponentType<{ error: Error; resetErrorBoundary: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetErrorBoundary={() => this.setState({ hasError: false, error: null })} 
        />
      )
    }

    return this.props.children
  }
}

export function LazyComponent({ 
  fallback = <DefaultLoadingFallback />, 
  errorFallback = DefaultErrorFallback,
  children 
}: LazyComponentProps) {
  return (
    <SimpleErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </SimpleErrorBoundary>
  )
}

// Hook para criar componentes lazy com configuração padrão
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComp = lazy(importFn)
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <LazyComponent fallback={fallback}>
        <LazyComp {...props} />
      </LazyComponent>
    )
  }
}

// Componente para lazy loading baseado em interseção
export function LazyOnView({ 
  children, 
  fallback = <div className="h-32" />,
  rootMargin = '100px'
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  )
}
