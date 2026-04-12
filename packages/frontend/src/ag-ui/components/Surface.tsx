/**
 * AG-UI Surface 组件
 * 
 * AG-UI Surface 是一个容器组件，用于渲染 AG-UI 组件树
 */

import React from 'react';
import { AGUIComponent } from '../types';
import { AGUIRenderer } from '../Renderer';

/**
 * AG-UI Surface Props
 */
export interface AGUISurfaceProps {
  components: AGUIComponent[];
  className?: string;
}

/**
 * AG-UI Surface 组件
 * 
 * 渲染 AG-UI 组件树的根容器
 */
export const Surface: React.FC<AGUISurfaceProps> = ({
  components,
  className = '',
}) => {
  if (!components || components.length === 0) {
    return null;
  }

  return (
    <div className={`ag-ui-surface ${className}`}>
      {components.map((component, index) => (
        <AGUIRenderer key={component.id || index} component={component} />
      ))}
    </div>
  );
};
