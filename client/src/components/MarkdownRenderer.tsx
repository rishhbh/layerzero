import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '../lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <div className={cn(
      "prose prose-invert max-w-none prose-pre:bg-[#141414] prose-pre:border prose-pre:border-border prose-pre:p-4 prose-pre:rounded-none",
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >{content}</ReactMarkdown>
    </div>
  );
};