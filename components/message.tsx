"use client";

import type { Message } from "ai";
import { motion } from "framer-motion";

import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { cn } from "@/lib/utils";
const OrbitSpinner = () => (
  <div className="relative h-7 w-7" aria-hidden="true">
    <div className="absolute inset-0 rounded-full border-2 border-muted-foreground/30" />
    <div className="absolute inset-[3px] rounded-full border-[3px] border-primary/70 border-t-transparent border-l-transparent animate-spin [animation-duration:1.1s]" />
    <div className="absolute inset-[9px] rounded-full bg-primary/80" />
  </div>
);

export const PreviewMessage = ({
  message,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
}) => {
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cn(
          "group-data-[role=user]/message:bg-muted group-data-[role=user]/message:text-foreground flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
        )}
      >
        <div className="flex flex-col gap-2 w-full">
          {message.experimental_attachments && message.experimental_attachments.length > 0 && (
            <div className="flex flex-row gap-2 flex-wrap">
              {message.experimental_attachments.map((attachment, idx) => (
                <PreviewAttachment
                  key={attachment.url || idx}
                  attachment={attachment}
                />
              ))}
            </div>
          )}

          {message.content && (
            <div className="flex flex-col gap-4">
              <Markdown>{message.content as string}</Markdown>
            </div>
          )}

          {message.toolInvocations && message.toolInvocations.length > 0 && (
            <div className="flex flex-col gap-4">
              {message.toolInvocations.map((toolInvocation) => {
                const { toolName, toolCallId, state } = toolInvocation;
                const agentLabel = toolName || "coding_agent";

                if (state === "result") {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      <pre>{JSON.stringify(result, null, 2)}</pre>
                    </div>
                  );
                }
                return (
                  <div
                    key={toolCallId}
                    className="flex items-center gap-3 text-muted-foreground"
                  >
                    <OrbitSpinner />
                    <span className="text-sm font-medium">
                      Calling {agentLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cn(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          },
        )}
      >
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-row items-center gap-3 text-muted-foreground">
            <span className="sr-only">Assistant is thinking</span>
            <OrbitSpinner />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
