"use client"

import { useState } from "react"

export default function AssistantPage() {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!message) return

    setLoading(true)

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    })

    const data = await res.json()
    setResponse(data.reply)
    setLoading(false)
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">ИИ-помощник TGRAF AI</h1>

      <textarea
        className="w-full p-4 rounded bg-black border border-gray-700 mb-4"
        rows={4}
        placeholder="Введите ваш запрос..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={sendMessage}
        className="px-6 py-3 bg-orange-600 rounded hover:bg-orange-700"
      >
        {loading ? "Анализ..." : "Отправить"}
      </button>

      {response && (
        <div className="mt-8 p-6 bg-black border border-gray-700 rounded">
          <h2 className="text-xl mb-3">Ответ ИИ:</h2>
          <p className="whitespace-pre-line">{response}</p>
        </div>
      )}
    </div>
  )
}