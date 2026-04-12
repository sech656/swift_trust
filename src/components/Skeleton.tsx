'use client';

import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  variant?: 'text' | 'title' | 'avatar' | 'button' | 'rect';
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export default function Skeleton({ variant = 'text', width, height, className = '', style }: SkeletonProps) {
  const combinedStyle = {
    width: width,
    height: height,
    ...style,
  };

  return (
    <div 
      className={`${styles.skeleton} ${styles[variant]} ${className}`} 
      style={combinedStyle}
    />
  );
}
