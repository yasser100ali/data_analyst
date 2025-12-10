"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Code2 } from "lucide-react";

import type { Message } from "ai";
import { PreviewMessage, ThinkingMessage } from "@/components/message";
import { MultimodalInput } from "@/components/multimodal-input";
import { Overview } from "@/components/overview";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { useChat } from "ai/react";
import { toast } from "sonner";

const AgentCallBanner = ({ agentName }: { agentName: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.2 }}
    className="mx-4 mb-1 md:mx-auto md:max-w-3xl"
  >
    <div className="relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-r from-slate-900/70 via-slate-800/70 to-slate-900/70 shadow-sm">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ backgroundPosition: ["-200% center", "200% center"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 100%" }}
      />
      <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.14),transparent_30%)]" />
      <div className="relative flex items-center gap-3 px-4 py-3 text-sm text-foreground/90">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Code2 className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium">Calling {agentName}</span>
          <span className="text-xs text-muted-foreground">
            Spinning up the coding runtime...
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2], y: [0, -1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            {"{ }"}
          </motion.span>
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2], y: [0, -1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.25 }}
          >
            &#x2038;
          </motion.span>
        </div>
      </div>
    </div>
  </motion.div>
);

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

  const stripCallNotice = (content: string) =>
    content.replace(/^\s*calling coding agent\.{0,3}\s*/i, "").trimStart();

  const cleanedMessages: Message[] = messages.map((message: Message) => {
    if (typeof message.content === "string" && isCallNotice(message)) {
      return { ...message, content: stripCallNotice(message.content) };
    }
    return message;
  });

  const showAgentBanner =
    isLoading &&
    messages.some(
      (message: Message) => message.role === "assistant" && isCallNotice(message),
    );

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
      {showAgentBanner && <AgentCallBanner agentName="coding agent" />}

      <div
        ref={messagesContainerRef}
        className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-auto pt-4"
      >
        {messages.length === 0 && <Overview />}

        {cleanedMessages.map((message: Message, index: number) => (
          <PreviewMessage
            key={message.id}
            chatId={chatId}
            message={message}
            isLoading={isLoading && cleanedMessages.length - 1 === index}
          />
        ))}

        {isLoading &&
          cleanedMessages.length > 0 &&
          cleanedMessages[cleanedMessages.length - 1].role === "user" && <ThinkingMessage />}

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
