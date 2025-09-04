import React from 'react';
import { Link } from 'react-router-dom';

interface XnemaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function XnemaLogo({ size = 'md', className = '' }: XnemaLogoProps) {
  const sizes = {
    sm: {
      icon: 'w-6 h-6',
      text: 'text-xl',
      container: 'space-x-2'
    },
    md: {
      icon: 'w-10 h-10',
      text: 'text-3xl',
      container: 'space-x-3'
    },
    lg: {
      icon: 'w-16 h-16',
      text: 'text-5xl',
      container: 'space-x-4'
    }
  };

  const config = sizes[size];

  return (
    <Link to="/" className={`flex items-center ${config.container} ${className}`}>
      <div className={`${config.icon} bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-xl flex items-center justify-center shadow-lg`}>
        <span className="text-white font-black text-xl">X</span>
      </div>
      <div className="flex items-center">
        <span className={`${config.text} font-black text-white`}>X</span>
        <span className={`${config.text.replace('text-3xl', 'text-2xl').replace('text-5xl', 'text-4xl').replace('text-xl', 'text-lg')} font-bold text-foreground`}>NEMA</span>
      </div>
    </Link>
  );
}
