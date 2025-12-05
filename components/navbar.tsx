"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { GitIcon } from "./icons";
import Link from "next/link";
import { motion } from "framer-motion";

export const Navbar = () => {
  const [showUpdates, setShowUpdates] = useState(false);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="px-4 py-3 flex flex-row gap-2 justify-between items-center bg-background border-b border-cyan-900/20">
      {/* Left: Logo with refresh */}
      <motion.button
        onClick={handleRefresh}
        className="flex items-center gap-1 font-mono font-bold text-sm tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-foreground/40">&lt;</span>
        <span>ATLAS</span>
        <span className="text-foreground/40">/&gt;</span>
      </motion.button>

      {/* Right: Updates + View Source */}
      <div className="relative flex items-center gap-2">
        <Button
          variant="outline"
          className="text-xs font-mono"
          onClick={() => setShowUpdates((prev) => !prev)}
        >
          UPDATES
        </Button>

        <Link href="https://github.com/yasser100ali/data_analyst">
          <Button variant="outline" className="text-xs font-mono">
            <GitIcon /> SOURCE
          </Button>
        </Link>

        {showUpdates && (
          <div className="absolute right-0 top-10 z-50 w-80 rounded-md border border-cyan-900/40 bg-background/95 backdrop-blur shadow-lg p-3 text-xs font-mono space-y-3">
            <div>
              <div className="font-semibold text-foreground">December 4</div>
              <p className="text-foreground/70">
                Data Analyst Agent now functioning safely. Code is executed in a
                safe environment (E2B provides isolated cloud sandboxes for running
                untrusted code). Next step: optimize speed and improve the UI while
                the user waits for the agent to respond.
              </p>
            </div>
            <div>
              <div className="font-semibold text-foreground">November 30</div>
              <p className="text-foreground/70">
                Building agent orchestration using the OpenAI Agents SDK to
                route user questions between the chat model and the data
                analysis tools, with streaming responses from the orchestrator.
              </p>
            </div>
            <div>
              <div className="font-semibold text-foreground">November 29</div>
              <p className="text-foreground/70">
                Created the sandbox for code execution in{" "}
                <code>code_execution.py</code> using the E2B code interpreter to
                run generated Python securely and reuse a persistent{" "}
                <code>DataAnalysisSession</code> across multiple analyses.
              </p>
            </div>
            <div>
              <div className="font-semibold text-foreground">November 28</div>
              <p className="text-foreground/70">
                File uploads now working: users can upload PDF, Excel, or CSV
                files, which are stored in Blob storage and exposed to the
                analysis layer via signed URLs so the sandbox can read them
                directly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
