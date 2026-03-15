import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

/**
 * 轻量级 Markdown 渲染器
 * 支持常用的 Markdown 语法
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const parseMarkdown = (text: string): React.ReactNode => {
    // 处理代码块
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    
    // 处理行内代码
    text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    
    // 处理标题
    text = text.replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold mt-4 mb-2 text-gray-800">$1</h3>');
    text = text.replace(/^#### (.*$)/gm, '<h4 class="text-sm font-semibold mt-3 mb-2 text-gray-800">$1</h4>');
    text = text.replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold mt-4 mb-2 text-gray-900">$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mt-4 mb-2 text-gray-900">$1</h1>');
    
    // 处理粗体
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // 处理斜体
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // 处理无序列表
    text = text.replace(/^\* (.*$)/gm, '<li class="ml-4 list-disc">$1</li>');
    text = text.replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>');
    
    // 处理有序列表
    text = text.replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>');
    
    // 处理换行
    text = text.replace(/\n\n/g, '</p><p class="mb-3">');
    text = text.replace(/\n/g, '<br />');
    
    // 包装在段落中
    text = `<div class="markdown-content"><p class="mb-3">${text}</p></div>`;
    
    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div className="prose prose-sm max-w-none text-gray-700 text-sm leading-relaxed">
      {parseMarkdown(content)}
      <style>{`
        .markdown-content h1 { font-size: 1.25rem; font-weight: 700; margin-top: 1rem; margin-bottom: 0.5rem; }
        .markdown-content h2 { font-size: 1.125rem; font-weight: 700; margin-top: 1rem; margin-bottom: 0.5rem; }
        .markdown-content h3 { font-size: 1rem; font-weight: 600; margin-top: 0.75rem; margin-bottom: 0.5rem; }
        .markdown-content h4 { font-size: 0.875rem; font-weight: 600; margin-top: 0.5rem; margin-bottom: 0.25rem; }
        .markdown-content p { margin-bottom: 0.75rem; }
        .markdown-content li { margin-left: 1rem; margin-bottom: 0.25rem; }
        .markdown-content strong { font-weight: 600; }
        .markdown-content em { font-style: italic; }
        .markdown-content code.inline-code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875em;
        }
        .markdown-content pre {
          background-color: #1f2937;
          color: #e5e7eb;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 0.75rem 0;
        }
        .markdown-content pre code {
          font-family: monospace;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};
