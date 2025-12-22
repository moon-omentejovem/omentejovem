'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import UserRoleDisplay from './UserRoleDisplay'

const navItems = [
  { href: '/admin/artworks', label: 'Artworks', icon: '🎨' },
  { href: '/admin/series', label: 'Series', icon: '📚' },
  { href: '/admin/artifacts', label: 'Artifacts', icon: '🏺' },
  { href: '/admin/about', label: 'About Page', icon: '📄' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/users/cache', label: 'Cache', icon: '🗄️' }
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin/users') {
      return pathname === '/admin/users'
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <aside className="w-full md:w-64 bg-white text-sm flex flex-col border-b md:border-r border-gray-200 md:sticky md:top-32">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">O</span>
          </div>
          <span className="font-medium text-gray-900">Omentejovem CMS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors',
                isActive(item.href)
                  ? 'bg-orange-100 text-orange-700 border-l-4 border-orange-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-3 sticky bottom-0 bg-white">
        {/* User Role Info */}
        <UserRoleDisplay />

        <Link
          href="/admin/logout"
          className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-red-600 rounded-md transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  )
}
