"use client"

import { useState } from "react"
import { CheckCircle } from "lucide-react"
import { MarkLessonCompleted } from "./actions"

interface CompleteButtonProps {
  lessonId: string
  userId: string
  isCompleted: boolean
}

export function CompleteButton({ lessonId, userId, isCompleted: initialIsCompleted }: CompleteButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted)
  const [isPending, setIsPending] = useState(false)

  const handleClick = async () => {
    setIsPending(true)
    try {
      await MarkLessonCompleted(lessonId, userId, isCompleted)
      setIsCompleted(!isCompleted)
    } catch (error) {
      console.error("Erro ao marcar aula como concluída:", error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isCompleted ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      <CheckCircle className={`mr-2 h-4 w-4 ${isCompleted ? "text-green-500" : "text-gray-500"}`} />
      {isPending ? "Processando..." : isCompleted ? "Aula Concluída" : "Marcar como Concluída"}
    </button>
  )
}
