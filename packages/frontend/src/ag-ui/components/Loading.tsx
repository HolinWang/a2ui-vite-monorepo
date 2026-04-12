/**
 * AG-UI Loading 组件
 */

import React from 'react';
import type { AGUILoadingProps } from '../types';

export const Loading: React.FC<AGUILoadingProps> = ({
  message = '加载中...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-spin"
          style={{ borderTopColor: 'transparent' }}
        ></div>
      </div>
      {message && (
        <p className="mt-4 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default Loading;
