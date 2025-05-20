import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // Verificar se o usuário é administrador (implementar sua própria lógica)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Você precisa estar logado para acessar esta página.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Buscar estatísticas
  const { data: usersCount } = await supabase.from("profiles").select("id", { count: "exact", head: true })

  const { data: productsCount } = await supabase.from("products").select("id", { count: "exact", head: true })

  const { data: accessCount } = await supabase.from("user_products").select("id", { count: "exact", head: true })

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentProducts } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentAccess } = await supabase
    .from("user_products")
    .select(`
      *,
      profiles (email),
      products (name)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
        <p className="text-muted-foreground">Gerencie usuários, produtos e acessos</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total de Usuários</CardTitle>
            <CardDescription>Usuários registrados na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{usersCount?.count || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total de Produtos</CardTitle>
            <CardDescription>Cursos, e-books e materiais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{productsCount?.count || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Acessos Concedidos</CardTitle>
            <CardDescription>Total de acessos a produtos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{accessCount?.count || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="access">Acessos</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Usuários Recentes</h2>
            <Button asChild>
              <Link href="/admin/users">Ver Todos</Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Nome</th>
                    <th className="p-4 text-left font-medium">E-mail</th>
                    <th className="p-4 text-left font-medium">Data de Criação</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers?.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-4">{user.full_name || "N/A"}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">{new Date(user.created_at).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Produtos Recentes</h2>
            <Button asChild>
              <Link href="/admin/products">Ver Todos</Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Nome</th>
                    <th className="p-4 text-left font-medium">Tipo</th>
                    <th className="p-4 text-left font-medium">Data de Criação</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts?.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="p-4">{product.name}</td>
                      <td className="p-4">{product.is_course ? "Curso" : product.is_ebook ? "E-book" : "Material"}</td>
                      <td className="p-4">{new Date(product.created_at).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Acessos Recentes</h2>
            <Button asChild>
              <Link href="/admin/access">Ver Todos</Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Usuário</th>
                    <th className="p-4 text-left font-medium">Produto</th>
                    <th className="p-4 text-left font-medium">Data de Acesso</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAccess?.map((access) => (
                    <tr key={access.id} className="border-b">
                      <td className="p-4">{access.profiles?.email}</td>
                      <td className="p-4">{access.products?.name}</td>
                      <td className="p-4">{new Date(access.access_granted_at).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
