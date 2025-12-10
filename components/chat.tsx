"use client";

import { useEffect } from "react";

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

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const isCallNotice = (message: Message) =>
    typeof message.content === "string" &&
    message.content.toLowerCase().includes("calling coding agent");

  const hasCallNotice = messages.some(
    (message: Message) => message.role === "assistant" && isCallNotice(message),
  );

  const lastUserIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === "user") return i;
    }
    return -1;
  })();

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
          <div key={message.id || index} className="flex flex-col gap-3">
            <PreviewMessage
              chatId={chatId}
              message={message}
              isLoading={isLoading && messages.length - 1 === index}
            />
            {isLoading && hasCallNotice && index === lastUserIndex && (
                <div className="mx-4 max-w-3xl md:mx-auto">
                  <div className="rounded-lg border border-border/60 bg-muted/70 px-4 py-3 text-sm font-mono text-muted-foreground">
                    Calling Coding Agent...
                  </div>
                </div>
              )}
          </div>
        ))}

        {isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && <ThinkingMessage />}

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
