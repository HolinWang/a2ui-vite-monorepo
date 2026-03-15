import React, { useState, useEffect } from 'react';
import { X, Settings, Zap, Brain, Database, Info, ChevronDown, Check } from 'lucide-react';

export type AIMode = 'real' | 'mock';
export type LLMProvider = 'deepseek' | 'qwen';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  aiMode: AIMode;
  onAIModeChange: (mode: AIMode) => void;
  llmProvider?: LLMProvider;
  onLLMProviderChange?: (provider: LLMProvider) => void;
}

const LLM_PROVIDERS: { id: LLMProvider; name: string; description: string; models: string[] }[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek 大模型，性价比高，中文能力强',
    models: ['deepseek-chat', 'deepseek-coder'],
  },
  {
    id: 'qwen',
    name: '通义千问',
    description: '阿里云通义千问，中文理解优秀',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
  },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  aiMode,
  onAIModeChange,
  llmProvider = 'deepseek',
  onLLMProviderChange,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>(llmProvider);
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);

  useEffect(() => {
    setSelectedProvider(llmProvider);
  }, [llmProvider]);

  const handleProviderChange = (provider: LLMProvider) => {
    setSelectedProvider(provider);
    onLLMProviderChange?.(provider);
    setIsProviderDropdownOpen(false);
  };

  if (!isOpen) return null;

  const modes = [
    {
      id: 'real' as AIMode,
      name: '真实 AI 模式',
      icon: <Brain className="w-5 h-5" />,
      description: '调用 DeepSeek 或通义千问 API',
      features: [
        '智能理解用户意图',
        '生成动态 UI Schema',
        '支持复杂对话交互',
        '实时流式响应',
      ],
      color: 'blue',
      recommended: true,
    },
    {
      id: 'mock' as AIMode,
      name: '模拟数据模式',
      icon: <Database className="w-5 h-5" />,
      description: '使用预设的模拟数据，无需 API Key',
      features: [
        '无需配置 API Key',
        '快速体验功能',
        '稳定可靠的响应',
        '适合演示场景',
      ],
      color: 'green',
      recommended: false,
    },
  ];

  const currentProvider = LLM_PROVIDERS.find(p => p.id === selectedProvider);

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* 设置面板 */}
      <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">系统设置</h2>
              <p className="text-sm text-gray-300">配置 AI 服务模式</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 说明卡片 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">关于 AI 模式</p>
                <p className="text-sm text-blue-700">
                  真实 AI 模式支持 DeepSeek 或通义千问，需要配置对应的 API Key。
                  模拟数据模式使用预设数据，适合快速体验和演示。
                </p>
              </div>
            </div>
          </div>

          {/* AI 模式选择 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">
              AI 服务模式
            </h3>
            
            {modes.map((mode) => (
              <div
                key={mode.id}
                onClick={() => onAIModeChange(mode.id)}
                className={`
                  relative cursor-pointer rounded-lg border-2 p-4 transition-all
                  ${aiMode === mode.id 
                    ? mode.color === 'blue' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                {mode.recommended && (
                  <div className="absolute -top-2 right-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500 text-white">
                      <Zap className="w-3 h-3 mr-1" />
                      推荐
                    </span>
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className={`
                    flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                    ${mode.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}
                  `}>
                    {mode.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-semibold text-gray-900">{mode.name}</h4>
                      {aiMode === mode.id && (
                        <span className={`
                          inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                          ${mode.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}
                        `}>
                          当前使用
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{mode.description}</p>
                    
                    <ul className="mt-3 space-y-1.5">
                      {mode.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className={`
                            w-1.5 h-1.5 rounded-full
                            ${mode.color === 'blue' ? 'bg-blue-400' : 'bg-green-400'}
                          `} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* LLM 提供商选择 - 仅在真实 AI 模式下显示 */}
          {aiMode === 'real' && (
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                LLM 提供商
              </h3>
              
              <div className="relative">
                <button
                  onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{currentProvider?.name}</p>
                      <p className="text-sm text-gray-500">{currentProvider?.description}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isProviderDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProviderDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {LLM_PROVIDERS.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => handleProviderChange(provider.id)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Brain className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{provider.name}</p>
                            <p className="text-sm text-gray-500">{provider.description}</p>
                          </div>
                        </div>
                        {selectedProvider === provider.id && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* API Key 配置提示 */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium mb-1">API Key 配置</p>
                    <p className="text-sm text-amber-700">
                      请在后端环境变量中配置 API Key：
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-amber-700 font-mono">
                      <li>• DeepSeek: <span className="bg-amber-100 px-1 rounded">DEEPSEEK_API_KEY</span></li>
                      <li>• 通义千问: <span className="bg-amber-100 px-1 rounded">QWEN_API_KEY</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 当前配置状态 */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">当前配置</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">AI 模式</span>
                <span className={`font-medium ${aiMode === 'real' ? 'text-blue-600' : 'text-green-600'}`}>
                  {aiMode === 'real' ? '真实 AI' : '模拟数据'}
                </span>
              </div>
              {aiMode === 'real' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">LLM 提供商</span>
                  <span className="text-gray-900">{currentProvider?.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">数据来源</span>
                <span className="text-gray-900">
                  {aiMode === 'real' ? `${currentProvider?.name} API` : '本地预设'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">响应类型</span>
                <span className="text-gray-900">
                  {aiMode === 'real' ? '动态生成' : '固定模板'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            保存设置
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
