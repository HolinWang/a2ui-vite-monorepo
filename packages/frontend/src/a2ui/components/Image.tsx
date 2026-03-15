import React from 'react';

interface ImageProps {
  src: string;
  alt?: string;
  width?: string;
  height?: string;
  fit?: 'cover' | 'contain' | 'fill' | 'none';
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt = '',
  width,
  height,
  fit = 'cover',
}) => {
  const fitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`max-w-full ${fitClasses[fit]}`}
      style={{ width, height }}
    />
  );
};
