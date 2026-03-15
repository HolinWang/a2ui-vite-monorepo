import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Bot, User, Loader2, GripVertical } from 'lucide-react';
import { AIMessage, Transaction } from '../types';
import { renderUISchema, validateAndFixSchema, executeToolCall } from '../a2ui';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ActionProvider, useAction } from '../a2ui/ActionContext';

interface AIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTransactions: Transaction[];
  messages: AIMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

/**
 * 查询结果渲染器
 */
const QueryResultRenderer: React.FC = () => {
  const { queryResult, queryUISchema, isLoading } = useAction();

  if (isLoading) {
    return (
      <div className="mt-4 border-t pt-4">
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">正在查询详细信息...</span>
        </div>
      </div>
    );
  }

  // 如果有查询结果的 UI Schema，直接渲染
  if (queryUISchema) {
    return (
      <div className="mt-4 border-t pt-4">
        <div className="text-xs text-gray-400 mb-2 font-medium">📊 查询结果</div>
        {renderUISchema(queryUISchema)}
      </div>
    );
  }
  
  // 向后兼容：如果只有原始查询结果，渲染简单的字段-值表格
  if (queryResult) {
    return (
      <div className="mt-4 border-t pt-4">
        <div className="text-xs text-gray-400 mb-2 font-medium">📊 查询结果</div>
        {renderUISchema({
          component: 'Card',
          props: { title: '交易详情', padding: 'md' },
          children: [
            {
              component: 'Table',
              props: {
                columns: [
                  { key: 'field', title: '字段' },
                  { key: 'value', title: '值' }
                ],
                dataSource: Object.entries(queryResult).map(([key, value]) => ({
                  field: key,
                  value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
                })),
                bordered: true
              }
            }
          ]
        })}
      </div>
    );
  }
  
  return null;
};

/**
 * AI 响应渲染器（内部组件，使用 ActionContext）
 */
const AIResponseRenderer: React.FC<{ message: AIMessage; isLast: boolean }> = ({ message, isLast }) => {
  // 优先使用 uiSchema（新格式）
  if (message.uiSchema) {
    try {
      const { valid, schema: fixedSchema, errors } = validateAndFixSchema(message.uiSchema as any);
      
      if (!valid) {
        console.warn('Schema validation errors:', errors);
      }
      
      return (
        <div className="mt-3 w-full min-w-0">
          {renderUISchema(fixedSchema)}
          {isLast && <QueryResultRenderer />}
        </div>
      );
    } catch (e) {
      console.error('Failed to render uiSchema:', e);
    }
  }
  
  // 兼容旧格式：uiComponent
  if (message.uiComponent) {
    try {
      const { valid, schema: fixedSchema, errors } = validateAndFixSchema(message.uiComponent as any);
      
      if (!valid) {
        console.warn('Schema validation errors:', errors);
      }
      
      return (
        <div className="mt-3 w-full min-w-0">
          {renderUISchema(fixedSchema)}
          {isLast && <QueryResultRenderer />}
        </div>
      );
    } catch (e) {
      console.error('Failed to render uiComponent:', e);
    }
  }
  
  // 尝试解析 JSON（兼容旧逻辑）
  try {
    const parsed = JSON.parse(message.content);
    
    // 检查是否是 Tool Call
    if (parsed.tool && parsed.args) {
      const result = executeToolCall(parsed.tool, parsed.args);
      return (
        <div className="mt-3 w-full min-w-0">
          {renderUISchema(result.schema)}
          {isLast && <QueryResultRenderer />}
        </div>
      );
    }
    
    // 检查是否有 UI Schema
    if (parsed.uiSchema || parsed.uiComponent) {
      const schema = parsed.uiSchema || parsed.uiComponent;
      const { valid, schema: fixedSchema, errors } = validateAndFixSchema(schema);
      
      if (!valid) {
        console.warn('Schema validation errors:', errors);
      }
      
      return (
        <div className="mt-3 w-full min-w-0">
          {renderUISchema(fixedSchema)}
          {isLast && <QueryResultRenderer />}
        </div>
      );
    }
    
    // 纯文本内容 - 使用 Markdown 渲染
    return (
      <div className="w-full min-w-0">
        <MarkdownRenderer content={parsed.content || message.content} />
        {isLast && <QueryResultRenderer />}
      </div>
    );
  } catch (e) {
    // 不是 JSON，使用 Markdown 渲染文本
    return (
      <div className="w-full min-w-0">
        <MarkdownRenderer content={message.content} />
        {isLast && <QueryResultRenderer />}
      </div>
    );
  }
};

/**
 * 对话框内容（内部组件，使用 ActionContext）
 */
const AIDialogContent: React.FC<AIDialogProps> = ({
  isOpen,
  onClose,
  selectedTransactions,
  messages,
  onSendMessage,
  isLoading: externalLoading
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isLoading: actionLoading } = useAction();

  // 拖拽调整宽度相关状态
  const [dialogWidth, setDialogWidth] = useState(600);
  const [isDragging, setIsDragging] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const isLoading = externalLoading || actionLoading;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 开始拖拽
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = dialogWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, [dialogWidth]);

  // 拖拽中
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = startXRef.current - e.clientX;
    const newWidth = Math.min(Math.max(startWidthRef.current + deltaX, 400), window.innerWidth * 0.9);
    setDialogWidth(newWidth);
  }, [isDragging]);

  // 结束拖拽
  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, [isDragging]);

  // 绑定全局鼠标事件
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* 对话框 */}
      <div 
        ref={dialogRef}
        className="fixed right-0 top-0 h-full bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right"
        style={{ width: `${dialogWidth}px` }}
      >
        {/* 左侧拖拽手柄 */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-blue-400 transition-colors group flex items-center justify-center ${
            isDragging ? 'bg-blue-500' : 'bg-transparent'
          }`}
          onMouseDown={handleDragStart}
        >
          <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${isDragging ? 'opacity-100' : ''}`}>
            <GripVertical className="w-4 h-5 text-gray-400" />
          </div>
        </div>

        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">AI Review 助手</h2>
              <p className="text-sm text-blue-100">
                已选择 {selectedTransactions.length} 笔交易 · A2UI 增强版
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDialogWidth(600)}
              className="text-xs text-blue-200 hover:text-white px-2 py-1 rounded bg-blue-500/30 hover:bg-blue-500/50 transition-colors"
              title="重置为默认宽度"
            >
              {Math.round(dialogWidth)}px
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 选中的交易信息 */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex-shrink-0">
          <p className="text-sm font-medium text-gray-700 mb-2">选中的交易:</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {selectedTransactions.slice(0, 3).map((txn) => (
              <div key={txn.id} className="text-sm text-gray-600 flex items-center gap-2">
                <span className="font-mono">{txn.id}</span>
                <span>•</span>
                <span className={txn.type === 'income' ? 'text-green-600' : txn.type === 'expense' ? 'text-red-600' : 'text-blue-600'}>
                  {txn.type === 'income' ? '+' : txn.type === 'expense' ? '-' : ''}¥{txn.amount.toLocaleString()}
                </span>
              </div>
            ))}
            {selectedTransactions.length > 3 && (
              <p className="text-xs text-gray-500">还有 {selectedTransactions.length - 3} 笔交易...</p>
            )}
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-w-0">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">AI + A2UI 动态 UI 生成</p>
              <p className="text-sm mt-2">点击 AI Review 按钮，AI 将自动生成可视化分析报告</p>
              <p className="text-xs text-gray-400 mt-4">支持：风险分析、交易报表、详情查询、数据导出</p>
              <p className="text-xs text-gray-400 mt-1">💡 拖拽左边缘可调整面板宽度</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' ? 'bg-blue-500' : 'bg-gray-200'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-gray-600" />
                )}
              </div>
              
              <div className={`flex-1 min-w-0 ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block rounded-lg px-4 py-2 max-w-full ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800 w-full text-left'
                }`}>
                  {message.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <AIResponseRenderer message={message} isLast={index === messages.length - 1} />
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI 正在分析并生成 UI...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 输入框 */}
        <div className="border-t border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入问题或指令（如：分析风险、生成报表、查询详情）..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              发送
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            快捷指令：风险分析 | 生成报表 | 单笔分析 | 查询详情
          </p>
        </div>
      </div>
    </>
  );
};

/**
 * AI 对话框（外部组件，提供 ActionProvider）
 */
const AIDialog: React.FC<AIDialogProps> = (props) => {
  const handleQueryResult = useCallback((result: any) => {
    console.log('Query result:', result);
  }, []);

  return (
    <ActionProvider 
      transactions={props.selectedTransactions}
      onQueryResult={handleQueryResult}
    >
      <AIDialogContent {...props} />
    </ActionProvider>
  );
};

export default AIDialog;
