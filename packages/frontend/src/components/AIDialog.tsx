import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Bot, User, Loader2, GripVertical, RefreshCw } from 'lucide-react';
import { AIMessage, Transaction, A2UIMessage } from '../types';
import { renderUISchema, validateAndFixSchema } from '../a2ui';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ActionProvider, useAction } from '../a2ui/ActionContext';

interface AIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTransactions: Transaction[];
  messages: AIMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onClear?: () => void;
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

  if (queryUISchema) {
    return (
      <div className="mt-4 border-t pt-4">
        <div className="text-xs text-gray-400 mb-2 font-medium">📊 查询结果</div>
        {renderUISchema(queryUISchema)}
      </div>
    );
  }
  
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
 * 加载状态渲染器 - beginRendering 消息
 */
const LoadingRenderer: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        <Bot className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">{message || '正在生成 UI...'}</p>
        <p className="text-xs text-gray-400 mt-1">AI 正在思考并构建可视化界面</p>
      </div>
    </div>
  );
};

/**
 * 空状态渲染器 - deleteSurface 消息
 */
const EmptyRenderer: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <RefreshCw className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500">{message || '已清除分析结果'}</p>
    </div>
  );
};

/**
 * AI 响应渲染器（内部组件，使用 ActionContext）
 * 支持 A2UI 的 4 种消息类型
 */
const AIResponseRenderer: React.FC<{ message: AIMessage; isLast: boolean }> = ({ message, isLast }) => {
  // 如果是 beginRendering 状态
  if (message.isRendering) {
    return <LoadingRenderer message={message.content} />;
  }

  // 如果有 uiSchema（surfaceUpdate 消息）
  if (message.uiSchema && message.uiSchema.length > 0) {
    try {
      // 直接渲染 uiSchema 数组，不需要 validateAndFixSchema
      return (
        <div className="mt-3 w-full min-w-0">
          {renderUISchema(message.uiSchema as any)}
          {isLast && <QueryResultRenderer />}
        </div>
      );
    } catch (e) {
      console.error('Failed to render uiSchema:', e);
    }
  }
  
  // 如果有 dataModel 但没有 uiSchema
  if (message.dataModel && Object.keys(message.dataModel).length > 0) {
    return (
      <div className="mt-3 w-full min-w-0">
        <div className="text-xs text-gray-400 mb-2">📊 数据状态更新</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(message.dataModel).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded px-3 py-2">
              <p className="text-xs text-gray-500">{key}</p>
              <p className="text-sm font-medium text-gray-900">{String(value)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // 如果内容为空或表示删除
  if (!message.content || message.content === '__deleted__') {
    return <EmptyRenderer />;
  }
  
  // 尝试解析 JSON（兼容旧逻辑）
  try {
    const parsed = JSON.parse(message.content);
    
    // 检查是否是 A2UI 消息类型
    if (['surfaceUpdate', 'dataModelUpdate', 'beginRendering', 'deleteSurface'].includes(parsed.type)) {
      const a2uiMessage = parsed as A2UIMessage;
      
      switch (a2uiMessage.type) {
        case 'beginRendering':
          return <LoadingRenderer message={a2uiMessage.message} />;
          
        case 'deleteSurface':
          return <EmptyRenderer message={a2uiMessage.message} />;
          
        case 'surfaceUpdate':
          if (a2uiMessage.components) {
            return (
              <div className="mt-3 w-full min-w-0">
                {renderUISchema(a2uiMessage.components as any)}
                {isLast && <QueryResultRenderer />}
              </div>
            );
          }
          break;
          
        case 'dataModelUpdate':
          if (a2uiMessage.data) {
            return (
              <div className="mt-3 w-full min-w-0">
                <div className="text-xs text-gray-400 mb-2">📊 数据状态更新</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(a2uiMessage.data).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded px-3 py-2">
                      <p className="text-xs text-gray-500">{key}</p>
                      <p className="text-sm font-medium text-gray-900">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          break;
      }
    }
    
    // 检查是否是 Tool Call
    if (parsed.tool && parsed.args) {
      // Tool call 逻辑已在 ActionContext 中处理
      return null;
    }
    
    // 检查是否有 UI Schema（旧格式兼容）
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
    
    // 纯文本内容
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
  isLoading: externalLoading,
  onClear
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

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = dialogWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, [dialogWidth]);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = startXRef.current - e.clientX;
    const newWidth = Math.min(Math.max(startWidthRef.current + deltaX, 400), window.innerWidth * 0.9);
    setDialogWidth(newWidth);
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, [isDragging]);

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
                已选择 {selectedTransactions.length} 笔交易 · A2UI 流式更新
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onClear && messages.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-blue-200 hover:text-white px-2 py-1 rounded bg-blue-500/30 hover:bg-blue-500/50 transition-colors"
                title="清除对话"
              >
                清除
              </button>
            )}
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

        {/* A2UI 消息类型说明 */}
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-2 flex-shrink-0">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              beginRendering
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              surfaceUpdate
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              dataModelUpdate
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              deleteSurface
            </span>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-w-0">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">A2UI 流式 UI 生成</p>
              <p className="text-sm mt-2">点击 AI Review 按钮，AI 将动态生成可视化界面</p>
              <div className="mt-4 space-y-1 text-xs text-gray-400">
                <p>🔄 beginRendering - 开始渲染</p>
                <p>🎨 surfaceUpdate - 更新 UI</p>
                <p>📊 dataModelUpdate - 更新数据</p>
                <p>🗑️ deleteSurface - 删除 UI</p>
              </div>
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
                <span className="text-sm">AI 正在生成 UI...</span>
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
            A2UI 支持 4 种消息类型：beginRendering | surfaceUpdate | dataModelUpdate | deleteSurface
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
