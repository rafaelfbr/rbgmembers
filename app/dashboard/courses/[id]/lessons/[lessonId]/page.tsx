import { getUserDetails } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ArrowRight, FileText } from "lucide-react"
import Link from "next/link"
import { CompleteButton } from "./complete-button"

export default async function LessonPage({
  params,
}: {
  params: { id: string; lessonId: string }
}) {
  const user = await getUserDetails()
  const supabase = createClient()

  // Verificar se o usuário tem acesso ao curso
  const { data: userProduct } = await supabase
    .from("user_products")
    .select("*")
    .eq("user_id", user?.id)
    .eq("product_id", params.id)
    .single()

  if (!userProduct) {
    redirect("/dashboard/library")
  }

  // Buscar detalhes da aula
  const { data: lesson } = await supabase
    .from("lessons")
    .select(`
      *,
      modules (
        *,
        products (*)
      )
    `)
    .eq("id", params.lessonId)
    .single()

  if (!lesson) {
    notFound()
  }

  // Verificar se o produto da aula corresponde ao ID do curso
  if (lesson.modules.product_id !== params.id) {
    redirect(`/dashboard/courses/${params.id}`)
  }

  // Buscar materiais da aula
  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .eq("lesson_id", params.lessonId)
    .order("created_at", { ascending: false })

  // Buscar progresso do usuário para esta aula
  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user?.id)
    .eq("lesson_id", params.lessonId)
    .single()

  // Buscar aulas anterior e próxima
  const { data: moduleWithLessons } = await supabase
    .from("modules")
    .select(`
      *,
      lessons (*)
    `)
    .eq("id", lesson.module_id)
    .single()

  const sortedLessons = moduleWithLessons?.lessons.sort((a, b) => a.position - b.position) || []
  const currentIndex = sortedLessons.findIndex((l) => l.id === params.lessonId)

  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/courses/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao curso
          </Link>
        </Button>

        <CompleteButton lessonId={params.lessonId} userId={user?.id || ""} isCompleted={progress?.completed || false} />
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
        <p className="text-muted-foreground">
          {lesson.modules.title} • {lesson.modules.products.name}
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {lesson.video_url && (
            <div className="aspect-video w-full">
              <iframe
                src={lesson.video_url.replace("vimeo.com", "player.vimeo.com/video")}
                className="h-full w-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </CardContent>
      </Card>

      {lesson.description && (
        <div className="prose max-w-none">
          <h2>Descrição</h2>
          <p>{lesson.description}</p>
        </div>
      )}

      {materials && materials.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Materiais Complementares</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <Card key={material.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-2">
                    <h3 className="font-medium">{material.title}</h3>
                    {material.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{material.description}</p>
                    )}
                    <Button asChild className="mt-2">
                      <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        {material.file_type === "PDF" ? "Visualizar PDF" : "Baixar Material"}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        {prevLesson ? (
          <Button variant="outline" asChild>
            <Link href={`/dashboard/courses/${params.id}/lessons/${prevLesson.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Aula Anterior
            </Link>
          </Button>
        ) : (
          <div></div>
        )}

        {nextLesson && (
          <Button asChild>
            <Link href={`/dashboard/courses/${params.id}/lessons/${nextLesson.id}`}>
              Próxima Aula
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
