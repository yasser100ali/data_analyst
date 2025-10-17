"use client";

import type { ChatRequestOptions, CreateMessage, Message } from "ai";
import { motion } from "framer-motion";
import { Paperclip, X } from "lucide-react";
import type React from "react";
import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";

import { cn, sanitizeUIMessages } from "@/lib/utils";

import { ArrowUpIcon, StopIcon } from "./icons";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
] as const;

const suggestedActions = [
  {
    title: "How does the Atlas Analyst Agent work?",
    label: "",
    action: "How does the Atlas Analyst Agent work?",
  },
  {
    title: "What could Atlas do that ChatGPT Data Analyst can't?",
    label: "",
    action: "What could Atlas do that ChatGPT Data Analyst can't?",
  },
];

export function MultimodalInput({
  chatId,
  input,
  setInput,
  isLoading,
  stop,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
}: {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    opts?: { contentOverride?: string; data?: any },
  ) => void;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPageDragOver, setIsPageDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wasPageDragOverRef = useRef(false);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    "input",
    "",
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || "";
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    adjustHeight();
  }, [input]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const isSupported = useCallback(
    (file: File) =>
      SUPPORTED_MIME_TYPES.includes(file.type as any) ||
      file.name.toLowerCase().endsWith(".csv") ||
      file.name.toLowerCase().endsWith(".xlsx") ||
      file.name.toLowerCase().endsWith(".xls"),
    []
  );

  const withinSize = (file: File) => {
    const max = file.type.includes("pdf") ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    return file.size <= max;
  };

  const filterValid = useCallback(
    (files: FileList | File[]) =>
      Array.from(files).filter((file) => {
        const okType = isSupported(file);
        if (!okType) {
          toast.error(
            `${file.name}: Unsupported file type. Please upload PDF, CSV, Excel (.xlsx, .xls), or text files.`
          );
        }
        const okSize = withinSize(file);
        if (!okSize) {
          const max =
            file.type.includes("pdf") ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
          toast.error(
            `${file.name}: File too large. Maximum size is ${max / (1024 * 1024)}MB.`
          );
        }
        return okType && okSize;
      }),
    [isSupported]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) setAttachments((prev) => [...prev, ...filterValid(files)]);
  };

  const handleAttachClick = () => fileInputRef.current?.click();

  const removeAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleRemoveAttachment = (
    e: React.MouseEvent,
    indexToRemove: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    removeAttachment(indexToRemove);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.types.includes("Files")) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setTimeout(() => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsDragOver(false);
      }
    }, 10);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsPageDragOver(false);
    setDragCounter(0);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setAttachments((prev) => [...prev, ...filterValid(files)]);
    }
  };

  // page-level drop overlay
  useEffect(() => {
    const onWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      setDragCounter((prev) => prev + 1);
      if (e.dataTransfer?.types.includes("Files")) {
        setIsPageDragOver(true);
        wasPageDragOverRef.current = true;
      }
    };
    const onWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const onWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      setDragCounter(0);
      setIsPageDragOver(false);
      const files = e.dataTransfer?.files;
      if (files && files.length > 0 && wasPageDragOverRef.current) {
        setAttachments((prev) => [...prev, ...filterValid(files)]);
      }
      wasPageDragOverRef.current = false;
    };
    const onWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setDragCounter((prev) => {
        const n = prev - 1;
        if (n <= 0) {
          setIsPageDragOver(false);
          wasPageDragOverRef.current = false;
          return 0;
        }
        return n;
      });
    };

    window.addEventListener("dragenter", onWindowDragEnter);
    window.addEventListener("dragover", onWindowDragOver);
    window.addEventListener("drop", onWindowDrop);
    window.addEventListener("dragleave", onWindowDragLeave);
    return () => {
      window.removeEventListener("dragenter", onWindowDragEnter);
      window.removeEventListener("dragover", onWindowDragOver);
      window.removeEventListener("drop", onWindowDrop);
      window.removeEventListener("dragleave", onWindowDragLeave);
    };
  }, [filterValid]);

  const submitForm = useCallback(() => {
    const processSubmit = async () => {
      // Early exit: nothing to send
      if (!input.trim() && attachments.length === 0) return;

      // Upload each file to Vercel Blob (client-side)
      let uploaded: Array<{ name: string; type: string; url: string }> = [];
      if (attachments.length > 0) {
        try {
          uploaded = await Promise.all(
            attachments.map(async (file) => {
              const blobUrl = process.env.BLOB_READ_WRITE_TOKEN;
              if (!blobUrl) {
                throw new Error("Vercel Blob URL is not configured");
              }

              const res = await fetch(blobUrl, {
                method: 'PUT',
                headers: {
                  'x-add-random-suffix': 'true',
                  'x-content-type': file.type,
                },
                body: file,
              }).then(r => r.json());

              return { name: file.name, type: file.type, url: res.url };
            })
          );
        } catch (err) {
          console.error(err);
          toast.error("One or more uploads failed.");
          return;
        }
      }

      // Send tiny payload to your backend (no base64)
      handleSubmit(undefined, {
        data: { attachments: uploaded },
      });

      // Reset UI
      setAttachments([]);
      if (fileInputRef.current) {
        try {
          fileInputRef.current.value = "";
        } catch {}
      }
      setLocalStorageInput("");
      resetHeight();
      if (width && width > 768) textareaRef.current?.focus();
    };

    processSubmit();
  }, [attachments, handleSubmit, input, setLocalStorageInput, width]);

  return (
    <div className="relative w-full flex flex-col gap-2">
      {isPageDragOver && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            setIsPageDragOver(false);
            setDragCounter(0);
            wasPageDragOverRef.current = false;
            if (files && files.length > 0) {
              setAttachments((prev) => [...prev, ...filterValid(files)]);
            }
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragCounter((prev) => {
              const n = prev - 1;
              if (n <= 0) {
                setIsPageDragOver(false);
                wasPageDragOverRef.current = false;
                return 0;
              }
              return n;
            });
          }}
        >
          <div className="rounded-2xl border-2 border-dashed border-foreground/40 px-6 py-4 text-sm">
            Drop files to attach
          </div>
        </div>
      )}

      {messages.length === 0 && (
        <div className="grid sm:grid-cols-2 gap-2 w-full mb-2">
          {suggestedActions.map((suggestedAction, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.05 * index }}
              key={`suggested-action-${suggestedAction.title}-${index}`}
              className={index > 1 ? "hidden sm:block" : "block"}
            >
              <Button
                variant="ghost"
                onClick={async () => {
                  append({
                    role: "user",
                    content: suggestedAction.action,
                  });
                }}
                className="text-left border rounded-xl px-4 py-3.5 text-sm w-full h-auto min-h-[60px] flex flex-col justify-start items-start overflow-hidden whitespace-normal"
              >
                <span className="font-medium break-words overflow-wrap-anywhere w-full leading-tight">
                  {suggestedAction.title}
                </span>
                {suggestedAction.label && (
                  <span className="text-muted-foreground break-words overflow-wrap-anywhere w-full leading-tight mt-1">
                    {suggestedAction.label}
                  </span>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {attachments.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {attachments.map((file, index) => (
            <motion.div
              key={`${file.name}-${file.size}-${index}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-muted p-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <span>{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full flex-shrink-0"
                onClick={(e) => handleRemoveAttachment(e, index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      <div
        className={cn(
          "relative flex w-full rounded-2xl border border-border/60 bg-muted/50 transition-all hover:border-border",
          isDragOver && "bg-primary/20 border-primary/40"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex w-full p-4 pr-14 pb-14">
          <Textarea
            ref={textareaRef}
            placeholder="Send a message..."
            value={input}
            onChange={handleInput}
            className={cn(
              "min-h-[80px] max-h-[calc(75dvh)] w-full resize-none border-none bg-transparent !text-base shadow-none focus-visible:ring-0 pt-0 pl-0 pr-0 pb-0",
              className
            )}
            rows={3}
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (isLoading) {
                  toast.error(
                    "Please wait for the model to finish its response!"
                  );
                } else {
                  submitForm();
                }
              }
            }}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-3 left-3 flex-shrink-0 h-9 w-9"
          onClick={handleAttachClick}
        >
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>

        {isLoading ? (
          <Button
            className="absolute bottom-3 right-3 rounded-full p-2 h-9 w-9 flex-shrink-0"
            onClick={(event) => {
              event.preventDefault();
              stop();
              setMessages((messages) => sanitizeUIMessages(messages));
            }}
          >
            <StopIcon size={16} />
          </Button>
        ) : (
          <Button
            className="absolute bottom-3 right-3 rounded-full p-2 h-9 w-9 flex-shrink-0"
            onClick={(event) => {
              event.preventDefault();
              submitForm();
            }}
            disabled={input.length === 0 && attachments.length === 0}
          >
            <ArrowUpIcon size={16} />
          </Button>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          multiple
          accept=".pdf,.txt,.csv,.xls,.xlsx,text/plain,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        />
      </div>
    </div>
  );
}
