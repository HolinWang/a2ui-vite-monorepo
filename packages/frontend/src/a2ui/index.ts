/**
 * A2UI 核心 API 导出
 */

// 类型定义
export * from './types';

// 组件注册表
export {
  componentRegistry,
  getComponentDefinition,
  getComponentNames,
  getComponentsByCategory,
  generateComponentPrompt,
} from './componentCatalog';

// 渲染引擎
export {
  renderNode,
  renderUISchema,
  createComponentRegistry,
} from './renderNode';

// Schema 验证器
export {
  validateSchema,
  fixSchema,
  validateAndFixSchema,
} from './schemaValidator';

// Tool Calling
export {
  toolRegistry,
  executeToolCall,
  generateToolPrompt,
} from './tools';

// Action Context
export { ActionProvider, useAction } from './ActionContext';

// 组件
export * from './components';
