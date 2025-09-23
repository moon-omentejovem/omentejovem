import Sidebar from './Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}
