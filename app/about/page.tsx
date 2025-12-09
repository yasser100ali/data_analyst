"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const updates = [
  {
    date: "December 8",
    description: [
      "Calling web_search tool from main orchestrator agent for significantly reduced latency.",
      "Updated markdown for better text formatting.",
      "Added sources section that generates upon web search tool call.",
    ],
  },
  {
    date: "December 7",
    description: "Added web_search tool successfully.",
  },
  {
    date: "December 4",
    description:
      "Data Analyst Agent now functioning safely. Code runs inside isolated E2B sandboxes with a persistent session. Next up: optimizing speed and improving the UI while the agent thinks.",
  },
  {
    date: "November 30",
    description:
      "Built custom orchestration on the OpenAI Responses API to route questions between the chat model and the analysis tools, with streamed responses from the orchestrator.",
  },
  {
    date: "November 29",
    description:
      "Built the Python execution sandbox in code_execution.py using the E2B code interpreter so generated code runs securely and reuses a shared DataAnalysisSession.",
  },
  {
    date: "November 28",
    description:
      "Enabled file uploads for PDF, Excel, and CSV. Files are stored in blob storage and exposed to the sandbox via signed URLs so the analysis layer can read them directly.",
  },
];

const roadmap = [
  "Ship a research_agent browsing prototype wired into the chat flow.",
  "Support live data retrieval and pass fetched data into the analysis sandbox.",
  "Expand coding_agent outputs with default matplotlib charts for quantitative answers.",
];

export default function AboutPage() {
  const email = "yasser100ali@gmail.com";
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-16 space-y-10">
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-mono font-bold tracking-wider text-foreground">
          ABOUT ATLAS
        </h1>
        <p className="text-foreground/70 leading-relaxed max-w-3xl">
          Atlas exists to make exploratory analysis feel instant: upload data,
          ask questions, and get grounded answers with runnable Python instead
          of static chat. The goal is a safe, iterative loop where you can see,
          edit, and rerun what the agent produces.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-mono tracking-wider text-cyan-300">
          MOTIVATION
        </h2>
        <p className="text-foreground/80 leading-relaxed">
          Traditional chat-first UIs often hallucinate or hide the work. Atlas
          keeps analysis transparent: every step is executed in a sandboxed
          Python runtime, streamed back to the UI, and tied to your files so you
          can quickly validate, correct, and iterate.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-mono tracking-wider text-cyan-300">
          TECH STACK
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-foreground/80 leading-relaxed">
          <li>
            Backend: FastAPI with a custom agentic architecture built on the
            OpenAI Responses API.
          </li>
          <li>
            Execution: E2B sandboxes isolate generated Python instead of running
            exec() locally, preventing arbitrary file/system access and keeping
            runs ephemeral and auditable.
          </li>
          <li>
            Frontend: Next.js App Router with TypeScript, Tailwind, framer-motion,
            and streaming UI components for chat and file uploads.
          </li>
          <li>
            Storage & assets: Vercel Blob for uploads, with signed URLs passed to
            the sandbox so analysis can read user data directly.
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-mono tracking-wider text-cyan-300">
          UPDATES
        </h2>
        <div className="space-y-3">
          {updates.map((update) => (
            <motion.div
              key={update.date}
              className="rounded-md border border-cyan-900/40 bg-background/60 p-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="font-semibold text-foreground">{update.date}</div>
              {Array.isArray(update.description) ? (
                <ul className="text-foreground/70 mt-2 leading-relaxed list-disc pl-5 space-y-1">
                  {update.description.map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-foreground/70 mt-1 leading-relaxed">
                  {update.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-mono tracking-wider text-cyan-300">
          GOALS · DEC 8–14
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-foreground/80 leading-relaxed">
          {roadmap.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-4 pt-6 border-t border-cyan-900/40">
        <h2 className="text-xl font-mono tracking-wider text-cyan-300">
          ABOUT THE CREATOR
        </h2>
        <div className="text-foreground/80 leading-relaxed space-y-3">
          <p>
            Hi, I am Yasser, a full stack AI engineer focused on agentic workflows and RAG
            systems for data teams. I love building practical and awesome AI projects. If you are interested
            in collaborating, please shoot an email.
          </p>
          <div className="flex flex-wrap gap-3 pt-2 text-sm">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-2 border border-neutral-800 bg-black px-4 py-2 text-neutral-100 uppercase tracking-wide hover:border-neutral-200 hover:bg-neutral-900 transition-colors"
            >
              {copied ? "Copied!" : "yasser100ali@gmail.com"}
            </button>
            <a
              href="https://linkedin.com/in/yasser-engineer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-neutral-800 bg-black px-4 py-2 text-neutral-100 uppercase tracking-wide hover:border-neutral-200 hover:bg-neutral-900 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/yasser100ali"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-neutral-800 bg-black px-4 py-2 text-neutral-100 uppercase tracking-wide hover:border-neutral-200 hover:bg-neutral-900 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://yasser.engineer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-neutral-800 bg-black px-4 py-2 text-neutral-100 uppercase tracking-wide hover:border-neutral-200 hover:bg-neutral-900 transition-colors"
            >
              Portfolio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

