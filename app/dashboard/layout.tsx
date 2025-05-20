import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { requireAuth } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verifica se o usuário está autenticado
  await requireAuth()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  )
}
