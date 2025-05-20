"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface User {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
}

export function UpdateProfileForm({ user }: { user: User }) {
  const [fullName, setFullName] = useState(user.full_name || "")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      setMessage({
        type: "success",
        text: "Perfil atualizado com sucesso!",
      })
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Ocorreu um erro ao atualizar o perfil. Por favor, tente novamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" value={user.email} disabled />
        <p className="text-sm text-muted-foreground">Seu e-mail não pode ser alterado</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} />
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="bg-[#2C61F5] hover:bg-[#1a4fd8]" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          "Salvar Alterações"
        )}
      </Button>
    </form>
  )
}
