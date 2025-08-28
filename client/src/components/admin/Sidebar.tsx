'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import UserRoleDisplay from './UserRoleDisplay'

const navItems = [
  { href: '/admin/artworks', label: 'Artworks', icon: '🎨' },
  { href: '/admin/series', label: 'Series', icon: '📚' },
  { href: '/admin/artifacts', label: 'Artifacts', icon: '🏺' },
  { href: '/admin/about', label: 'About Page', icon: '📄' }
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-neutral-900 text-sm flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">O</span>
          </div>
          <span className="text-white font-medium">Omentejovem CMS</span>
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
                pathname.startsWith(item.href)
                  ? 'bg-orange-500/10 text-orange-400 border-r-2 border-orange-500'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-800 space-y-3">
        {/* User Role Info */}
        <UserRoleDisplay />

        <Link
          href="/admin/logout"
          className="flex items-center space-x-3 px-3 py-2 text-neutral-400 hover:text-red-400 rounded-md transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  )
}
