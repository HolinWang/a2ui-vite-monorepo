/**
 * AG-UI Image 组件
 */

import React, { useState } from 'react';

interface ImageProps {
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  fit?: 'cover' | 'contain' | 'fill';
  fallback?: string;
  className?: string;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt = '',
  width,
  height,
  fit = 'cover',
  fallback,
  className = '',
}) => {
  const [error, setError] = useState(false);

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || 'auto',
  };

  const fallbackSrc = fallback || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij7lm77niI8L3RleHQ+PC9zdmc+';

  return (
    <img
      src={error ? fallbackSrc : src}
      alt={alt}
      style={style}
      className={`${objectFitClasses[fit]} ${className}`}
      onError={() => setError(true)}
    />
  );
};

export default Image;
