import React, { useState, useCallback } from 'react';
import { Bot, FileText, Settings, Database, Brain } from 'lucide-react';
import TransactionTable from './components/TransactionTable';
import AIDialog from './components/AIDialog';
import SettingsPanel, { AIMode, LLMProvider } from './components/SettingsPanel';
import { mockTransactions } from './data/mockData';
import { AIMessage, A2UIComponent } from './types';

const App: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiMode, setAIMode] = useState<AIMode>('mock'); // 默认使用模拟模式
  const [llmProvider, setLLMProvider] = useState<LLMProvider>('deepseek'); // 默认使用 DeepSeek

  const selectedTransactions = mockTransactions.filter(t => selectedIds.includes(t.id));

  const handleAIReview = async () => {
    if (selectedIds.length === 0) {
      alert('请先选择要分析的交易');
      return;
    }

    setIsDialogOpen(true);
    setIsLoading(true);

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
        let uiComponent: A2UIComponent | undefined;
        let uiSchema: any = undefined;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          // 尝试解析完整的 JSON
          try {
            const parsed = JSON.parse(accumulatedContent);
            uiComponent = parsed.uiComponent;
            uiSchema = parsed.uiSchema;
            accumulatedContent = parsed.content || accumulatedContent;
          } catch (e) {
            // JSON 还未完整，继续累积
          }
        }

        const assistantMessage: AIMessage = {
          role: 'assistant',
          content: accumulatedContent,
          uiComponent,
          uiSchema,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
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
        let uiComponent: A2UIComponent | undefined;
        let uiSchema: any = undefined;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          // 尝试解析完整的 JSON
          try {
            const parsed = JSON.parse(accumulatedContent);
            uiComponent = parsed.uiComponent;
            uiSchema = parsed.uiSchema;
            accumulatedContent = parsed.content || accumulatedContent;
          } catch (e) {
            // JSON 还未完整，继续累积
          }
        }

        const assistantMessage: AIMessage = {
          role: 'assistant',
          content: accumulatedContent,
          uiComponent,
          uiSchema,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
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

  const handleAIModeChange = (mode: AIMode) => {
    setAIMode(mode);
    // 清空历史消息
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
              {/* AI 模式指示器 */}
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
                    <span>真实 AI</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>模拟数据</span>
                  </>
                )}
              </div>
              
              {/* 设置按钮 */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="系统设置"
              >
                <Settings className="w-5 h-5" />
              </button>
            
              {/* AI Review 按钮 */}
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

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
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

        {/* 交易表格 */}
        <div className="bg-white rounded-lg shadow">
          <TransactionTable
            transactions={mockTransactions}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>
      </main>

      {/* AI 对话框 */}
      <AIDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        selectedTransactions={selectedTransactions}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />

      {/* 设置面板 */}
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
