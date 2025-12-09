"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SourceItem {
  url: string;
  title?: string | null;
}

interface SourcesViewerProps {
  sources: SourceItem[];
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
          <div className="flex flex-col gap-3">
            {sources.map((source, idx) => {
              const url = source.url;
              let host = url;
              try {
                const u = new URL(url);
                host = u.hostname.replace(/^www\./, "");
              } catch {
                // keep original url if parsing fails
              }
              const cleanPathTitle = () => {
                try {
                  const u = new URL(url);
                  const parts = u.pathname.split("/").filter(Boolean);
                  if (!parts.length) return null;
                  const last = decodeURIComponent(parts[parts.length - 1]);
                  const cleaned = last.replace(/[-_]+/g, " ").trim();
                  return cleaned ? cleaned : null;
                } catch {
                  return null;
                }
              };
              const title = (source.title && source.title.trim()) || cleanPathTitle() || host;
              return (
                <div
                  key={`${url}-${idx}`}
                  className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 shadow-sm"
                >
                  <div className="text-xs text-muted-foreground mb-1">{host}</div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors block"
                  >
                    {title}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

