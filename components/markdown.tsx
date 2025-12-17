import { CodeViewer } from "./code-viewer";
import Link from "next/link";
import React, { memo, useMemo } from "react";
import type { HTMLAttributes } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

/**
 * Normalizes different LaTeX formats into standard $ and $$ delimiters
 * for remark-math to process correctly.
 */
const normalizeMathMarkdown = (input: string): string => {
  if (!input) return "";
  let output = input;

  // 1. Convert display math \[ ... \] to $$ ... $$
  output = output.replace(/\\\[([\s\S]+?)\\\]/g, (_, inner) => {
    return `$$\n${inner.trim()}\n$$`;
  });

  // 2. Convert inline math \( ... \) to $ ... $
  output = output.replace(/\\\(([\s\S]+?)\\\)/g, (_, inner) => {
    return `$${inner.trim()}$`;
  });

  // 3. Ensure distinct block equations (wrapped in $$) are separated by newlines
  output = output.replace(/([^\n])\s*(\$\$[\s\S]+?\$\$)/g, "$1\n\n$2");

  return output;
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  
  // Clean and prepare the content before passing to the parser
  const content = useMemo(() => {
    let str = children || "";

    // 1. Handle literal string "\n" (common in LLM JSON responses)
    str = str.replace(/\\n/g, "\n");

    // 2. Fix Formatting: Ensure Headers (##) and Rules (---) are on their own lines
    // Forces double newline before headers/rules if they are stuck to previous text
    str = str.replace(/([^\n])\s*\n\s*(#{1,6}\s|---|___)/g, "$1\n\n$2");
    
    // 3. Fix Tables (LLM often concatenates rows): turn `| ... | | ... |` into new rows
    // Heuristic: when a pipe is immediately followed by another pipe (maybe with spaces),
    // treat that as the start of a new row.
    str = str.replace(/\|\s*\|\s*(?=[^\n|])/g, "|\n|");

    // 3. Fix Tables: Remove blank lines between table rows.
    // In Markdown, a blank line breaks the table. We merge them back.
    // Finds: Pipe -> Newlines -> Pipe, and reduces to single newline.
    str = str.replace(/(\|[ \t]*)\n{2,}([ \t]*\|)/g, "$1\n$2");

    // 4. Remove ANSI color codes
    str = str.replace(/\x1b\[[0-9;]*m/g, "");

    // 5. Normalize Math Delimiters
    str = normalizeMathMarkdown(str);

    return str;
  }, [children]);

  const components: Partial<Components> = {
    // @ts-expect-error - types for code block handling
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-([\w-]+)/.exec(className || "");
      const codeContent = String(children).replace(/\n$/, "");

      // Handle python-exec: code with execution output
      if (!inline && match && match[1] === "python-exec") {
        // Split on delimiter to separate code from output
        const delimiter = "\n---OUTPUT---\n";
        let parts = codeContent.split(delimiter);
        const code = (parts[0] || "").trim();
        const output = (parts[1] || "").trim();
        return (
          <CodeViewer
            language="python"
            code={code}
            output={output}
          />
        );
      }

      if (!inline && match && match[1] === "python") {
        return (
          <CodeViewer
            language={match[1]}
            code={codeContent}
          />
        );
      }
      
      return !inline ? (
        <pre
          {...(props as HTMLAttributes<HTMLPreElement>)}
          className={`${className ?? ""} text-sm w-full overflow-x-auto font-mono my-3`}
        >
          <code className={match ? match[1] : "text-pink-600 dark:text-pink-400"}>{children}</code>
        </pre>
      ) : (
        <code
          className={`${className} text-sm font-mono text-pink-600 dark:text-pink-400`}
          {...props}
        >
          {children}
        </code>
      );
    },
    ol: ({ node, children, ...props }) => {
      return (
        <ol className="list-decimal list-outside ml-5 mb-4 space-y-1" {...props}>
          {children}
        </ol>
      );
    },
    li: ({ node, children, ...props }) => {
      return (
        <li className="pl-1" {...props}>
          {children}
        </li>
      );
    },
    ul: ({ node, children, ...props }) => {
      return (
        <ul className="list-disc list-outside ml-5 mb-4 space-y-1" {...props}>
          {children}
        </ul>
      );
    },
    strong: ({ node, children, ...props }) => {
      return (
        <span className="font-semibold text-foreground" {...props}>
          {children}
        </span>
      );
    },
    a: ({ node, children, ...props }) => {
      return (
        // @ts-expect-error - next/link types
        <Link
          className="text-blue-500 hover:underline break-all font-medium"
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
        <h1 className="text-3xl font-bold mt-8 mb-4 border-b pb-2" {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ node, children, ...props }) => {
      return (
        <h2 className="text-2xl font-bold mt-8 mb-4" {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ node, children, ...props }) => {
      return (
        <h3 className="text-xl font-bold mt-6 mb-3" {...props}>
          {children}
        </h3>
      );
    },
    h4: ({ node, children, ...props }) => {
      return (
        <h4 className="text-lg font-bold mt-6 mb-3" {...props}>
          {children}
        </h4>
      );
    },
    table: ({ node, children, ...props }) => {
      return (
        <div className="w-full overflow-x-auto mt-4 mb-4 rounded-lg border border-border">
          <table className="w-full text-sm text-left" {...props}>
            {children}
          </table>
        </div>
      );
    },
    thead: ({ node, children, ...props }) => {
      return (
        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold" {...props}>
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
        <tr className="bg-background hover:bg-muted/50 transition-colors" {...props}>
          {children}
        </tr>
      );
    },
    th: ({ node, children, ...props }) => {
      return (
        <th className="px-4 py-3 whitespace-nowrap" {...props}>
          {children}
        </th>
      );
    },
    td: ({ node, children, ...props }) => {
      return (
        <td className="px-4 py-3 align-top" {...props}>
          {children}
        </td>
      );
    },
    p: ({ node, children, ...props }) => {
      return (
        <p className="mb-4 leading-7 text-foreground last:mb-0" {...props}>
          {children}
        </p>
      );
    },
    blockquote: ({ node, children, ...props }) => {
      return (
        <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-muted-foreground bg-muted/20 py-2 pr-2 rounded-r" {...props}>
          {children}
        </blockquote>
      );
    },
    hr: ({ node, ...props }) => {
      return <hr className="my-8 border-border" {...props} />;
    },
  };

  return (
    <div className="max-w-full break-words text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          [rehypeKatex, {
            strict: false,
            trust: true,
            throwOnError: false,
            output: 'html'
          }]
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);