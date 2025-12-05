"use client";

import { useState } from "react";
import { Check, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeViewerProps {
  language: string;
  code: string;
}

export function CodeViewer({ language, code }: CodeViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl border bg-card text-card-foreground overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {language || "Code"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={copyToClipboard}
          >
            {isCopied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {isCopied ? "Copied" : "Copy"}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Hide Code
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Show Code
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="relative bg-zinc-950 p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-zinc-50">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

