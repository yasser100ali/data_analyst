"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SourcesViewerProps {
  sources: string[];
  title?: string;
  className?: string;
}

export function SourcesViewer({ sources, title = "Sources", className }: SourcesViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className={cn("my-3 rounded-xl border bg-card text-card-foreground overflow-hidden", className)}>
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b">
        <span className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
          {title}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs gap-1"
          onClick={() => setIsExpanded((v) => !v)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Hide
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              Show
            </>
          )}
        </Button>
      </div>

      <motion.div
        initial={false}
        animate={isExpanded ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="relative overflow-hidden"
        aria-hidden={!isExpanded}
        style={{ pointerEvents: isExpanded ? "auto" : "none" }}
      >
        <div className="p-4 space-y-2">
          <ul className="list-disc list-outside pl-5 space-y-1">
            {sources.map((url, idx) => {
              let label = url;
              try {
                const u = new URL(url);
                label = u.hostname.replace(/^www\./, "");
              } catch {
                // keep original url if parsing fails
              }
              return (
                <li key={`${url}-${idx}`} className="break-words">
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

