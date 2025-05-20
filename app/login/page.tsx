import { LoginForm } from "./login-form"
import Image from "next/image"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 md:p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Image src="https://i.imgur.com/PLb0F2n.png" alt="RBG Members Logo" width={120} height={120} className="h-20 w-auto" />
          <p className="text-center text-gray-600">Acesse sua área de membros exclusiva</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
