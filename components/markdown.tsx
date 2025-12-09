import { CodeViewer } from "./code-viewer";
import Link from "next/link";
import React, { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const normalizeMathMarkdown = (input: string): string => {
  let output = input;
  
  // Convert block lines like: [ ...latex... ] → $$ ... $$ so KaTeX renders
  output = output.replace(/^\s*\[(.+?)\]\s*$/gm, (fullMatch, inner) => {
    const content = String(inner).trim();
    if (/\\[a-zA-Z]+|[\^_]/.test(content)) {
      return `$$\n${content}\n$$`;
    }
    return fullMatch;
  });
  
  // Convert escaped TeX display delimiters \[ ... \] → $$ ... $$
  output = output.replace(/\\\[(.+?)\\\]/gs, (_m, inner) => `$$\n${inner}\n$$`);
  
  // Convert escaped inline delimiters \( ... \) → $...$
  output = output.replace(/\\\((.+?)\\\)/g, (_m, inner) => `$${inner}$`);
  
  // Handle lines that are primarily LaTeX (start with backslash commands, contain math symbols)
  // but aren't already wrapped in $ delimiters
  output = output.replace(/^([^\$\n]*)(\\[a-zA-Z]+[^\n]+)$/gm, (fullMatch, prefix, latexPart) => {
    // Skip if already in math mode or if it's part of a code block
    if (fullMatch.includes('$') || fullMatch.includes('```')) {
      return fullMatch;
    }
    // If the line starts with LaTeX commands or contains significant LaTeX, wrap it
    if (/^\\[a-zA-Z]+/.test(latexPart.trim()) || /\\[a-zA-Z]+.*[\\_{}\^]/.test(latexPart)) {
      return prefix + '$' + latexPart.trim() + '$';
    }
    return fullMatch;
  });
  
  return output;
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  // Strip ANSI color codes and other formatting artifacts that might come from AI responses
  const cleanedChildren = React.useMemo(() => {
    let cleaned = children;
    // Remove ANSI color codes (e.g., \x1b[31m for red)
    cleaned = cleaned.replace(/\x1b\[[0-9;]*m/g, '');
    // Remove HTML color tags if any
    cleaned = cleaned.replace(/<span[^>]*color[^>]*>|<\/span>/gi, '');
    cleaned = cleaned.replace(/<font[^>]*>|<\/font>/gi, '');
    return cleaned;
  }, [children]);

  const components: Partial<Components> = {
    // @ts-expect-error
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      if (!inline && match && match[1] === "python") {
        return (
          <CodeViewer
            language={match[1]}
            code={String(children).replace(/\n$/, "")}
          />
        );
      }
      return !inline && match ? (
        // @ts-expect-error
        <pre
          {...props}
          className={`${className} text-sm max-w-full overflow-x-auto bg-zinc-100 p-3 rounded-lg mt-2 dark:bg-zinc-800`}
        >
          <code className={match[1]}>{children}</code>
        </pre>
      ) : (
        <code
          className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
          {...props}
        >
          {children}
        </code>
      );
    },
    ol: ({ node, children, ...props }) => {
      return (
        <ol className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ol>
      );
    },
    li: ({ node, children, ...props }) => {
      return (
        <li className="py-1" {...props}>
          {children}
        </li>
      );
    },
    ul: ({ node, children, ...props }) => {
      return (
        <ul className="list-disc list-outside ml-4" {...props}>
          {children}
        </ul>
      );
    },
    strong: ({ node, children, ...props }) => {
      return (
        <span className="font-semibold" {...props}>
          {children}
        </span>
      );
    },
    a: ({ node, children, ...props }) => {
      return (
        // @ts-expect-error
        <Link
          className="text-blue-500 hover:underline break-all"
          target="_blank"
          rel="noreferrer"
          {...props}
        >
          {children}
        </Link>
      );
    },
    h1: ({ node, children, ...props }) => {
      return (
        <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ node, children, ...props }) => {
      return (
        <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ node, children, ...props }) => {
      return (
        <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h3>
      );
    },
    h4: ({ node, children, ...props }) => {
      return (
        <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
          {children}
        </h4>
      );
    },
    h5: ({ node, children, ...props }) => {
      return (
        <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
          {children}
        </h5>
      );
    },
    h6: ({ node, children, ...props }) => {
      return (
        <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
          {children}
        </h6>
      );
    },
    table: ({ node, children, ...props }) => {
      return (
        <div className="w-[80dvw] md:max-w-[720px] overflow-x-auto mt-2 rounded-lg ring-1 ring-border">
          <table className="w-full text-sm" {...props}>
            {children}
          </table>
        </div>
      );
    },
    thead: ({ node, children, ...props }) => {
      return (
        <thead className="bg-muted/60" {...props}>
          {children}
        </thead>
      );
    },
    tbody: ({ node, children, ...props }) => {
      return (
        <tbody className="divide-y divide-border" {...props}>
          {children}
        </tbody>
      );
    },
    tr: ({ node, children, ...props }) => {
      return (
        <tr className="even:bg-muted/30 hover:bg-muted/40" {...props}>
          {children}
        </tr>
      );
    },
    th: ({ node, children, ...props }) => {
      return (
        <th className="text-left font-medium px-3 py-2 whitespace-nowrap border-b border-border" {...props}>
          {children}
        </th>
      );
    },
    td: ({ node, children, ...props }) => {
      return (
        <td className="px-3 py-2 align-top border-b border-border" {...props}>
          {children}
        </td>
      );
    },
    p: ({ node, children, ...props }) => {
      return (
        <p className="mb-4 leading-7 text-foreground" {...props}>
          {children}
        </p>
      );
    },
    em: ({ node, children, ...props }) => {
      return (
        <em className="italic text-foreground" {...props}>
          {children}
        </em>
      );
    },
    del: ({ node, children, ...props }) => {
      return (
        <del className="line-through text-foreground" {...props}>
          {children}
        </del>
      );
    },
    blockquote: ({ node, children, ...props }) => {
      return (
        <blockquote className="border-l-4 border-muted pl-4 italic my-4 text-muted-foreground" {...props}>
          {children}
        </blockquote>
      );
    },
    hr: ({ node, ...props }) => {
      return <hr className="my-8 border-border" {...props} />;
    },
  };

  const normalized = React.useMemo(() => normalizeMathMarkdown(cleanedChildren), [cleanedChildren]);

  return (
    <div className="max-w-full break-words text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          [rehypeKatex, {
            strict: false,
            trust: true,
            throwOnError: false,
            errorColor: 'inherit',
            output: 'html'
          }]
        ]}
        components={components}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
