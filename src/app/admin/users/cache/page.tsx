'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface CacheConfig {
  cacheTtlDays: number
  lastClearedAt: string | null
  updatedAt: string | null
}

const DEFAULT_TTL_DAYS = 10

export default function CachePage() {
  const [config, setConfig] = useState<CacheConfig | null>(null)
  const [ttlInput, setTtlInput] = useState<string>(String(DEFAULT_TTL_DAYS))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/admin/cache')
        if (!response.ok) {
          throw new Error('Failed to load cache configuration')
        }
        const data = await response.json()
        const days = data.cacheTtlDays ?? DEFAULT_TTL_DAYS
        setConfig({
          cacheTtlDays: days,
          lastClearedAt: data.lastClearedAt ?? null,
          updatedAt: data.updatedAt ?? null
        })
        setTtlInput(String(days))
      } catch (error) {
        toast.error('Não foi possível carregar a configuração de cache')
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  const handleSave = async () => {
    const parsed = Number(ttlInput)
    if (Number.isNaN(parsed) || parsed < 0) {
      toast.error('Informe um número de dias válido')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cacheTtlDays: parsed })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Falha ao salvar configuração')
      }

      const data = await response.json()
      const days = data.cacheTtlDays ?? parsed
      setConfig({
        cacheTtlDays: days,
        lastClearedAt: data.lastClearedAt ?? null,
        updatedAt: data.updatedAt ?? null
      })
      setTtlInput(String(days))
      toast.success('Configuração de cache salva com sucesso')
    } catch (error) {
      toast.error('Não foi possível salvar a configuração de cache')
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    try {
      setClearing(true)
      const response = await fetch('/api/admin/cache/clear', {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Falha ao limpar cache')
      }

      const data = await response.json()
      setConfig((prev) => ({
        cacheTtlDays: prev?.cacheTtlDays ?? DEFAULT_TTL_DAYS,
        lastClearedAt: data.lastClearedAt ?? new Date().toISOString(),
        updatedAt: data.updatedAt ?? prev?.updatedAt ?? null
      }))
      toast.success('Cache limpo com sucesso')
    } catch (error) {
      toast.error('Não foi possível limpar o cache')
    } finally {
      setClearing(false)
    }
  }

  const formatDateTime = (value: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString()
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl px-6 pt-20 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Cache</h1>
          <p className="text-gray-500 mt-2">
            Configure o tempo de cache das imagens servidas pelo proxy e limpe o
            cache quando necessário.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div>
            <label
              htmlFor="cache-ttl-days"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Duração do cache (em dias)
            </label>
            <div className="flex items-center gap-4">
              <input
                id="cache-ttl-days"
                type="number"
                min={0}
                step={1}
                value={ttlInput}
                onChange={(e) => setTtlInput(e.target.value)}
                disabled={loading || saving}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
              />
              <span className="text-sm text-gray-500">
                Padrão: {DEFAULT_TTL_DAYS} dias
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 space-y-1">
              <p>
                Última atualização:{' '}
                <span className="font-medium">
                  {formatDateTime(config?.updatedAt ?? null)}
                </span>
              </p>
              <p>
                Última limpeza:{' '}
                <span className="font-medium">
                  {formatDateTime(config?.lastClearedAt ?? null)}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClear}
                disabled={loading || clearing}
                className="px-4 py-2 rounded-md border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {clearing ? 'Limpando...' : 'Limpar cache'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || saving}
                className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
