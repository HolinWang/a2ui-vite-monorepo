import React, { useState, useCallback } from 'react';
import { Bot, FileText, Settings, Database, Brain, Layers, Zap } from 'lucide-react';
import TransactionTable from './components/TransactionTable';
import AIDialog from './components/AIDialog';
import AGUIExample from './components/AGUIExample';
import SettingsPanel, { AIMode, LLMProvider } from './components/SettingsPanel';
import { mockTransactions } from './data/mockData';
import { AIMessage, A2UIMessage } from './types';

// UI 协议模式
type UIProtocol = 'a2ui' | 'ag-ui';

const App: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiMode, setAIMode] = useState<AIMode>('mock');
  const [llmProvider, setLLMProvider] = useState<LLMProvider>('deepseek');
  const [uiProtocol, setUIProtocol] = useState<UIProtocol>('a2ui');
  const [showAGUI, setShowAGUI] = useState(false);

  const selectedTransactions = mockTransactions.filter(t => selectedIds.includes(t.id));

  /**
   * 解析单行 A2UI 消息
   */
  const parseA2UIStreamMessage = (line: string): A2UIMessage | null => {
    try {
      const parsed = JSON.parse(line.trim());
      if (['surfaceUpdate', 'dataModelUpdate', 'beginRendering', 'deleteSurface'].includes(parsed.type)) {
        return parsed as A2UIMessage;
      }
      return null;
    } catch {
      return null;
    }
  };

  /**
   * 更新助手消息
   */
  const updateAssistantMessage = (msg: AIMessage, a2uiMsg: A2UIMessage): AIMessage => {
    switch (a2uiMsg.type) {
      case 'beginRendering':
        return {
          ...msg,
          content: a2uiMsg.message || '正在生成 UI...',
          isRendering: true,
        };
      case 'surfaceUpdate':
        return {
          ...msg,
          content: '',
          uiSchema: a2uiMsg.components,
          isRendering: false,
        };
      case 'dataModelUpdate':
        return {
          ...msg,
          dataModel: a2uiMsg.data,
          isRendering: false,
        };
      case 'deleteSurface':
        return {
          ...msg,
          content: '__deleted__',
          isRendering: false,
        };
      default:
        return msg;
    }
  };

  const handleAIReview = async () => {
    if (selectedIds.length === 0) {
      alert('请先选择要分析的交易');
      return;
    }

    setIsDialogOpen(true);
    setIsLoading(true);

    // 先添加一个用户消息表示触发了分析
    const userMessage: AIMessage = {
      role: 'user',
      content: '分析选中的交易',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/ai/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions: selectedTransactions,
          mode: aiMode,
          provider: llmProvider,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulatedContent = '';
        let currentAssistantMsg: AIMessage = {
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };

        // 先添加一个占位消息
        setMessages(prev => [...prev, currentAssistantMsg]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          // 尝试解析完整的消息行
          const lines = accumulatedContent.split('\n');
          accumulatedContent = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            const a2uiMsg = parseA2UIStreamMessage(line);
            if (a2uiMsg) {
              currentAssistantMsg = updateAssistantMessage(currentAssistantMsg, a2uiMsg);
              setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                  newMessages[newMessages.length - 1] = { ...currentAssistantMsg };
                }
                return newMessages;
              });
            }
          }
        }

        // 处理剩余的内容
        if (accumulatedContent.trim()) {
          const a2uiMsg = parseA2UIStreamMessage(accumulatedContent);
          if (a2uiMsg) {
            currentAssistantMsg = updateAssistantMessage(currentAssistantMsg, a2uiMsg);
            setMessages(prev => {
              const newMessages = [...prev];
              if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                newMessages[newMessages.length - 1] = { ...currentAssistantMsg };
              }
              return newMessages;
            });
          }
        }
      }
    } catch (error) {
      console.error('AI Review error:', error);
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: '抱歉，AI 分析时出现错误。请稍后重试。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = useCallback(async (message: string) => {
    const userMessage: AIMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          transactions: selectedTransactions,
          history: messages,
          mode: aiMode,
          provider: llmProvider,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulatedContent = '';
        let currentAssistantMsg: AIMessage = {
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, currentAssistantMsg]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          const lines = accumulatedContent.split('\n');
          accumulatedContent = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            const a2uiMsg = parseA2UIStreamMessage(line);
            if (a2uiMsg) {
              currentAssistantMsg = updateAssistantMessage(currentAssistantMsg, a2uiMsg);
              setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                  newMessages[newMessages.length - 1] = { ...currentAssistantMsg };
                }
                return newMessages;
              });
            }
          }
        }

        if (accumulatedContent.trim()) {
          const a2uiMsg = parseA2UIStreamMessage(accumulatedContent);
          if (a2uiMsg) {
            currentAssistantMsg = updateAssistantMessage(currentAssistantMsg, a2uiMsg);
            setMessages(prev => {
              const newMessages = [...prev];
              if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                newMessages[newMessages.length - 1] = { ...currentAssistantMsg };
              }
              return newMessages;
            });
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: '抱歉，对话时出现错误。请稍后重试。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTransactions, messages, aiMode]);

  const handleClearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const handleAIModeChange = (mode: AIMode) => {
    setAIMode(mode);
    setMessages([]);
  };

  const handleLLMProviderChange = (provider: LLMProvider) => {
    setLLMProvider(provider);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">银行交易管理系统</h1>
                <p className="text-sm text-gray-500">Bank Transaction Management System with A2UI</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* UI 协议切换 */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => { setUIProtocol('a2ui'); setShowAGUI(false); }}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                    ${uiProtocol === 'a2ui'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Layers className="w-4 h-4" />
                  <span>A2UI</span>
                </button>
                <button
                  onClick={() => { setUIProtocol('ag-ui'); setShowAGUI(true); }}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                    ${uiProtocol === 'ag-ui'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Zap className="w-4 h-4" />
                  <span>AG-UI</span>
                </button>
              </div>

              <div className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                ${aiMode === 'real'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
                }
              `}>
                {aiMode === 'real' ? (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>真实 AI ({llmProvider === 'deepseek' ? 'DeepSeek' : '通义千问'})</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>模拟数据</span>
                  </>
                )}
              </div>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="系统设置"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                onClick={handleAIReview}
                disabled={selectedIds.length === 0}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                <Bot className="w-5 h-5" />
                <span className="font-medium">AI Review</span>
                {selectedIds.length > 0 && (
                  <span className="bg-white text-blue-600 text-xs px-2 py-1 rounded-full">
                    {selectedIds.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">总交易数</p>
            <p className="text-2xl font-bold text-gray-900">{mockTransactions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">已选择</p>
            <p className="text-2xl font-bold text-blue-600">{selectedIds.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">AI 模式</p>
            <div className="flex items-center gap-2">
              <p className={`text-lg font-bold ${aiMode === 'real' ? 'text-blue-600' : 'text-green-600'}`}>
                {aiMode === 'real' ? '真实 AI' : '模拟数据'}
              </p>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="text-xs text-gray-400 hover:text-blue-500 underline"
              >
                切换
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">总金额</p>
            <p className="text-2xl font-bold text-gray-900">
              ¥{mockTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100">
          <p className="text-sm font-medium text-gray-700 mb-2">A2UI 流式消息类型</p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <code className="bg-white px-1.5 py-0.5 rounded">beginRendering</code>
              开始渲染
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <code className="bg-white px-1.5 py-0.5 rounded">surfaceUpdate</code>
              更新 UI
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              <code className="bg-white px-1.5 py-0.5 rounded">dataModelUpdate</code>
              更新数据
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              <code className="bg-white px-1.5 py-0.5 rounded">deleteSurface</code>
              删除 UI
            </span>
          </div>
        </div>

        {uiProtocol === 'ag-ui' && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6 border border-purple-100">
            <p className="text-sm font-medium text-gray-700 mb-2">AG-UI 协议说明</p>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <code className="bg-white px-1.5 py-0.5 rounded">Agent</code>
                决策中心
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                <code className="bg-white px-1.5 py-0.5 rounded">Runtime</code>
                执行渲染
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                <code className="bg-white px-1.5 py-0.5 rounded">Action</code>
                触发事件
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-rose-400 rounded-full"></span>
                <code className="bg-white px-1.5 py-0.5 rounded">State</code>
                状态管理
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <TransactionTable
            transactions={mockTransactions}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>

        {/* AG-UI 示例区域 - 仅在 AG-UI 模式下显示 */}
        {showAGUI && (
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                AG-UI 交互示例
              </h2>
              <AGUIExample
                transactions={mockTransactions}
                selectedIds={selectedIds}
              />
            </div>
          </div>
        )}
      </main>

      <AIDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        selectedTransactions={selectedTransactions}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onClear={handleClearMessages}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        aiMode={aiMode}
        onAIModeChange={handleAIModeChange}
        llmProvider={llmProvider}
        onLLMProviderChange={handleLLMProviderChange}
      />
    </div>
  );
};

export default App;
