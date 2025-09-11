import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="bg-neutral-900 p-8 rounded-lg shadow-xl w-96 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-neutral-400 mb-6">
          Sorry, we couldn&apos;t authenticate you. This could be due to an
          expired or invalid link.
        </p>
        <div className="space-y-3">
          <Link
            href="/admin"
            className="block bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="block text-neutral-400 hover:text-white transition-colors"
          >
            Back to Website
          </Link>
        </div>
      </div>
    </div>
  )
}
