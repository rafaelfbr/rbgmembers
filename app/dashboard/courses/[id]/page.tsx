import { Badge } from "@/components/ui/badge"
import { getUserDetails } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, PlayCircle, FileText } from "lucide-react"
import Link from "next/link"

export default async function CoursePage({ params }: { params: { id: string } }) {
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

  // Buscar detalhes do curso
  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      niches (name),
      languages (name)
    `)
    .eq("id", params.id)
    .single()

  if (!product || !product.is_course) {
    notFound()
  }

  // Buscar módulos e aulas
  const { data: modules } = await supabase
    .from("modules")
    .select(`
      *,
      lessons (*)
    `)
    .eq("product_id", params.id)
    .order("position", { ascending: true })

  // Buscar materiais do curso
  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .eq("product_id", params.id)
    .order("created_at", { ascending: false })

  // Buscar progresso do usuário
  const { data: progress } = await supabase.from("user_progress").select("*").eq("user_id", user?.id)

  // Calcular progresso geral
  const totalLessons = modules?.reduce((acc, module) => acc + module.lessons.length, 0) || 0
  const completedLessons = progress?.filter((p) => p.completed).length || 0
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  // Encontrar a próxima aula não concluída
  let nextLessonId = null
  let nextLessonModuleId = null

  if (modules && modules.length > 0) {
    for (const module of modules) {
      for (const lesson of module.lessons) {
        const isCompleted = progress?.some((p) => p.lesson_id === lesson.id && p.completed)
        if (!isCompleted) {
          nextLessonId = lesson.id
          nextLessonModuleId = module.id
          break
        }
      }
      if (nextLessonId) break
    }

    // Se todas as aulas estiverem concluídas, use a primeira aula
    if (!nextLessonId && modules[0].lessons.length > 0) {
      nextLessonId = modules[0].lessons[0].id
      nextLessonModuleId = modules[0].id
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-muted-foreground">{product.description}</p>
        </div>

        {nextLessonId && (
          <Button asChild className="shrink-0">
            <Link href={`/dashboard/courses/${params.id}/lessons/${nextLessonId}`}>
              <PlayCircle className="mr-2 h-4 w-4" />
              {completedLessons > 0 ? "Continuar Curso" : "Iniciar Curso"}
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Seu Progresso</CardTitle>
          <CardDescription>
            {completedLessons} de {totalLessons} aulas concluídas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Conteúdo do Curso</h2>

        <Accordion type="multiple" className="w-full">
          {modules?.map((module) => (
            <AccordionItem key={module.id} value={module.id}>
              <AccordionTrigger className="hover:bg-gray-50 px-4 py-2 rounded-md">
                <div className="flex items-center text-left">
                  <span className="font-medium">{module.title}</span>
                  <Badge variant="outline" className="ml-2">
                    {module.lessons.length} aulas
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="space-y-2 pt-2">
                  {module.lessons.map((lesson) => {
                    const isCompleted = progress?.some((p) => p.lesson_id === lesson.id && p.completed)

                    return (
                      <Link
                        key={lesson.id}
                        href={`/dashboard/courses/${params.id}/lessons/${lesson.id}`}
                        className="flex items-center justify-between rounded-md border p-3 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          {isCompleted ? (
                            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                          ) : (
                            <PlayCircle className="mr-2 h-5 w-5 text-gray-400" />
                          )}
                          <span>{lesson.title}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          {lesson.duration ? <span>{Math.floor(lesson.duration / 60)}min</span> : <span>--</span>}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {materials && materials.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Materiais Complementares</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <Card key={material.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{material.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{material.description || "Sem descrição"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      {material.file_type === "PDF" ? "Visualizar PDF" : "Baixar Material"}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
