import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Ты профессиональный строительный ИИ ассистент компании TGRAF. Анализируешь риски, бюджеты, сроки, подрядчиков и строительные проекты.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    })

    return NextResponse.json({
      reply: completion.choices[0].message.content,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json({
      reply: "Ошибка подключения к ИИ",
    })
  }
}