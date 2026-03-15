import React from 'react';
import { Check, Clock, X, Minus } from 'lucide-react';

interface TimelineItem {
  time: string;
  title: string;
  description?: string;
  status?: 'success' | 'processing' | 'error' | 'default';
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  items,
  className = ''
}) => {
  const statusConfig = {
    success: {
      icon: <Check className="w-3 h-3" />,
      bgColor: 'bg-green-500',
      textColor: 'text-green-600'
    },
    processing: {
      icon: <Clock className="w-3 h-3" />,
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    error: {
      icon: <X className="w-3 h-3" />,
      bgColor: 'bg-red-500',
      textColor: 'text-red-600'
    },
    default: {
      icon: <Minus className="w-3 h-3" />,
      bgColor: 'bg-gray-400',
      textColor: 'text-gray-600'
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => {
        const config = statusConfig[item.status || 'default'];
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex gap-3">
            {/* 时间线轴 */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-6 h-6 rounded-full ${config.bgColor} text-white flex items-center justify-center flex-shrink-0`}>
                {config.icon}
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-gray-200 min-h-[30px]" />
              )}
            </div>
            
            {/* 内容 */}
            <div className={`flex-1 min-w-0 pb-3 ${isLast ? 'pb-0' : ''}`}>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {item.time}
                </span>
                <span className={`text-sm font-medium ${config.textColor}`}>
                  {item.title}
                </span>
              </div>
              {item.description && (
                <p className="text-sm text-gray-500 break-words">{item.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
