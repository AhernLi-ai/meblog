import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { useState, type ReactNode } from 'react';
import sanitizeHtml from 'sanitize-html';
import 'katex/dist/katex.min.css';

// Extract plain text from React children (handles arrays, elements, etc.)
function extractText(children: ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(extractText).join('');
  }
  if (children && typeof children === 'object' && 'props' in (children as any)) {
    return extractText((children as any).props.children);
  }
  return '';
}

// Generate slug for heading IDs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, '') // Keep Chinese characters and alphanumerics
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Create heading ID from children
function createHeadingId(children: ReactNode): string {
  const text = extractText(children);
  return slugify(text);
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
  // Sanitize HTML to prevent XSS attacks
  const sanitizedContent = sanitizeHtml(content, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'span', 'div', 'input', 'svg', 'path'],
    allowedAttributes: {
      'a': ['href', 'target', 'rel', 'class'],
      'img': ['src', 'alt', 'class', 'loading', 'width', 'height'],
      'code': ['class'],
      'pre': ['class'],
      'input': ['type', 'checked', 'disabled'],
      'span': ['class'],
      'div': ['class'],
      'td': ['class'],
      'th': ['class'],
      'h1': ['id', 'class'],
      'h2': ['id', 'class'],
      'h3': ['id', 'class'],
      'h4': ['id', 'class'],
      'p': ['class'],
      'li': ['class'],
      'ul': ['class'],
      'ol': ['class'],
      'blockquote': ['class'],
      'table': ['class'],
      'svg': ['class', 'viewBox', 'fill', 'stroke', 'strokeWidth', 'd', 'xmlns'],
      'path': ['d', 'strokeLinecap', 'strokeLinejoin', 'strokeWidth'],
    },
    allowedSchemes: ['http', 'https'],
    disallowedTagsMode: 'discard',
  });

  return (
    <div className="max-w-none">
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
      components={{
        h1({ children, ...props }) {
          const id = createHeadingId(children);
          return <h1 id={id} className="text-3xl font-bold mb-4 mt-8 first:mt-0 text-[var(--color-foreground)]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }} {...props}>{children}</h1>;
        },
        h2({ children, ...props }) {
          const id = createHeadingId(children);
          return <h2 id={id} className="text-2xl font-bold mb-3 mt-8 first:mt-0 text-[var(--color-foreground)]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }} {...props}>{children}</h2>;
        },
        h3({ children, ...props }) {
          const id = createHeadingId(children);
          return <h3 id={id} className="text-xl font-semibold mb-2 mt-6 first:mt-0 text-[var(--color-foreground)]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }} {...props}>{children}</h3>;
        },
        h4({ children, ...props }) {
          const id = createHeadingId(children);
          return <h4 id={id} className="text-lg font-semibold mb-2 mt-4 text-[var(--color-foreground)]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }} {...props}>{children}</h4>;
        },
        p({ children, ...props }) {
          return <p className="text-[var(--color-foreground)] leading-relaxed mb-4" style={{ lineHeight: '1.8' }} {...props}>{children}</p>;
        },
        ul({ children, ...props }) {
          return <ul className="list-disc list-inside space-y-1 my-4 text-[var(--color-foreground)]" {...props}>{children}</ul>;
        },
        ol({ children, ...props }) {
          return <ol className="list-decimal list-inside space-y-1 my-4 text-[var(--color-foreground)]" {...props}>{children}</ol>;
        },
        li({ children, ...props }) {
          return <li className="text-[var(--color-foreground)]" {...props}>{children}</li>;
        },
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');
          const isInline = !match && !codeString.includes('\n');

          if (isInline) {
            return (
              <code
                className="px-1 py-0.5 bg-[var(--color-background-secondary)] text-[var(--color-primary)] rounded text-sm font-mono"
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
                  borderRadius: '8px',
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
              className="max-w-full h-auto rounded-[12px] shadow-[var(--shadow-card)] my-4"
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
              className="text-[var(--color-primary)] hover:underline"
              {...props}
            >
              {children}
            </a>
          );
        },
        blockquote({ children, ...props }) {
          return (
            <blockquote
              className="border-l-4 border-[var(--color-primary)] bg-[var(--color-background-secondary)] p-4 my-4 rounded-r-[8px]"
              {...props}
            >
              {children}
            </blockquote>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-[var(--color-border)] rounded-[8px]">
                {children}
              </table>
            </div>
          );
        },
        thead({ children }) {
          return (
            <thead className="bg-[var(--color-background-secondary)]">
              {children}
            </thead>
          );
        },
        th({ children, ...props }) {
          return (
            <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--color-foreground)] border-r border-[var(--color-border)] last:border-r-0" {...props}>
              {children}
            </th>
          );
        },
        tbody({ children, ...props }) {
          return (
            <tbody className="divide-y divide-[var(--color-border)]" {...props}>
              {children}
            </tbody>
          );
        },
        td({ children, ...props }) {
          return (
            <td className="px-4 py-2 text-sm text-[var(--color-foreground)] border-r border-[var(--color-border)] last:border-r-0" {...props}>
              {children}
            </td>
          );
        },
        input({ node, type, checked, ...props }) {
          if (type === 'checkbox') {
            // Bug fix: completed [x] = green fill + white checkmark, uncompleted [ ] = border only
            if (checked) {
              return (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-green-500 border border-green-500">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              );
            }
            return (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded border-2 border-gray-400 bg-transparent">
                <span className="w-2 h-2 rounded-full bg-transparent" />
              </span>
            );
          }
          return <input type={type} {...props} />;
        },
        hr({ node, ...props }) {
          return (
            <hr className="my-8 border-[var(--color-border)]" {...props} />
          );
        },
      }}
    >
      {sanitizedContent}
    </ReactMarkdown>
    </div>
  );
}
