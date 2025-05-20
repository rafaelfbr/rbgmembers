import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

// Rota para criar produtos de teste no banco de dados
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Esta rota só está disponível em ambiente de desenvolvimento" }, { status: 403 })
  }

  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Criar nicho de investimentos
    const { data: niche, error: nicheError } = await supabase
      .from("niches")
      .insert({
        name: "Investimentos",
        description: "Cursos e materiais sobre investimentos e finanças",
      })
      .select()
      .single()

    if (nicheError) {
      return NextResponse.json({ error: "Erro ao criar nicho", details: nicheError }, { status: 500 })
    }

    // Criar idioma português
    const { data: language, error: languageError } = await supabase
      .from("languages")
      .insert({
        name: "Português",
        code: "pt-BR",
      })
      .select()
      .single()

    if (languageError) {
      return NextResponse.json({ error: "Erro ao criar idioma", details: languageError }, { status: 500 })
    }

    // Criar produtos de teste
    const products = [
      {
        id: "37710ed6-2828-4a60-9495-52c81c59d73e",
        name: "Mercado de Ações no Brasil",
        description: "Conheça os principais conceitos de renda variável e o funcionamento dos mercados",
        cover_image:
          "https://s3.amazonaws.com/production.kirvano.com/products/b8fc4870-fef5-4790-8087-9264e73ce48c/cover-1747762339544.jpg",
        niche_id: niche.id,
        language_id: language.id,
        is_course: true,
        is_ebook: false,
        is_material: false,
      },
      {
        id: "201a28e2-de38-4bd4-8c56-3394a294f456",
        name: "Excel para Investidores",
        description: "O melhor curso para quem quer começar a investir e ainda aprender a gerenciar sua carteira.",
        cover_image:
          "https://s3.amazonaws.com/production.kirvano.com/products/c1897054-c6a2-453d-9723-bd98e24e96ca/cover-1747762339544.jpg",
        niche_id: niche.id,
        language_id: language.id,
        is_course: false,
        is_ebook: true,
        is_material: false,
      },
    ]

    // Inserir produtos
    const { data: createdProducts, error: productsError } = await supabase.from("products").insert(products).select()

    if (productsError) {
      return NextResponse.json({ error: "Erro ao criar produtos", details: productsError }, { status: 500 })
    }

    // Criar módulos e aulas para o curso
    if (createdProducts) {
      const courseId = "37710ed6-2828-4a60-9495-52c81c59d73e"

      // Criar módulos
      const modules = [
        {
          product_id: courseId,
          title: "Introdução ao Mercado de Ações",
          description: "Conceitos básicos sobre o mercado de ações",
          position: 1,
        },
        {
          product_id: courseId,
          title: "Análise Fundamentalista",
          description: "Como analisar empresas usando indicadores fundamentalistas",
          position: 2,
        },
      ]

      const { data: createdModules, error: modulesError } = await supabase.from("modules").insert(modules).select()

      if (modulesError) {
        return NextResponse.json({ error: "Erro ao criar módulos", details: modulesError }, { status: 500 })
      }

      // Criar aulas para cada módulo
      if (createdModules) {
        const lessons = [
          {
            module_id: createdModules[0].id,
            title: "O que são ações?",
            description: "Entenda o conceito básico de ações e como funcionam",
            video_url: "https://vimeo.com/76979871",
            position: 1,
            duration: 600, // 10 minutos
          },
          {
            module_id: createdModules[0].id,
            title: "Como funciona a Bolsa de Valores",
            description: "Entenda o funcionamento da B3 e como as negociações acontecem",
            video_url: "https://vimeo.com/76979871",
            position: 2,
            duration: 720, // 12 minutos
          },
          {
            module_id: createdModules[1].id,
            title: "Indicadores fundamentalistas",
            description: "Aprenda os principais indicadores para análise de empresas",
            video_url: "https://vimeo.com/76979871",
            position: 1,
            duration: 900, // 15 minutos
          },
        ]

        const { data: createdLessons, error: lessonsError } = await supabase.from("lessons").insert(lessons).select()

        if (lessonsError) {
          return NextResponse.json({ error: "Erro ao criar aulas", details: lessonsError }, { status: 500 })
        }

        // Criar materiais para as aulas
        if (createdLessons) {
          const materials = [
            {
              lesson_id: createdLessons[0].id,
              product_id: null,
              title: "Glossário de termos do mercado",
              description: "PDF com os principais termos utilizados no mercado de ações",
              file_url:
                "https://www.b3.com.br/data/files/48/56/93/C3/96E615107623A41592D828A8/Apostila_PQO_26_11_2018.pdf",
              file_type: "PDF",
            },
            {
              lesson_id: null,
              product_id: "201a28e2-de38-4bd4-8c56-3394a294f456",
              title: "Planilha de controle de investimentos",
              description: "Planilha Excel para controle da sua carteira de investimentos",
              file_url: "https://example.com/planilha.xlsx",
              file_type: "XLSX",
            },
          ]

          const { data: createdMaterials, error: materialsError } = await supabase
            .from("materials")
            .insert(materials)
            .select()

          if (materialsError) {
            return NextResponse.json({ error: "Erro ao criar materiais", details: materialsError }, { status: 500 })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Produtos de teste criados com sucesso",
      products: createdProducts,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao criar produtos de teste",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
