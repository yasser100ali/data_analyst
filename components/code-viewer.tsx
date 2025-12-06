"use client";

import { useState } from "react";
import {
  Highlight,
  themes,
  type Language,
  type RenderProps,
  type Token,
} from "prism-react-renderer";
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
        <div className="relative overflow-x-auto">
          <Highlight
            theme={themes.vsDark}
            code={code || ""}
            language={(language || "tsx") as Language}
          >
            {({
              className,
              style,
              tokens,
              getLineProps,
              getTokenProps,
            }: RenderProps) => (
              <pre
                className={cn(
                  "m-0 bg-zinc-950 p-4 text-sm font-mono",
                  className,
                )}
                style={style}
              >
                {tokens.map((line: Token[], lineIndex: number) => (
                  <div
                    key={lineIndex}
                    {...getLineProps({ line })}
                    className="table-row"
                  >
                    <span className="table-cell select-none pr-4 text-right text-xs text-muted-foreground/70">
                      {lineIndex + 1}
                    </span>
                    <span className="table-cell">
                      {line.map((token: Token, tokenIndex: number) => (
                        <span
                          key={tokenIndex}
                          {...getTokenProps({ token })}
                        />
                      ))}
                    </span>
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      )}
    </div>
  );
}

