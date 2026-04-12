/**
 * AG-UI 模块导出
 * 
 * AG-UI 协议核心：
 * - Agent 负责决策（做什么）
 * - Runtime（前端）负责执行（怎么触发、怎么渲染）
 * 
 * 文件结构：
 * - types.ts: 类型定义
 * - runtime.tsx: Runtime Provider 和 Hooks
 * - Renderer.tsx: 组件渲染器
 * - components/: 基础组件库
 */

// ============================================
// 1. Runtime 导出
// ============================================

export {
  AGUIRuntimeProvider,
  useAGUI,
  useAGUIEvent,
} from './runtime';

export type {
  AGUIAction,
  AGUIResponse,
  AGUIComponent,
  AGUIRuntimeConfig,
  AGUIRuntimeState,
  AGUIComponentType,
  AGUIContextValue,
} from './types';

// ============================================
// 2. Renderer 导出
// ============================================

export {
  AGUIRenderer,
} from './Renderer';

export {
  AGUISurface,
  AGUILoading,
  AGUIError,
} from './components';

// ============================================
// 3. 组件库导出
// ============================================

export * from './components';
