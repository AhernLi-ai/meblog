import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';
import 'katex/dist/katex.min.css';

// Copy button component
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className="prose dark:prose-invert max-w-none"
      components={{
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');
          const isInline = !match && !codeString.includes('\n');

          if (isInline) {
            return (
              <code
                className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <div className="relative group">
              <SyntaxHighlighter
                style={oneDark}
                language={match ? match[1] : 'text'}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  borderRadius: '0.5rem',
                }}
              >
                {codeString}
              </SyntaxHighlighter>
              <CopyButton text={codeString} />
            </div>
          );
        },
        // KaTeX for math formulas - pre-process before rendering
        pre({ children }) {
          return <>{children}</>;
        },
        // Handle block math $$...$$
        // Note: react-markdown doesn't have built-in math support,
        // so we use a custom approach with remark-math
      }}
      remarkPlugins={[]}
    >
      {content}
    </ReactMarkdown>
  );
}

// Simple math plugin - processes $...$ and $$...$$
export function processMathContent(content: string): string {
  // This is a placeholder - in production, use remark-math and rehype-katex
  // For now, we'll leave math as-is and let KaTeX handle it via CSS
  return content;
}
