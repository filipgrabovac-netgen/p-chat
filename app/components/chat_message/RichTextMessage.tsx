import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

interface RichTextMessageProps {
  content: string;
  isUser: boolean;
  showCursor?: boolean;
}

export const RichTextMessage: React.FC<RichTextMessageProps> = ({
  content,
  isUser,
  showCursor = false,
}) => {
  if (isUser) {
    // For user messages, keep simple text rendering
    return (
      <div className="whitespace-pre-wrap text-sm lg:text-base leading-relaxed font-medium">
        {content}
        {showCursor && (
          <span className="inline-block w-0.5 h-4 lg:h-5 bg-white ml-1 animate-pulse" />
        )}
      </div>
    );
  }

  // For assistant messages, use rich text rendering
  return (
    <div className="prose prose-sm lg:prose-base max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Custom styling for different elements
          h1: ({ children }) => (
            <h1 className="text-lg font-bold text-slate-900 mb-2 mt-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold text-slate-900 mb-2 mt-3 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold text-slate-900 mb-1 mt-2 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-slate-900 mb-2 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 text-slate-900 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 text-slate-900 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="text-slate-900">{children}</li>,
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              );
            }
            return <code className={className}>{children}</code>;
          },
          pre: ({ children }) => (
            <pre className="bg-slate-50 text-slate-900 border border-slate-200 p-4 rounded-lg overflow-x-auto mb-2 text-xs lg:text-sm">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-700 mb-2">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-2">
              <table className="min-w-full border border-slate-200 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-medium text-slate-700 border-b border-slate-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-xs text-slate-900 border-b border-slate-200">
              {children}
            </td>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-900">{children}</em>
          ),
        }}
      >
        {content}
        {/* {showCursor && (
          <span className="inline-block w-0.5 h-4 lg:h-5 bg-slate-900 ml-1 animate-pulse"></span>
        )} */}
      </ReactMarkdown>
    </div>
  );
};
