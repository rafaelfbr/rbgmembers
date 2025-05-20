import { type NextRequest, NextResponse } from "next/server"

// Rota para testar o webhook (apenas em ambiente de desenvolvimento)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Esta rota só está disponível em ambiente de desenvolvimento" }, { status: 403 })
  }

  // Exemplo de payload que seria enviado pela plataforma de pagamento
  const testPayload = {
    event: "SALE_APPROVED",
    event_description: "Compra aprovada",
    checkout_id: "Q8J1N6K3",
    sale_id: "D2RP8RQ7",
    payment_method: "CREDIT_CARD",
    total_price: "R$ 169,80",
    type: "ONE_TIME",
    status: "APPROVED",
    created_at: "2025-05-20 14:32:19",
    customer: {
      name: "João da Silva",
      document: "23875090127",
      email: "exemplo@email.com",
      phone_number: "5511987654321",
    },
    payment: {
      method: "CREDIT_CARD",
      brand: "visa",
      installments: 1,
      finished_at: "2025-05-20 14:32:34",
    },
    products: [
      {
        id: "37710ed6-2828-4a60-9495-52c81c59d73e",
        name: "Mercado de Ações no Brasil",
        offer_id: "7770e395-ea53-43ea-9c98-07be9c607dce",
        offer_name: "Mercado de Ações no Brasil",
        description: "Conheça os principais conceitos de renda variável e o funcionamento dos mercados",
        price: "R$ 119,90",
        photo:
          "https://s3.amazonaws.com/production.kirvano.com/products/b8fc4870-fef5-4790-8087-9264e73ce48c/cover-1747762339544.jpg",
        is_order_bump: false,
      },
      {
        id: "201a28e2-de38-4bd4-8c56-3394a294f456",
        name: "Excel para Investidores",
        offer_id: "25ec0384-bf31-47a3-8c32-8d10b102093a",
        offer_name: "Excel para Investidores",
        description: "O melhor curso para quem quer começar a investir e ainda aprender a gerenciar sua carteira.",
        price: "R$ 49,90",
        photo:
          "https://s3.amazonaws.com/production.kirvano.com/products/c1897054-c6a2-453d-9723-bd98e24e96ca/cover-1747762339544.jpg",
        is_order_bump: true,
      },
    ],
    utm: {
      src: "google",
      utm_source: "broadcast",
      utm_medium: "email",
      utm_campaign: "register",
      utm_term: "codes",
      utm_content: "link",
    },
  }

  // Simular uma chamada para o webhook
  const webhookUrl = new URL("/api/webhooks", request.url)

  try {
    const response = await fetch(webhookUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer Ragnarok92#`,
      },
      body: JSON.stringify(testPayload),
    })

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: "Teste de webhook executado",
      status: response.status,
      result,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao testar webhook",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
