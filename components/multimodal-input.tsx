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
import { upload } from "@vercel/blob/client";

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

// File upload cache interface
interface CachedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  timestamp: number;
}

const CACHE_KEY = "atlas_file_upload_cache";
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Helper functions for file cache management
const getFileCache = (): Record<string, CachedFile> => {
  if (typeof window === "undefined") return {};
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
};

const setFileCache = (cache: Record<string, CachedFile>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn("Failed to save file cache:", err);
  }
};

const getCacheKey = (file: File): string => {
  return `${file.name}_${file.size}_${file.type}`;
};

const getCachedFileUrl = (file: File): CachedFile | null => {
  const cache = getFileCache();
  const key = getCacheKey(file);
  const cached = cache[key];
  
  if (!cached) return null;
  
  // Check if cache is expired
  const isExpired = Date.now() - cached.timestamp > CACHE_EXPIRY_MS;
  if (isExpired) {
    // Remove expired entry
    delete cache[key];
    setFileCache(cache);
    return null;
  }
  
  return cached;
};

const cacheFileUrl = (file: File, url: string) => {
  const cache = getFileCache();
  const key = getCacheKey(file);
  
  cache[key] = {
    name: file.name,
    size: file.size,
    type: file.type,
    url,
    timestamp: Date.now(),
  };
  
  setFileCache(cache);
};

// Clear expired cache entries on load
const cleanExpiredCache = () => {
  if (typeof window === "undefined") return;
  const cache = getFileCache();
  const now = Date.now();
  let hasChanges = false;
  
  Object.keys(cache).forEach((key) => {
    if (now - cache[key].timestamp > CACHE_EXPIRY_MS) {
      delete cache[key];
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    setFileCache(cache);
  }
};

const suggestedActions = [
  {
    title: "How does the Atlas Analyst Agent work?",
    label: "",
    action: "How does the Atlas Analyst Agent work?",
  },
  {
    title: "How is code executed in Atlas? Is it safe?",
    label: "",
    action: "Explain how code runs in Atlas and how safety is handled.",
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

  // Clean expired cache on component mount
  useEffect(() => {
    cleanExpiredCache();
  }, []);

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

  const resetHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, []);

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

      // Store input value and attachments before clearing (needed for append)
      const messageContent = input;
      const filesToUpload = [...attachments];

      // Clear UI immediately when user hits send
      setInput("");
      setAttachments([]);
      if (fileInputRef.current) {
        try {
          fileInputRef.current.value = "";
        } catch {}
      }
      setLocalStorageInput("");
      resetHeight();

      // Upload files - use Vercel Blob in production, local backend in dev
      let uploaded: Array<{ name: string; type: string; url: string }> = [];
      if (filesToUpload.length > 0) {
        try {
          // Check if we're in development mode (localhost)
          const isDev = typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1');
          
          console.log(`🔧 Upload mode: ${isDev ? 'Development (local backend)' : 'Production (Vercel Blob)'}`);
          
          if (isDev) {
            // Local backend upload for development (no caching needed)
            uploaded = await Promise.all(
              filesToUpload.map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/upload", {
                  method: "POST",
                  body: formData,
                });

                if (!response.ok) {
                  throw new Error("Upload failed");
                }

                const data = await response.json();
                return { name: data.name, type: data.type, url: data.url };
              })
            );
          } else {
            // Vercel Blob upload for production - with caching
            uploaded = await Promise.all(
              filesToUpload.map(async (file) => {
                // Check cache first
                const cached = getCachedFileUrl(file);
                if (cached) {
                  console.log(`✓ Using cached URL for ${file.name}`);
                  return { name: cached.name, type: cached.type, url: cached.url };
                }

                // Upload to Vercel Blob if not cached
                // Add timestamp to filename to avoid conflicts with existing blobs
                const timestamp = Date.now();
                const fileExtension = file.name.split('.').pop();
                const fileBaseName = file.name.replace(/\.[^/.]+$/, '');
                const uniqueFileName = `${fileBaseName}_${timestamp}.${fileExtension}`;
                
                console.log(`⬆ Uploading ${file.name} to Vercel Blob as ${uniqueFileName}...`);
                
                const blob = await upload(uniqueFileName, file, {
                  access: 'public',
                  handleUploadUrl: '/api/blob/upload',
                });

                // Cache the result with the original file info
                cacheFileUrl(file, blob.url);

                return { name: file.name, type: file.type, url: blob.url };
              })
            );
          }
        } catch (err) {
          console.error("Upload error:", err);
          // Log detailed error information
          if (err instanceof Error) {
            console.error("Error message:", err.message);
            console.error("Error stack:", err.stack);
          }
          toast.error(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}. Check console for details.`);
          return;
        }
      }

      // Send message with attachments using append
      // The attachments need to be in experimental_attachments format for the AI SDK
      await append(
        {
          role: "user",
          content: messageContent,
          experimental_attachments: uploaded.map(file => ({
            name: file.name,
            contentType: file.type,
            url: file.url,
          })),
        },
        {
          data: { attachments: uploaded },
        }
      );

      // Focus back on input after sending
      if (width && width > 768) textareaRef.current?.focus();
    };

    processSubmit();
  }, [attachments, append, input, setInput, setLocalStorageInput, width, fileInputRef, resetHeight]);

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
          "relative flex w-full rounded-xl border border-border/70 bg-background/80 backdrop-blur-sm transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/25 hover:border-border",
          isDragOver && "bg-primary/5 border-primary/50"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex w-full p-3.5 pr-14 pb-12">
          <Textarea
            ref={textareaRef}
            placeholder="Send a message..."
            value={input}
            onChange={handleInput}
            className={cn(
              "min-h-[64px] max-h-[45dvh] w-full resize-none border-none bg-transparent !text-[1.12rem] leading-7 font-sans shadow-none focus-visible:ring-0 pt-0 pl-0 pr-0 pb-0 placeholder:!text-[1rem]",
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
          className="absolute bottom-3 left-3 flex-shrink-0 h-9 w-9 rounded-lg border border-border/70 bg-transparent shadow-none hover:bg-border/20 transition-colors"
          onClick={handleAttachClick}
        >
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>

        {isLoading ? (
          <Button
            className="absolute bottom-3 right-3 rounded-lg p-0 h-10 w-10 flex-shrink-0 border border-border/70 bg-muted shadow-none hover:bg-muted/80 transition-colors"
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
            className="absolute bottom-3 right-3 rounded-lg p-0 h-10 w-10 flex-shrink-0 border border-border/70 bg-primary text-primary-foreground shadow-none hover:bg-primary/90 transition-colors"
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
