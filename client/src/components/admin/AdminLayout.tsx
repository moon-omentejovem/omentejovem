import Sidebar from './Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
