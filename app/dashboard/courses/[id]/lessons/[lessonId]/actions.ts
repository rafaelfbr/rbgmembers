"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function MarkLessonCompleted(lessonId: string, userId: string, isCompleted: boolean) {
  const supabase = createClient()

  // Verificar se já existe um registro de progresso
  const { data: existingProgress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .single()

  if (existingProgress) {
    // Atualizar o registro existente
    await supabase
      .from("user_progress")
      .update({
        completed: !isCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingProgress.id)
  } else {
    // Criar um novo registro
    await supabase.from("user_progress").insert({
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      last_position: 0,
    })
  }

  // Revalidar a página para atualizar os dados
  revalidatePath(`/dashboard/courses/[id]/lessons/[lessonId]`)

  return { success: true }
}
