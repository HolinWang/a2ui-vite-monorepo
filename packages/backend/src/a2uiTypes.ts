// A2UI 消息类型定义

// 基础消息结构
interface BaseMessage {
  type: string;
}

// 1. surfaceUpdate - 更新 UI
export interface SurfaceUpdateMessage extends BaseMessage {
  type: 'surfaceUpdate';
  components: A2UIComponent[];
  surfaceId?: string; // 可选的 Surface ID，用于指定更新哪个 Surface
}

// 2. dataModelUpdate - 更新数据状态
export interface DataModelUpdateMessage extends BaseMessage {
  type: 'dataModelUpdate';
  data: Record<string, any>;
  surfaceId?: string;
}

// 3. beginRendering - 开始渲染
export interface BeginRenderingMessage extends BaseMessage {
  type: 'beginRendering';
  surfaceId?: string;
  message?: string; // 可选的提示消息
}

// 4. deleteSurface - 删除 UI
export interface DeleteSurfaceMessage extends BaseMessage {
  type: 'deleteSurface';
  surfaceId?: string;
  message?: string; // 可选的提示消息
}

// A2UI 消息联合类型
export type A2UIMessage = 
  | SurfaceUpdateMessage 
  | DataModelUpdateMessage 
  | BeginRenderingMessage 
  | DeleteSurfaceMessage;

// A2UI 组件类型
export interface A2UIComponent {
  component: string;
  props?: Record<string, any>;
  children?: A2UIComponent[];
}

// 辅助函数：创建 surfaceUpdate 消息
export function createSurfaceUpdate(components: A2UIComponent[], surfaceId?: string): SurfaceUpdateMessage {
  return {
    type: 'surfaceUpdate',
    components,
    surfaceId,
  };
}

// 辅助函数：创建 dataModelUpdate 消息
export function createDataModelUpdate(data: Record<string, any>, surfaceId?: string): DataModelUpdateMessage {
  return {
    type: 'dataModelUpdate',
    data,
    surfaceId,
  };
}

// 辅助函数：创建 beginRendering 消息
export function createBeginRendering(surfaceId?: string, message?: string): BeginRenderingMessage {
  return {
    type: 'beginRendering',
    surfaceId,
    message,
  };
}

// 辅助函数：创建 deleteSurface 消息
export function createDeleteSurface(surfaceId?: string, message?: string): DeleteSurfaceMessage {
  return {
    type: 'deleteSurface',
    surfaceId,
    message,
  };
}

// 解析 A2UI 消息（从流式文本中解析）
export function parseA2UIMessage(text: string): A2UIMessage | null {
  try {
    const parsed = JSON.parse(text);
    if (['surfaceUpdate', 'dataModelUpdate', 'beginRendering', 'deleteSurface'].includes(parsed.type)) {
      return parsed as A2UIMessage;
    }
    return null;
  } catch {
    return null;
  }
}

// 检查是否为 A2UI 消息
export function isA2UIMessage(obj: any): obj is A2UIMessage {
  return obj && typeof obj === 'object' && 
    ['surfaceUpdate', 'dataModelUpdate', 'beginRendering', 'deleteSurface'].includes(obj.type);
}
