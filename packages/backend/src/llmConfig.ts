import { ChatOpenAI } from '@langchain/openai';

// 支持的 LLM 提供商类型
export type LLMProvider = 'deepseek' | 'qwen';

// LLM 配置接口
export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// 默认模型配置
const DEFAULT_MODELS: Record<LLMProvider, string> = {
  deepseek: 'deepseek-chat',
  qwen: 'qwen-turbo',
};

// API 基础 URL
const API_BASE_URLS: Record<LLMProvider, string> = {
  deepseek: 'https://api.deepseek.com/v1',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
};

// 创建 LLM 客户端
export function createLLMClient(config: LLMConfig): ChatOpenAI {
  const provider = config.provider;
  const apiKey = config.apiKey || getApiKey(provider);
  const model = config.model || DEFAULT_MODELS[provider];
  const baseURL = API_BASE_URLS[provider];

  if (!apiKey) {
    throw new Error(`API key for ${provider} is not configured. Please set the corresponding environment variable.`);
  }

  return new ChatOpenAI({
    modelName: model,
    temperature: config.temperature ?? 0.7,
    maxTokens: config.maxTokens ?? 4096,
    openAIApiKey: apiKey,
    configuration: {
      baseURL,
    },
  });
}

// 从环境变量获取 API Key
function getApiKey(provider: LLMProvider): string | undefined {
  const envKeys: Record<LLMProvider, string> = {
    deepseek: 'DEEPSEEK_API_KEY',
    qwen: 'QWEN_API_KEY',
  };
  return process.env[envKeys[provider]];
}

// 获取当前配置的提供商
export function getConfiguredProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER as LLMProvider;
  if (provider === 'deepseek' || provider === 'qwen') {
    return provider;
  }
  // 默认使用 DeepSeek
  return 'deepseek';
}

// 检查 API Key 是否配置
export function isAPIKeyConfigured(provider: LLMProvider): boolean {
  return !!getApiKey(provider);
}

// 获取支持的模型列表
export function getSupportedModels(provider: LLMProvider): string[] {
  const models: Record<LLMProvider, string[]> = {
    deepseek: ['deepseek-chat', 'deepseek-coder'],
    qwen: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-max-longcontext'],
  };
  return models[provider];
}
