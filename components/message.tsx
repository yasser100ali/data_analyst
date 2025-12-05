"use client";

import type { Message } from "ai";
import { motion } from "framer-motion";

import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { cn } from "@/lib/utils";
import { Weather } from "./weather";
import { CodeDisplay } from "./code-display";

// Extract code blocks from message content
const extractCodeBlocks = (content: string): { content: string; codeBlocks: string[] } => {
  const codeBlockRegex = /\[CODE_BLOCK\]\n([\s\S]*?)\n\[\/CODE_BLOCK\]/g;
  const codeBlocks: string[] = [];
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    codeBlocks.push(match[1]);
  }

  // Remove code block markers from content
  const cleanedContent = content.replace(codeBlockRegex, "").trim();

  return { content: cleanedContent, codeBlocks };
};

export const PreviewMessage = ({
  message,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
}) => {
  const { content, codeBlocks } = message.content 
    ? extractCodeBlocks(message.content as string)
    : { content: "", codeBlocks: [] };

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cn(
          "group-data-[role=user]/message:bg-primary group-data-[role=user]/message:text-primary-foreground flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
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

          {content && (
            <div className="flex flex-col gap-4">
              <Markdown>{content}</Markdown>
            </div>
          )}

          {codeBlocks.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              {codeBlocks.map((code, idx) => (
                <CodeDisplay key={idx} code={code} />
              ))}
            </div>
          )}

          {message.toolInvocations && message.toolInvocations.length > 0 && (
            <div className="flex flex-col gap-4">
              {message.toolInvocations.map((toolInvocation) => {
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === "result") {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      {toolName === "get_current_weather" ? (
                        <Weather weatherAtLocation={result} />
                      ) : (
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                      )}
                    </div>
                  );
                }
                return (
                  <div
                    key={toolCallId}
                    className={cn({
                      skeleton: ["get_current_weather"].includes(toolName),
                    })}
                  >
                    {toolName === "get_current_weather" ? <Weather /> : null}
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
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
