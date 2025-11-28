'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownAnswerProps {
  content: string;
  className?: string;
}

/**
 * Component for rendering formatted AI answers with markdown support
 * Provides beautiful, structured display of AI-generated responses
 */
const MarkdownAnswer: React.FC<MarkdownAnswerProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-answer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-6" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 mt-5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-3" {...props} />
          ),

          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3" {...props} />
          ),

          // Lists
          ul: ({ node, ...props }) => (
            <ul className="space-y-2 mb-4 ml-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="space-y-2 mb-4 ml-1 list-decimal list-inside" {...props} />
          ),
          li: ({ node, children, ...props }) => (
            <li className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2" {...props}>
              <span className="text-purple-600 dark:text-purple-400 font-bold select-none flex-shrink-0 mt-0.5">•</span>
              <span className="flex-1">{children}</span>
            </li>
          ),

          // Strong/Bold text
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props} />
          ),

          // Emphasis/Italic text
          em: ({ node, ...props }) => (
            <em className="italic text-gray-700 dark:text-gray-300" {...props} />
          ),

          // Code blocks
          code: ({ node, className, children, ...props }) => {
            const isInline = !className || !className.includes('language-');
            return isInline ? (
              <code className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
            ) : (
              <code className="block bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 rounded-lg text-xs font-mono overflow-x-auto mb-3" {...props}>{children}</code>
            );
          },

          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-purple-300 dark:border-purple-600 pl-4 py-2 mb-4 italic text-gray-700 dark:text-gray-300 bg-purple-50/50 dark:bg-purple-900/20 rounded-r" {...props} />
          ),

          // Links
          a: ({ node, ...props }) => (
            <a className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />
          ),

          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-gray-200 dark:border-gray-700" {...props} />
          ),

          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownAnswer;
