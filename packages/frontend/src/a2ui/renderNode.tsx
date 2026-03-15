/**
 * A2UI 渲染引擎
 * 将 UI Schema（JSON）转换为 React 组件树
 */

import React from 'react';
import { UISchema, RenderContext } from './types';
import { getComponentDefinition } from './componentCatalog';
import { executeToolCall } from './tools';

// 导入所有组件
import {
  Card,
  Grid,
  Stack,
  Divider,
  Container,
  Box,
  Div,
  Text,
  Table,
  List,
  Badge,
  Image,
  Statistic,
  Descriptions,
  Timeline,
  Tag,
  Alert,
  Progress,
  Spinner,
  Input,
  Button,
  Select,
  Checkbox,
  Radio,
  Form,
  Tabs,
  Breadcrumb,
} from './components';

/**
 * 组件映射表
 * 将组件名称映射到实际的 React 组件
 */
const componentMap: Record<string, React.ComponentType<any>> = {
  // 布局组件
  Card,
  Container,
  Grid,
  Stack,
  Divider,
  Box,
  Div,
  div: Div,
  span: Div,
  section: Div,
  article: Div,
  
  // 表单组件
  Input,
  Button,
  Select,
  Checkbox,
  Radio,
  Form,
  
  // 展示组件
  Text,
  Table,
  List,
  Badge,
  Image,
  Statistic,
  Descriptions,
  Timeline,
  Tag,
  
  // 反馈组件
  Alert,
  Progress,
  Spinner,
  
  // 导航组件
  Tabs,
  Breadcrumb,
};

/**
 * 渲染单个节点
 * 核心：递归渲染 UI Schema 树
 */
export function renderNode(
  node: UISchema,
  context: RenderContext = {}
): React.ReactNode {
  // 支持 type 和 component 两种字段名
  const componentName = node.component || (node as any).type;
  
  if (!componentName) {
    return null;
  }

  // 1. 检查条件渲染
  if (node.condition && !evaluateCondition(node.condition, context)) {
    return null;
  }

  // 2. 检查是否是工具调用
  // 格式1: { type: "createTransactionSummary", props: {...} }
  // 格式2: { type: "Tool", name: "createTransactionSummary", params: {...} }
  if (componentName === 'Tool' || componentName.startsWith('create')) {
    const toolName = componentName === 'Tool' ? (node as any).name : componentName;
    const toolArgs = componentName === 'Tool' ? (node as any).params : node.props;
    
    if (toolName && toolName.startsWith('create')) {
      const result = executeToolCall(toolName, toolArgs || {});
      return renderNode(result.schema, context);
    }
  }

  // 3. 获取组件定义
  const componentDef = getComponentDefinition(componentName);
  if (!componentDef) {
    console.warn(`Unknown component: ${componentName}`);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-600 text-sm">未知组件: {componentName}</p>
      </div>
    );
  }

  // 4. 获取实际的 React 组件
  const Component = componentMap[componentName];
  if (!Component) {
    console.warn(`Component not implemented: ${componentName}`);
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-600 text-sm">组件未实现: ${componentName}</p>
      </div>
    );
  }

  // 5. 处理循环渲染
  if (node.repeat) {
    const data = getNestedValue(context.data || {}, node.repeat.dataSource);
    if (!Array.isArray(data)) {
      console.warn(`Repeat data source is not an array: ${node.repeat.dataSource}`);
      return null;
    }

    return data.map((item, index) => {
      const childContext: RenderContext = {
        ...context,
        data: {
          ...context.data,
          [node.repeat!.itemKey || 'item']: item,
          [node.repeat!.indexKey || 'index']: index,
        },
      };
      return (
        <React.Fragment key={index}>
          {renderNode(
            { ...node, repeat: undefined }, // 移除 repeat 属性避免无限循环
            childContext
          )}
        </React.Fragment>
      );
    });
  }

  // 5. 处理 props 插值
  const resolvedProps = resolveProps(node.props || {}, context);

  // 6. 递归渲染子节点
  let children: React.ReactNode = null;
  
  if (node.children !== undefined && node.children !== null) {
    if (Array.isArray(node.children)) {
      // children 是数组
      children = node.children.map((child, index) => (
        <React.Fragment key={index}>{renderNode(child, context)}</React.Fragment>
      ));
    } else if (typeof node.children === 'object') {
      // children 是单个对象（嵌套的 Schema）
      children = renderNode(node.children as UISchema, context);
    } else if (typeof node.children === 'string') {
      // children 是纯文本
      children = node.children;
    }
  }

  // 7. 渲染组件
  return <Component {...resolvedProps}>{children}</Component>;
}

/**
 * 评估条件渲染
 */
function evaluateCondition(
  condition: UISchema['condition'],
  context: RenderContext
): boolean {
  if (!condition) return true;

  const value = getNestedValue(context.data || {}, condition.field);

  switch (condition.operator) {
    case 'eq':
      return value === condition.value;
    case 'neq':
      return value !== condition.value;
    case 'gt':
      return value > condition.value;
    case 'lt':
      return value < condition.value;
    case 'gte':
      return value >= condition.value;
    case 'lte':
      return value <= condition.value;
    case 'exists':
      return value !== undefined && value !== null;
    default:
      return true;
  }
}

/**
 * 解析 props 中的插值表达式
 */
function resolveProps(
  props: Record<string, any>,
  context: RenderContext
): Record<string, any> {
  const resolved: Record<string, any> = {};

  Object.entries(props).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // 处理模板字符串 {{data.field}}
      resolved[key] = resolveTemplateString(value, context);
    } else if (Array.isArray(value)) {
      resolved[key] = value.map((item) =>
        typeof item === 'string' ? resolveTemplateString(item, context) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      resolved[key] = resolveProps(value, context);
    } else {
      resolved[key] = value;
    }
  });

  return resolved;
}

/**
 * 解析模板字符串
 * 支持 {{data.field}} 格式
 */
function resolveTemplateString(template: string, context: RenderContext): string {
  const regex = /\{\{([^}]+)\}\}/g;
  return template.replace(regex, (match, path) => {
    const value = getNestedValue(context.data || {}, path.trim());
    return value !== undefined ? String(value) : match;
  });
}

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object') {
      return acc[part];
    }
    return undefined;
  }, obj);
}

/**
 * 渲染 UI Schema（入口函数）
 */
export function renderUISchema(
  schema: UISchema | UISchema[],
  context: RenderContext = {}
): React.ReactNode {
  if (Array.isArray(schema)) {
    return schema.map((node, index) => (
      <React.Fragment key={index}>{renderNode(node, context)}</React.Fragment>
    ));
  }

  return renderNode(schema, context);
}

/**
 * 创建组件注册表映射
 */
export function createComponentRegistry(): Record<string, React.ComponentType<any>> {
  return componentMap;
}
