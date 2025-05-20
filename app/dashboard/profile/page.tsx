import { getUserDetails } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { UpdateProfileForm } from "./update-profile-form"

export default async function ProfilePage() {
  const user = await getUserDetails()

  if (!user) {
    return null
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize suas informações de perfil</CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateProfileForm user={user} />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Suporte</CardTitle>
          <CardDescription>Precisa de ajuda? Entre em contato com nossa equipe de suporte</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="mailto:suporte@rbgmembers.com">Enviar E-mail para o Suporte</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
