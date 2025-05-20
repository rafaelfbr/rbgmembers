import { getUserDetails } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, Unlock, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { search?: string; tab?: string }
}) {
  const user = await getUserDetails()
  const supabase = createClient()

  const search = searchParams.search || ""
  const tab = searchParams.tab || "all"

  // Buscar produtos que o usuário tem acesso
  const { data: userProducts } = await supabase.from("user_products").select("product_id").eq("user_id", user?.id)

  const userProductIds = userProducts?.map((up) => up.product_id) || []

  // Construir a query base
  let query = supabase.from("products").select(`
      *,
      niches (name),
      languages (name)
    `)

  // Aplicar filtro de pesquisa se existir
  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  // Aplicar filtro por tipo
  if (tab === "courses") {
    query = query.eq("is_course", true)
  } else if (tab === "ebooks") {
    query = query.eq("is_ebook", true)
  } else if (tab === "materials") {
    query = query.eq("is_material", true)
  }

  // Aplicar filtro por acesso
  if (tab === "accessible") {
    query = query.in("id", userProductIds)
  } else if (tab === "blocked") {
    query = query.not("id", "in", userProductIds)
  }

  // Executar a query
  const { data: products } = await query.order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Biblioteca</h1>
        <p className="text-muted-foreground">Explore todos os produtos disponíveis</p>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <form className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar produtos..." className="pl-8" name="search" defaultValue={search} />
        </form>
      </div>

      <Tabs defaultValue={tab || "all"}>
        <TabsList className="mb-4">
          <TabsTrigger value="all" asChild>
            <Link href="/dashboard/library">Todos</Link>
          </TabsTrigger>
          <TabsTrigger value="accessible" asChild>
            <Link href="/dashboard/library?tab=accessible">Acessíveis</Link>
          </TabsTrigger>
          <TabsTrigger value="blocked" asChild>
            <Link href="/dashboard/library?tab=blocked">Bloqueados</Link>
          </TabsTrigger>
          <TabsTrigger value="courses" asChild>
            <Link href="/dashboard/library?tab=courses">Cursos</Link>
          </TabsTrigger>
          <TabsTrigger value="ebooks" asChild>
            <Link href="/dashboard/library?tab=ebooks">E-books</Link>
          </TabsTrigger>
          <TabsTrigger value="materials" asChild>
            <Link href="/dashboard/library?tab=materials">Materiais</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {products && products.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const hasAccess = userProductIds.includes(product.id)

                return (
                  <Card key={product.id} className={`overflow-hidden ${!hasAccess ? "opacity-80" : ""}`}>
                    <div className="aspect-video w-full bg-gray-100 relative">
                      {product.cover_image ? (
                        <>
                          {!hasAccess && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                              <Lock className="h-12 w-12 text-white/80" />
                            </div>
                          )}
                          <Image
                            src={product.cover_image || "/placeholder.svg"}
                            alt={product.name}
                            width={500}
                            height={280}
                            className="h-full w-full object-cover"
                          />
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          {hasAccess ? (
                            <span className="text-muted-foreground">Sem imagem</span>
                          ) : (
                            <Lock className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between">
                        <CardTitle className="line-clamp-1 text-lg">{product.name}</CardTitle>
                        <Badge variant="outline" className="ml-2 shrink-0">
                          {product.is_course ? "Curso" : product.is_ebook ? "E-book" : "Material"}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {product.description || "Sem descrição"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      {hasAccess ? (
                        <Button asChild className="w-full">
                          <Link
                            href={
                              product.is_course
                                ? `/dashboard/courses/${product.id}`
                                : `/dashboard/materials/${product.id}`
                            }
                          >
                            <Unlock className="mr-2 h-4 w-4" />
                            Acessar
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full" disabled>
                          <Lock className="mr-2 h-4 w-4" />
                          Acesso Bloqueado
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="mb-4 text-center text-muted-foreground">
                  {search
                    ? "Nenhum produto encontrado com os critérios de busca."
                    : "Não há produtos disponíveis no momento."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Os outros TabsContent teriam o mesmo conteúdo, mas são renderizados automaticamente pelo filtro da URL */}
      </Tabs>
    </div>
  )
}
