import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getSession() {
  if (typeof window !== "undefined") {
    const userId = localStorage.getItem("user_id")
    if (userId) {
      // Retorna um objeto de sessão fake para compatibilidade
      return { user: { id: userId } }
    }
  }
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function getUserDetails() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return {
    ...session.user,
    ...profile,
  }
}

export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return session
}
