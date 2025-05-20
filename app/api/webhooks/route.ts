import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verificar a autenticação do webhook (você deve implementar sua própria lógica de segurança)
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extrair o token
    const token = authHeader.split(" ")[1]

    // Verificar o token (implemente sua própria lógica)
    // Por exemplo, comparar com um valor armazenado em uma variável de ambiente
    if (token !== process.env.WEBHOOK_SECRET && token !== "Ragnarok92#") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Processar o payload do webhook
    const payload = await request.json()

    // Verificar se o status é "APPROVED"
    if (!payload.status || payload.status !== "APPROVED") {
      console.log("Webhook ignorado: status não é APPROVED", payload.status)
      return NextResponse.json({
        success: false,
        message: "Webhook ignorado: status não é APPROVED",
      })
    }

    // Registrar o webhook no banco de dados
    const { data: webhook, error: webhookError } = await supabase
      .from("webhooks")
      .insert({
        source: "plataforma_pagamento",
        event_type: payload.event || "unknown",
        payload,
        processed: false,
      })
      .select()
      .single()

    if (webhookError) {
      console.error("Erro ao registrar webhook:", webhookError)
      return NextResponse.json({ error: "Failed to register webhook" }, { status: 500 })
    }

    // Extrair dados do cliente
    const { customer, products } = payload

    if (!customer || !customer.email) {
      throw new Error("Dados do cliente incompletos")
    }

    // Processar a compra
    await processNewPurchase(supabase, customer, products)

    // Marcar webhook como processado
    await supabase.from("webhooks").update({ processed: true }).eq("id", webhook.id)

    return NextResponse.json({
      success: true,
      message: "Webhook processado com sucesso",
    })
  } catch (error: any) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

async function processNewPurchase(supabase: any, customer: any, products: any[]) {
  const { name, email } = customer

  if (!email) {
    throw new Error("Email não fornecido")
  }

  // Verificar se o usuário existe
  let { data: user, error: userError } = await supabase.from("profiles").select("id").eq("email", email).single()

  if (userError) {
    // Usuário não existe, criar um novo usuário
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        source: "webhook",
        name: name,
      },
    })

    if (authError) {
      throw new Error("Erro ao criar usuário: " + authError.message)
    }

    // Verificar se o perfil foi criado automaticamente
    const { data: newProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", authUser.user.id)
      .single()

    if (profileError) {
      // Criar perfil manualmente
      const { error: insertError } = await supabase.from("profiles").insert({
        id: authUser.user.id,
        email,
        full_name: name,
      })

      if (insertError) {
        throw new Error("Erro ao criar perfil: " + insertError.message)
      }
    } else {
      // Atualizar o nome no perfil
      await supabase.from("profiles").update({ full_name: name }).eq("id", authUser.user.id)
    }

    user = { id: authUser.user.id }
  }

  // Processar cada produto comprado
  for (const product of products) {
    // Verificar se o produto existe no nosso banco
    const { data: existingProduct, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", product.id)
      .single()

    if (productError) {
      console.log(`Produto ${product.id} não encontrado no banco de dados, ignorando`)
      continue
    }

    // Verificar se o usuário já tem acesso ao produto
    const { data: existingAccess, error: accessError } = await supabase
      .from("user_products")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .single()

    if (!existingAccess) {
      // Conceder acesso ao produto
      const { error: grantError } = await supabase.from("user_products").insert({
        user_id: user.id,
        product_id: product.id,
        access_granted_at: new Date().toISOString(),
      })

      if (grantError) {
        throw new Error(`Erro ao conceder acesso ao produto ${product.id}: ${grantError.message}`)
      }
    }
  }
}
