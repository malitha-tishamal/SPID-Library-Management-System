import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export default function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
  return (
    <Loader2 
      size={size} 
      className={cn("animate-spin text-accent", className)} 
    />
  );
}
