import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';
import 'katex/dist/katex.min.css';

// Generate slug for heading IDs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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
      className="max-w-none"
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
      components={{
        h1({ children, ...props }) {
          const text = String(children);
          const id = slugify(text);
          return <h1 id={id} className="text-3xl font-bold mb-4 mt-8 first:mt-0 text-gray-900 dark:text-white" {...props}>{children}</h1>;
        },
        h2({ children, ...props }) {
          const text = String(children);
          const id = slugify(text);
          return <h2 id={id} className="text-2xl font-bold mb-3 mt-8 first:mt-0 text-gray-900 dark:text-white" {...props}>{children}</h2>;
        },
        h3({ children, ...props }) {
          const text = String(children);
          const id = slugify(text);
          return <h3 id={id} className="text-xl font-semibold mb-2 mt-6 first:mt-0 text-gray-900 dark:text-white" {...props}>{children}</h3>;
        },
        h4({ children, ...props }) {
          const text = String(children);
          const id = slugify(text);
          return <h4 id={id} className="text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-white" {...props}>{children}</h4>;
        },
        ul({ children, ...props }) {
          return <ul className="list-disc list-inside space-y-1 my-4 text-gray-700 dark:text-gray-300" {...props}>{children}</ul>;
        },
        ol({ children, ...props }) {
          return <ol className="list-decimal list-inside space-y-1 my-4 text-gray-700 dark:text-gray-300" {...props}>{children}</ol>;
        },
        li({ children, ...props }) {
          return <li className="text-gray-700 dark:text-gray-300" {...props}>{children}</li>;
        },
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
        pre({ children }) {
          return <>{children}</>;
        },
        img({ node, src, alt, ...props }) {
          return (
            <img
              src={src}
              alt={alt || ''}
              className="max-w-full h-auto rounded-lg shadow-sm my-4"
              loading="lazy"
              {...props}
            />
          );
        },
        a({ node, href, children, ...props }) {
          const isExternal = href?.startsWith('http');
          return (
            <a
              href={href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="text-blue-600 dark:text-blue-400 hover:underline"
              {...props}
            >
              {children}
            </a>
          );
        },
        table({ node, children, ...props }) {
          return (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                {children}
              </table>
            </div>
          );
        },
        thead({ node, children, ...props }) {
          return (
            <thead className="bg-gray-50 dark:bg-gray-800">
              {children}
            </thead>
          );
        },
        th({ node, children, ...props }) {
          return (
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 last:border-r-0" {...props}>
              {children}
            </th>
          );
        },
        tbody({ node, children, ...props }) {
          return (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props}>
              {children}
            </tbody>
          );
        },
        td({ node, children, ...props }) {
          return (
            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0" {...props}>
              {children}
            </td>
          );
        },
        input({ node, type, ...props }) {
          if (type === 'checkbox') {
            return (
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                readOnly
                {...props}
              />
            );
          }
          return <input type={type} {...props} />;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
