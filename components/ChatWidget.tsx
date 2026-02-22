"use client";

import { useState, useRef, useEffect } from "react";
import { X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = { role: "user" | "assistant"; content: string };

export function ChatWidget() {
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uiMessages, setUiMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [uiMessages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setUiMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...uiMessages, { role: "user", content: text }] }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Ошибка запроса");
      }
      const data = await res.json();
      setUiMessages((prev) => [...prev, { role: "assistant", content: data.content || "Нет ответа." }]);
    } catch (e) {
      setUiMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Ошибка: ${e instanceof Error ? e.message : "Не удалось получить ответ."}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-[384px] h-[500px] bg-[#111827] border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-700 shrink-0">
              <span className="font-semibold text-white">TGRAF AI</span>
              <button
                type="button"
                aria-label="Закрыть чат"
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                onClick={() => setChatOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0"
            >
              {uiMessages.length === 0 && !loading && (
                <p className="text-sm text-gray-500">
                  Напишите вопрос — AI ответит на основе контекста платформы.
                </p>
              )}
              {uiMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`text-sm whitespace-pre-wrap ${msg.role === "assistant" ? "text-cyan-400" : "text-white"}`}
                >
                  {msg.content}
                </div>
              ))}
              {loading && (
                <div className="text-gray-400 text-sm flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  AI думает...
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-700 flex gap-2 shrink-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Спросите TGRAF AI..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#0B1220] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-sm"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 rounded-xl bg-cyan-400 text-black font-medium hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Отправить
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!chatOpen && (
        <motion.button
          type="button"
          aria-label="Открыть чат TGRAF AI"
          onClick={() => setChatOpen(true)}
          className="rounded-full bg-cyan-400 text-black w-16 h-16 shadow-2xl flex items-center justify-center hover:bg-cyan-300 transition-colors glow-accent"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="w-7 h-7" />
        </motion.button>
      )}
    </div>
  );
}
