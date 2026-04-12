/**
 * AG-UI 示例组件
 * 展示如何在项目中使用 AG-UI Runtime
 */

import React from 'react';
import {
  AGUIRuntimeProvider,
  useAGUI,
  AGUISurface,
  AGUILoading,
  AGUIError,
} from '../ag-ui';
import type { Transaction } from '../types';

interface AGUIExampleProps {
  transactions: Transaction[];
  selectedIds: string[];
}

/**
 * AG-UI 内容组件
 */
const AGUIContent: React.FC = () => {
  const { state, clearError } = useAGUI();

  if (state.error) {
    return <AGUIError error={state.error} onDismiss={clearError} />;
  }

  if (state.loading) {
    return <AGUILoading message="AI 正在处理..." />;
  }

  if (state.components.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>点击上方按钮触发 Action</p>
        <p className="text-sm mt-2">Agent 将返回新的 UI 组件</p>
      </div>
    );
  }

  return <AGUISurface components={state.components} />;
};

/**
 * AG-UI 操作按钮面板
 */
const AGUIActionPanel: React.FC<{ transactions: Transaction[]; selectedIds: string[] }> = ({
  transactions,
  selectedIds,
}) => {
  const { dispatch, state } = useAGUI();

  const handleAnalyzeRisk = () => {
    dispatch({
      action: 'analyzeRisk',
      params: {},
      context: {
        selectedIds,
        data: { transactions },
      },
    });
  };

  const handleExport = () => {
    dispatch({
      action: 'exportReport',
      params: { format: 'pdf' },
      context: {
        selectedIds,
        data: state.state,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">AG-UI Action 面板</h3>
      <p className="text-sm text-gray-600 mb-4">
        点击按钮触发 Action，Agent 返回新的 UI 组件
      </p>
      <div className="flex gap-3">
        <button
          onClick={handleAnalyzeRisk}
          disabled={selectedIds.length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          🔍 风险分析
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          📥 导出报告
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        已选择 {selectedIds.length} 笔交易 | 当前 state: {JSON.stringify(state.state).slice(0, 50)}...
      </p>
    </div>
  );
};

/**
 * AG-UI 示例主组件
 */
export const AGUIExample: React.FC<AGUIExampleProps> = ({ transactions, selectedIds }) => {
  return (
    <AGUIRuntimeProvider config={{ agentEndpoint: '/api/agent/dispatch' }}>
      <div className="space-y-4">
        {/* Action 按钮面板 */}
        <AGUIActionPanel transactions={transactions} selectedIds={selectedIds} />

        {/* AG-UI Surface */}
        <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
          <AGUIContent />
        </div>

        {/* 协议说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">AG-UI 协议说明</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• <strong>Agent（后端）</strong>：负责决策，执行业务逻辑，返回 AG-UI 组件</p>
            <p>• <strong>Runtime（前端）</strong>：负责解析组件，绑定事件，调用 Agent</p>
            <p>• <strong>流程</strong>：用户点击 → dispatch(action) → Agent → 返回新 UI → Runtime 渲染</p>
          </div>
        </div>
      </div>
    </AGUIRuntimeProvider>
  );
};

export default AGUIExample;
