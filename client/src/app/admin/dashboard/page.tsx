'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface TokenMetadata {
  contract: {
    address: string
    name: string
  }
  tokenId: string
  name: string
  image: {
    cachedUrl: string
    thumbnailUrl: string
  }
}

interface MintData {
  contractAddress: string
  tokenId: string
  mintDate: string
  imageUrl: string | null
  tokenName?: string
  tokenImage?: string
}

const PLATFORM_CONTRACTS = {
  SUPERRARE: '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0',
  POAP: '0x22c1f6050e56d2876009903609a2cc3fef83b415',
  RARIBLE: '0x60f80121c31a0d46b5279700f9df786054aa5ee5'
} as const

const PLATFORM_STYLES = {
  SUPERRARE: 'bg-purple-100 text-purple-800',
  POAP: 'bg-green-100 text-green-800',
  RARIBLE: 'bg-blue-100 text-blue-800'
} as const

export default function AdminDashboard() {
  const router = useRouter()
  const [mintData, setMintData] = useState<MintData[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<keyof MintData>('mintDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newEntry, setNewEntry] = useState<Partial<MintData>>({
    contractAddress: '',
    tokenId: '',
    mintDate: new Date().toISOString(),
    imageUrl: null
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [modalImage, setModalImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchMintData = async () => {
      try {
        const [mintResponse, metadataResponse] = await Promise.all([
          fetch('/mint-dates.json'),
          fetch('/token-metadata.json')
        ])

        const mintData = await mintResponse.json()
        const metadataData = await metadataResponse.json()

        // Create a map for quick lookup of token metadata
        const metadataMap = new Map<string, TokenMetadata>()
        metadataData.forEach((item: TokenMetadata) => {
          const key = `${item.contract.address.toLowerCase()}-${item.tokenId}`
          metadataMap.set(key, item)
        })

        // Filter out null values and enrich with metadata
        const validData = mintData
          .filter((item: MintData | null) => item !== null)
          .map((item: MintData) => {
            const key = `${item.contractAddress.toLowerCase()}-${item.tokenId}`
            const metadata = metadataMap.get(key)

            return {
              ...item,
              tokenName: metadata?.name || 'Unknown',
              tokenImage:
                metadata?.image?.thumbnailUrl ||
                metadata?.image?.cachedUrl ||
                null
            }
          })

        setMintData(validData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMintData()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST'
      })
      router.push('/admin')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleSort = (field: keyof MintData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPlatform = (contractAddress: string) => {
    const address = contractAddress.toLowerCase()
    if (address === PLATFORM_CONTRACTS.SUPERRARE.toLowerCase())
      return 'SUPERRARE'
    if (address === PLATFORM_CONTRACTS.POAP.toLowerCase()) return 'POAP'
    if (address === PLATFORM_CONTRACTS.RARIBLE.toLowerCase()) return 'RARIBLE'
    return null
  }

  const handleDelete = async (contractAddress: string, tokenId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return
    }

    setDeletingId(`${contractAddress}-${tokenId}`)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/delete-mint-date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contractAddress, tokenId })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete entry')
      }

      setSuccess('Entry deleted successfully')

      // Refresh the data
      const [updatedMintResponse, updatedMetadataResponse] = await Promise.all([
        fetch('/mint-dates.json'),
        fetch('/token-metadata.json')
      ])

      const updatedMintData = await updatedMintResponse.json()
      const updatedMetadataData = await updatedMetadataResponse.json()

      // Create a map for quick lookup of token metadata
      const metadataMap = new Map<string, TokenMetadata>()
      updatedMetadataData.forEach((item: TokenMetadata) => {
        const key = `${item.contract.address.toLowerCase()}-${item.tokenId}`
        metadataMap.set(key, item)
      })

      // Filter out null values and enrich with metadata
      const validData = updatedMintData
        .filter((item: MintData | null) => item !== null)
        .map((item: MintData) => {
          const key = `${item.contractAddress.toLowerCase()}-${item.tokenId}`
          const metadata = metadataMap.get(key)

          return {
            ...item,
            tokenName: metadata?.name || 'Unknown',
            tokenImage:
              metadata?.image?.thumbnailUrl ||
              metadata?.image?.cachedUrl ||
              null
          }
        })

      setMintData(validData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setDeletingId(null)
    }
  }

  const openImageModal = (imageUrl: string) => {
    setModalImage(imageUrl)
  }

  const closeImageModal = () => {
    setModalImage(null)
  }

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/update-mint-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEntry)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add new entry')
      }

      setSuccess('Entry added successfully')
      setIsAddingNew(false)
      setNewEntry({
        contractAddress: '',
        tokenId: '',
        mintDate: new Date().toISOString(),
        imageUrl: null
      })

      // Refresh the data
      const [updatedMintResponse, updatedMetadataResponse] = await Promise.all([
        fetch('/mint-dates.json'),
        fetch('/token-metadata.json')
      ])

      const updatedMintData = await updatedMintResponse.json()
      const updatedMetadataData = await updatedMetadataResponse.json()

      // Create a map for quick lookup of token metadata
      const metadataMap = new Map<string, TokenMetadata>()
      updatedMetadataData.forEach((item: TokenMetadata) => {
        const key = `${item.contract.address.toLowerCase()}-${item.tokenId}`
        metadataMap.set(key, item)
      })

      // Filter out null values and enrich with metadata
      const validData = updatedMintData
        .filter((item: MintData | null) => item !== null)
        .map((item: MintData) => {
          const key = `${item.contractAddress.toLowerCase()}-${item.tokenId}`
          const metadata = metadataMap.get(key)

          return {
            ...item,
            tokenName: metadata?.name || 'Unknown',
            tokenImage:
              metadata?.image?.thumbnailUrl ||
              metadata?.image?.cachedUrl ||
              null
          }
        })

      setMintData(validData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const filteredAndSortedData = mintData
    .filter(
      (item) =>
        item.contractAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tokenId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tokenName &&
          item.tokenName.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortField === 'mintDate') {
        const dateA = new Date(a.mintDate).getTime()
        const dateB = new Date(b.mintDate).getTime()
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
      }

      const aValue = String(a[sortField])
      const bValue = String(b[sortField])
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="space-x-4">
          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            {isAddingNew ? 'Cancel' : 'Add New Entry'}
          </button>
          <button
            onClick={handleLogout}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {isAddingNew && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Entry</h2>
          <form onSubmit={handleAddNew} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contractAddress"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contract Address
                </label>
                <input
                  type="text"
                  id="contractAddress"
                  value={newEntry.contractAddress}
                  onChange={(e) =>
                    setNewEntry({
                      ...newEntry,
                      contractAddress: e.target.value
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="tokenId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Token ID
                </label>
                <input
                  type="text"
                  id="tokenId"
                  value={newEntry.tokenId}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, tokenId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="mintDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mint Date
                </label>
                <input
                  type="datetime-local"
                  id="mintDate"
                  value={newEntry.mintDate?.slice(0, 16)}
                  onChange={(e) =>
                    setNewEntry({
                      ...newEntry,
                      mintDate: new Date(e.target.value).toISOString()
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="imageUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Optimized Image URL (optional)
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  value={newEntry.imageUrl || ''}
                  onChange={(e) =>
                    setNewEntry({
                      ...newEntry,
                      imageUrl: e.target.value || null
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                Save Entry
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by contract address, token ID, or token name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
          />
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token Name
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('contractAddress')}
                  >
                    Contract Address
                    {sortField === 'contractAddress' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('tokenId')}
                  >
                    Token ID
                    {sortField === 'tokenId' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('mintDate')}
                  >
                    Mint Date
                    {sortField === 'mintDate' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Optimized Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedData.map((item, index) => {
                  const platform = getPlatform(item.contractAddress)
                  const itemId = `${item.contractAddress}-${item.tokenId}`
                  return (
                    <tr key={itemId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.tokenImage ? (
                          <button
                            onClick={() => openImageModal(item.tokenImage!)}
                            className="block hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={item.tokenImage}
                              alt={item.tokenName || 'Token'}
                              className="w-12 h-12 rounded object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </button>
                        ) : (
                          <span className="text-gray-400">
                            No image available
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.tokenName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        {item.contractAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.tokenId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(item.mintDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.imageUrl ? (
                          <a
                            href={item.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Image
                          </a>
                        ) : (
                          <span className="text-gray-400">
                            No optimized image (will use full-res)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {platform && (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PLATFORM_STYLES[platform]}`}
                          >
                            {platform}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() =>
                            handleDelete(item.contractAddress, item.tokenId)
                          }
                          disabled={deletingId === itemId}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete entry"
                        >
                          {deletingId === itemId ? (
                            <svg
                              className="w-5 h-5 animate-spin"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={closeImageModal}
        >
          <div className="relative max-w-6xl max-h-full p-8">
            <img
              src={modalImage}
              alt="Full size token"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
