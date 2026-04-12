/**
 * AG-UI 渲染器
 * 
 * 将 AG-UI 组件 Schema 渲染为 React 组件
 */

import React, { useCallback } from 'react';
import { AGUIComponent } from './types';
import { useAGUI } from './runtime';

// ============================================
// 1. AG-UI Renderer Props
// ============================================

interface AGUIRendererProps {
  component: AGUIComponent;
  depth?: number;
}

/**
 * AG-UI Renderer 组件
 * 
 * 递归渲染 AG-UI 组件树
 */
export const AGUIRenderer: React.FC<AGUIRendererProps> = ({ component, depth = 0 }) => {
  const { dispatch, state } = useAGUI();
  const { type, props = {}, children, id, events } = component;

  // 处理 click 事件
  const handleClick = useCallback(() => {
    if (events?.onClick) {
      dispatch({
        action: events.onClick,
        params: props,
        context: {
          selectedIds: (state as unknown as { selectedIds?: string[] }).selectedIds,
          data: state.state,
        },
      });
    }
  }, [events, dispatch, props, state]);

  // 处理 change 事件
  const handleChange = useCallback((value: unknown) => {
    if (events?.onChange) {
      dispatch({
        action: events.onChange,
        params: { ...props, value },
        context: { data: state.state },
      });
    }
  }, [events, dispatch, props, state]);

  // 渲染子组件
  const renderChildren = () => {
    if (!children) return null;
    return children.map((child, idx) => (
      <AGUIRenderer key={child.id || idx} component={child} depth={depth + 1} />
    ));
  };

  // 渲染组件
  switch (type) {
    // 基础容器
    case 'div':
      return (
        <div 
          id={id} 
          className={props.className as string} 
          style={props.style as React.CSSProperties} 
          onClick={handleClick}
        >
          {props.children as string || renderChildren()}
        </div>
      );

    case 'span':
      return (
        <span 
          id={id} 
          className={props.className as string} 
          style={props.style as React.CSSProperties} 
          onClick={handleClick}
        >
          {props.text as string || renderChildren()}
        </span>
      );

    case 'container':
      return (
        <div 
          id={id} 
          className={`container mx-auto ${props.className as string || ''}`}
          style={props.style as React.CSSProperties}
        >
          {renderChildren()}
        </div>
      );

    // 按钮
    case 'button':
      return (
        <button
          id={id}
          className={props.className as string || 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'}
          style={props.style as React.CSSProperties}
          onClick={handleClick}
          disabled={props.disabled as boolean}
        >
          {props.text as string || props.children as string}
        </button>
      );

    // 表单组件
    case 'input':
      return (
        <input
          id={id}
          type={props.type as string || 'text'}
          className={props.className as string || 'border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500'}
          style={props.style as React.CSSProperties}
          placeholder={props.placeholder as string}
          value={(props.value as string) || ''}
          disabled={props.disabled as boolean}
          onChange={(e) => handleChange(e.target.value)}
        />
      );

    case 'select':
      const options = props.options as Array<{ label: string; value: string }> || [];
      return (
        <select
          id={id}
          className={props.className as string || 'border border-gray-300 rounded px-3 py-2'}
          style={props.style as React.CSSProperties}
          value={(props.value as string) || ''}
          disabled={props.disabled as boolean}
          onChange={(e) => handleChange(e.target.value)}
        >
          {options.map((opt, idx) => (
            <option key={idx} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'checkbox':
      return (
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={(props.checked as boolean) || false}
            disabled={props.disabled as boolean}
            onChange={(e) => handleChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          {props.label ? <span>{String(props.label)}</span> : null}
        </label>
      );

    // 卡片
    case 'card':
      return (
        <div
          id={id}
          className={(props.className as string) || 'bg-white rounded-lg shadow p-4 mb-4'}
          style={props.style as React.CSSProperties}
        >
          {props.title ? <h3 className="text-lg font-semibold mb-2">{String(props.title)}</h3> : null}
          {renderChildren()}
        </div>
      );

    // 表格
    case 'table':
      const headers = props.headers as string[] || [];
      const rows = props.rows as string[][] || [];
      return (
        <div className={props.className as string || 'overflow-x-auto'}>
          <table className="min-w-full divide-y divide-gray-200 border">
            {headers.length > 0 && (
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header, idx) => (
                    <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-2 text-sm text-gray-900">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="text-center py-8 text-gray-500">暂无数据</div>
          )}
        </div>
      );

    // 网格布局
    case 'grid':
      const cols = (props.columns as number) || 3;
      return (
        <div
          className={`grid gap-4 ${props.className as string || ''}`}
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {renderChildren()}
        </div>
      );

    // 统计卡片
    case 'statistic':
      const statusColors: Record<string, string> = {
        success: 'text-green-600',
        warning: 'text-yellow-600',
        danger: 'text-red-600',
      };
      return (
        <div className={`text-center p-4 ${props.className || ''}`}>
          <p className="text-sm text-gray-500">{props.label as string}</p>
          <p className={`text-2xl font-bold ${statusColors[props.status as string] || 'text-gray-900'}`}>
            {props.prefix as string}{String(props.value)}{props.suffix as string}
          </p>
        </div>
      );

    // 警告提示
    case 'alert':
      const alertStyles: Record<string, { bg: string; border: string; text: string }> = {
        info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
        success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
        warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
        error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
      };
      const alertStyle = alertStyles[props.type as string] || alertStyles.info;
      return (
        <div className={`border rounded-lg p-4 mb-4 ${alertStyle.bg} ${alertStyle.border}`}>
          <p className={alertStyle.text}>{props.message as string}</p>
          {renderChildren()}
        </div>
      );

    // 徽章
    case 'badge':
      const badgeStyles: Record<string, string> = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
      };
      return (
        <span
          id={id}
          className={`inline-block px-2 py-1 text-xs rounded-full ${badgeStyles[props.type as string] || 'bg-gray-100 text-gray-800'}`}
        >
          {props.text as string}
        </span>
      );

    // 标签
    case 'tag':
      const tagColors: Record<string, string> = {
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        red: 'bg-red-100 text-red-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        purple: 'bg-purple-100 text-purple-800',
        gray: 'bg-gray-100 text-gray-800',
      };
      return (
        <span
          id={id}
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${tagColors[props.color as string] || 'bg-gray-100 text-gray-800'}`}
        >
          {props.text as string}
        </span>
      );

    // 文本
    case 'text':
      const textTypes: Record<string, string> = {
        h1: 'text-3xl font-bold',
        h2: 'text-2xl font-bold',
        h3: 'text-xl font-semibold',
        h4: 'text-lg font-medium',
        p: 'text-base',
        span: 'text-base',
      };
      const TextTag = (props.type as 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span') || 'p';
      return (
        <TextTag className={`${textTypes[props.type as string] || 'text-base'} text-gray-900`}>
          {props.content as string || renderChildren()}
        </TextTag>
      );

    // 加载状态
    case 'loading':
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">{props.message as string || '加载中...'}</span>
        </div>
      );

    // 分割线
    case 'divider':
      return (
        <hr className={`border-gray-200 my-4 ${props.className || ''}`} />
      );

    // 列表
    case 'list':
      const items = props.items as Array<{ key?: string; content?: string }> || [];
      return (
        <ul className={`space-y-2 ${props.className || ''}`}>
          {items.map((item, idx) => (
            <li key={item.key || idx}>{item.content}</li>
          ))}
        </ul>
      );

    // 进度条
    case 'progress':
      const percent = (props.percent as number) || 0;
      return (
        <div className={`w-full ${props.className || ''}`}>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
          </div>
          {props.showText !== false && (
            <p className="text-sm text-gray-600 mt-1 text-right">{Math.round(percent)}%</p>
          )}
        </div>
      );

    // 默认未知组件
    default:
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-700">未知组件类型: {type}</p>
          <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(props, null, 2)}</pre>
        </div>
      );
  }
};

// ============================================
// 2. 导出
// ============================================
