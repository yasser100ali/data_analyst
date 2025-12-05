"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Code } from "lucide-react";

export const CodeDisplay = ({ code }: { code: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-cyan-900/40 rounded-lg overflow-hidden bg-background/50 backdrop-blur">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-mono text-cyan-400 hover:bg-cyan-950/20 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <Code className="w-4 h-4" />
        <span>Show code</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-cyan-900/40">
              <div className="px-4 py-3 bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    Python
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(code);
                    }}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <pre className="text-xs font-mono overflow-x-auto">
                  <code className="text-foreground/90">{code}</code>
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

