/**
 * AG-UI Runtime
 * 
 * 核心概念：
 * - Agent 负责决策（做什么）
 * - Runtime（前端）负责执行（怎么触发、怎么渲染）
 * 
 * 核心流程：
 * 1. dispatch(action) - 触发 Action
 * 2. 调用 Agent API
 * 3. 接收流式响应
 * 4. 更新组件和状态
 */

import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import {
  AGUIAction,
  AGUIResponse,
  AGUIComponent,
  AGUIRuntimeConfig,
  AGUIRuntimeState,
  AGUIRuntimeAction,
  AGUIContextValue,
} from './types';

// ============================================
// 1. Context
// ============================================

const AGUIContext = createContext<AGUIContextValue | null>(null);

// ============================================
// 2. Reducer
// ============================================

function aguiReducer(state: AGUIRuntimeState, action: AGUIRuntimeAction): AGUIRuntimeState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_COMPONENTS':
      return { ...state, components: action.payload, loading: false };
    case 'UPDATE_STATE':
      return { ...state, state: { ...state.state, ...action.payload } };
    case 'ADD_TO_HISTORY':
      return { ...state, history: [...state.history, action.payload] };
    case 'RESET':
      return {
        ...state,
        components: [],
        state: {},
        loading: false,
        error: null,
      };
    default:
      return state;
  }
}

// ============================================
// 3. AG-UI Runtime Provider
// ============================================

export const AGUIRuntimeProvider: React.FC<{
  config: AGUIRuntimeConfig;
  initialComponents?: AGUIComponent[];
  children: React.ReactNode;
}> = ({ config, initialComponents = [], children }) => {
  const [state, dispatchState] = useReducer(aguiReducer, {
    components: initialComponents,
    state: {},
    loading: false,
    error: null,
    history: [],
  });

  // 事件绑定表：componentId:eventName -> action
  const eventBindings = useRef<Map<string, AGUIAction>>(new Map());

  /**
   * 执行 Action（核心方法）
   * 流程：dispatch(action) → 调用 Agent → 更新 UI
   */
  const dispatch = useCallback(async (action: AGUIAction) => {
    // 1. 记录到历史
    dispatchState({ type: 'ADD_TO_HISTORY', payload: action });
    
    // 2. 设置加载状态
    dispatchState({ type: 'SET_LOADING', payload: true });
    dispatchState({ type: 'SET_ERROR', payload: null });

    try {
      // 3. 调用 Agent API
      const response = await fetch(config.agentEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });

      if (!response.ok) {
        throw new Error(`Agent API error: ${response.status}`);
      }

      // 4. 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = '';
        let finalComponents: AGUIComponent[] = [];
        let finalState: Record<string, unknown> = {};

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // 尝试解析完整的 JSON 行
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const response: AGUIResponse = JSON.parse(line);

              switch (response.type) {
                case 'update':
                  if (response.components) {
                    finalComponents = response.components;
                  }
                  if (response.state) {
                    finalState = { ...finalState, ...response.state };
                  }
                  break;
                case 'error':
                  dispatchState({ type: 'SET_ERROR', payload: response.error || 'Unknown error' });
                  return;
                case 'complete':
                  // 最终更新
                  if (finalComponents.length > 0) {
                    dispatchState({ type: 'UPDATE_COMPONENTS', payload: finalComponents });
                  }
                  if (Object.keys(finalState).length > 0) {
                    dispatchState({ type: 'UPDATE_STATE', payload: finalState });
                  }
                  break;
              }
            } catch {
              // 忽略解析错误，继续处理下一行
            }
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Agent call failed';
      dispatchState({ type: 'SET_ERROR', payload: errorMessage });
      config.onError?.(errorMessage);
    }
  }, [config]);

  /**
   * 绑定事件到组件
   */
  const bindEvent = useCallback((componentId: string, eventName: string, action: AGUIAction) => {
    const key = `${componentId}:${eventName}`;
    eventBindings.current.set(key, action);
  }, []);

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    dispatchState({ type: 'SET_ERROR', payload: null });
  }, []);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    dispatchState({ type: 'RESET' });
    eventBindings.current.clear();
  }, []);

  return (
    <AGUIContext.Provider value={{ state, dispatch, bindEvent, clearError, reset }}>
      {children}
    </AGUIContext.Provider>
  );
};

// ============================================
// 4. Hooks
// ============================================

/**
 * 使用 AG-UI Runtime
 */
export function useAGUI(): AGUIContextValue {
  const context = useContext(AGUIContext);
  if (!context) {
    throw new Error('useAGUI must be used within AGUIRuntimeProvider');
  }
  return context;
}

/**
 * 获取事件绑定
 */
export function useAGUIEvent(componentId: string, eventName: string) {
  const { dispatch, state } = useAGUI();
  
  const handleEvent = useCallback(() => {
    // 从组件的 events 中获取 action
    const component = findComponent(state.components, componentId);
    if (component?.events?.[eventName]) {
      dispatch({
        action: component.events[eventName],
        params: {},
        context: { data: state.state },
      });
    }
  }, [componentId, eventName, dispatch, state]);

  return { handleEvent };
}

// ============================================
// 5. 辅助函数
// ============================================

/**
 * 查找组件
 */
function findComponent(components: AGUIComponent[], id: string): AGUIComponent | null {
  for (const comp of components) {
    if (comp.id === id) return comp;
    if (comp.children) {
      const found = findComponent(comp.children, id);
      if (found) return found;
    }
  }
  return null;
}
