import { getUserDetails } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Unlock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function DashboardPage() {
  const user = await getUserDetails()
  const supabase = createClient()

  // Buscar produtos que o usuário tem acesso
  const { data: userProducts } = await supabase.from("user_products").select("product_id").eq("user_id", user?.id)

  const userProductIds = userProducts?.map((up) => up.product_id) || []

  // Buscar todos os produtos
  const { data: allProducts } = await supabase
    .from("products")
    .select(`
      *,
      niches (name),
      languages (name)
    `)
    .order("created_at", { ascending: false })

  // Separar produtos em acessíveis e bloqueados
  const accessibleProducts = allProducts?.filter((product) => userProductIds.includes(product.id)) || []

  const blockedProducts = allProducts?.filter((product) => !userProductIds.includes(product.id)) || []

  // Buscar progresso do usuário
  const { data: userProgress } = await supabase.from("user_progress").select("*").eq("user_id", user?.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, {user?.full_name || user?.email}</h1>
        <p className="text-muted-foreground">Aqui está uma visão geral dos seus produtos e progresso.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total de Produtos</CardTitle>
            <CardDescription>Produtos disponíveis para você</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{accessibleProducts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Cursos em Andamento</CardTitle>
            <CardDescription>Cursos que você começou</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{accessibleProducts.filter((p) => p.is_course).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Materiais Disponíveis</CardTitle>
            <CardDescription>E-books e outros materiais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {accessibleProducts.filter((p) => p.is_ebook || p.is_material).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Seus Produtos</h2>
          <p className="text-muted-foreground">Produtos que você tem acesso</p>
        </div>

        {accessibleProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="mb-4 text-center text-muted-foreground">Você ainda não tem acesso a nenhum produto.</p>
              <Button asChild>
                <Link href="/dashboard/library">Explorar Biblioteca</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accessibleProducts.slice(0, 6).map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-video w-full bg-gray-100">
                  {product.cover_image ? (
                    <Image
                      src={product.cover_image || "/placeholder.svg"}
                      alt={product.name}
                      width={500}
                      height={280}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-muted-foreground">Sem imagem</span>
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
                  <CardDescription className="line-clamp-2">{product.description || "Sem descrição"}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button asChild className="w-full">
                    <Link
                      href={
                        product.is_course ? `/dashboard/courses/${product.id}` : `/dashboard/materials/${product.id}`
                      }
                    >
                      <Unlock className="mr-2 h-4 w-4" />
                      Acessar
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {accessibleProducts.length > 6 && (
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/dashboard/library">Ver todos os produtos</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Outros Produtos</h2>
          <p className="text-muted-foreground">Produtos que você ainda não tem acesso</p>
        </div>

        {blockedProducts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Não há outros produtos disponíveis no momento.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blockedProducts.slice(0, 3).map((product) => (
              <Card key={product.id} className="overflow-hidden opacity-80">
                <div className="aspect-video w-full bg-gray-100 relative">
                  {product.cover_image ? (
                    <>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Lock className="h-12 w-12 text-white/80" />
                      </div>
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
                      <Lock className="h-12 w-12 text-gray-400" />
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
                  <CardDescription className="line-clamp-2">{product.description || "Sem descrição"}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button variant="outline" className="w-full" disabled>
                    <Lock className="mr-2 h-4 w-4" />
                    Acesso Bloqueado
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
