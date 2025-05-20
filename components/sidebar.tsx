"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Library, BookOpen, FileText, User, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Biblioteca",
      icon: Library,
      href: "/dashboard/library",
      active: pathname === "/dashboard/library",
    },
    {
      label: "Cursos",
      icon: BookOpen,
      href: "/dashboard/courses",
      active: pathname === "/dashboard/courses" || pathname.startsWith("/dashboard/courses/"),
    },
    {
      label: "Materiais",
      icon: FileText,
      href: "/dashboard/materials",
      active: pathname === "/dashboard/materials",
    },
    {
      label: "Meu Perfil",
      icon: User,
      href: "/dashboard/profile",
      active: pathname === "/dashboard/profile",
    },
  ]

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed right-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-white transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-[#2C61F5]">RBG Members</span>
          </Link>
        </div>

        <div className="flex-1 overflow-auto py-4">
          <nav className="space-y-1 px-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  route.active ? "bg-[#2C61F5]/10 text-[#2C61F5]" : "text-gray-700 hover:bg-gray-100",
                )}
                onClick={() => setIsOpen(false)}
              >
                <route.icon className={cn("mr-3 h-5 w-5", route.active ? "text-[#2C61F5]" : "text-gray-500")} />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-500" />
            Sair
          </Button>
        </div>
      </div>
    </>
  )
}
