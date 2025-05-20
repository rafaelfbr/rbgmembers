import { getUserDetails } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function MaterialPage({ params }: { params: { id: string } }) {
  const user = await getUserDetails()
  const supabase = createClient()

  // Verificar se o usuário tem acesso ao material
  const { data: userProduct } = await supabase
    .from("user_products")
    .select("*")
    .eq("user_id", user?.id)
    .eq("product_id", params.id)
    .single()

  if (!userProduct) {
    redirect("/dashboard/library")
  }

  // Buscar detalhes do material
  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      niches (name),
      languages (name)
    `)
    .eq("id", params.id)
    .single()

  if (!product || (product.is_course && !product.is_ebook && !product.is_material)) {
    notFound()
  }

  // Buscar materiais
  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .eq("product_id", params.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Button variant="outline" asChild>
          <Link href="/dashboard/library">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar à biblioteca
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-start md:gap-8">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <Card>
            <div className="aspect-square w-full bg-gray-100">
              {product.cover_image ? (
                <Image
                  src={product.cover_image || "/placeholder.svg"}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-muted-foreground">Sem imagem</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-4 flex-1 space-y-4 md:mt-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {materials && materials.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight">Materiais Disponíveis</h2>

              <div className="space-y-4">
                {materials.map((material) => (
                  <Card key={material.id}>
                    <CardHeader className="pb-2">
                      <CardTitle>{material.title}</CardTitle>
                      <CardDescription>{material.description || "Sem descrição"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {material.file_type === "PDF" ? (
                        <div className="space-y-4">
                          <div className="aspect-[3/4] w-full max-h-[500px] overflow-hidden rounded-md border">
                            <iframe
                              src={`${material.file_url}#toolbar=0`}
                              className="h-full w-full"
                              title={material.title}
                            ></iframe>
                          </div>
                          <Button asChild className="w-full">
                            <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                              <FileText className="mr-2 h-4 w-4" />
                              Abrir PDF em Nova Aba
                            </a>
                          </Button>
                        </div>
                      ) : (
                        <Button asChild className="w-full">
                          <a href={material.file_url} download>
                            <FileText className="mr-2 h-4 w-4" />
                            Baixar {material.file_type}
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Não há materiais disponíveis para este produto.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
