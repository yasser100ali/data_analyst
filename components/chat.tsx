"use client";

import { useEffect, useMemo } from "react";

import type { Message } from "ai";
import { PreviewMessage, ThinkingMessage } from "@/components/message";
import { MultimodalInput } from "@/components/multimodal-input";
import { Overview } from "@/components/overview";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { useChat } from "ai/react";
import { toast } from "sonner";

export function Chat() {
  const chatId = "001";

  const backendUrl = process.env.NODE_ENV === "development" 
    ? "http://127.0.0.1:8000"
    : process.env.RAILWAY_BACKEND_URL || "https://dataanalyst-production-2e27.up.railway.app";

  const {
    messages,
    setMessages,
    data,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
  } = useChat({
    api: `${backendUrl}/api/chat`,
    maxSteps: 4,
    onError: (error: Error) => {
      if (error.message.includes("Too many requests")) {
        toast.error(
          "You are sending too many messages. Please try again later.",
        );
      }
    },
  });

  const codingAgentSignal = useMemo(() => {
    if (!data || data.length === 0) return null;

    for (let i = data.length - 1; i >= 0; i--) {
      const item = data[i] as any;
      if (item?.type === "agent_signal" && item?.key === "coding_agent") {
        if (item?.state === "set") return (item?.message as string) || "Calling coding agent...";
        if (item?.state === "clear") return null;
      }
    }

    return null;
  }, [data]);

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  // Lock page scroll while on chat view to avoid dual scrollbars
  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

  // Always jump to the bottom when a new user prompt is added
  useEffect(() => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") return;
    const endEl = messagesEndRef.current;
    if (endEl) {
      endEl.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, messagesEndRef]);

  return (
    <div className="flex flex-col min-w-0 h-[calc(100dvh-56px)] bg-background overflow-hidden">
      <div
        ref={messagesContainerRef}
        className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-auto pt-4"
      >
        {messages.length === 0 && <Overview />}

        {messages.map((message: Message, index: number) => (
          <PreviewMessage
            key={message.id || index}
            chatId={chatId}
            message={message}
            isLoading={isLoading && messages.length - 1 === index}
          />
        ))}

        {isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && <ThinkingMessage />}

        {isLoading && codingAgentSignal && (
          <div className="w-full mx-auto max-w-3xl px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary/70 animate-pulse" />
              <span>{codingAgentSignal}</span>
            </div>
          </div>
        )}

        <div
          ref={messagesEndRef}
          className="shrink-0 min-w-[24px] min-h-[24px]"
        />
      </div>

      <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <MultimodalInput
          chatId={chatId}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          messages={messages}
          setMessages={setMessages}
          append={append}
        />
      </form>
    </div>
  );
}
