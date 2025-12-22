"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin as LinkedinIcon, Mail } from "lucide-react";

const updates = [
  "Integrated web search tool with sources for real-time information.",
  "Chart generation capabilities with automatic visualization of analysis results.",
  "Deployed Data Analyst Agent in isolated E2B sandboxes for secure Python execution.",
  "Custom orchestration for seamless routing between chat and analysis tools.",
  "Support for PDF, Excel, and CSV file uploads via Vercel Blob.",
];

const roadmap = [
  "Live data retrieval from external APIs.",
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
          {updates.map((update, index) => (
            <motion.div
              key={index}
              className="rounded-md border border-cyan-900/40 bg-background/60 p-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
            >
              <p className="text-foreground/70 leading-relaxed">
                {update}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-mono tracking-wider text-cyan-300">
          UPCOMING
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
              className="inline-flex items-center gap-2 rounded-md border border-slate-700/70 bg-transparent px-4 py-2 text-neutral-100 hover:border-slate-400 hover:bg-slate-800/40 transition-colors"
            >
              <Mail className="h-4 w-4" />
              {copied ? "Copied!" : "yasser100ali@gmail.com"}
            </button>
            <a
              href="https://github.com/yasser100ali"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-slate-700/70 bg-transparent px-4 py-2 text-neutral-100 hover:border-slate-400 hover:bg-slate-800/40 transition-colors"
            >
              <Github className="h-4 w-4" />
              Github
            </a>
            <a
              href="https://linkedin.com/in/yasser-engineer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-slate-700/70 bg-transparent px-4 py-2 text-neutral-100 hover:border-slate-400 hover:bg-slate-800/40 transition-colors"
            >
              Connect on LinkedIn
            </a>
            <a
              href="https://yasser.engineer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-slate-700/70 bg-transparent px-4 py-2 text-neutral-100 hover:border-slate-400 hover:bg-slate-800/40 transition-colors"
            >
              <span className="font-mono">yasser.engineer</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

