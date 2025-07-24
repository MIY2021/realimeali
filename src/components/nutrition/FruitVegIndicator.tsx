import React from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FruitVegIndicatorProps {
  portions: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  className?: string;
}

export const FruitVegIndicator: React.FC<FruitVegIndicatorProps> = ({
  portions,
  size = 'medium',
  showLabel = true,
  className
}) => {
  const maxPortions = 5;
  const percentage = Math.min((portions / maxPortions) * 100, 100);
  
  const sizeConfig = {
    small: { 
      container: 'w-8 h-8', 
      text: 'text-xs', 
      icon: 'w-3 h-3',
      stroke: 2
    },
    medium: { 
      container: 'w-12 h-12', 
      text: 'text-sm', 
      icon: 'w-4 h-4',
      stroke: 3
    },
    large: { 
      container: 'w-16 h-16', 
      text: 'text-base', 
      icon: 'w-5 h-5',
      stroke: 4
    }
  };

  const config = sizeConfig[size];
  
  // Color based on how close to 5-a-day goal
  const getColor = (percentage: number) => {
    if (percentage >= 100) return 'hsl(var(--primary))'; // Full goal achieved
    if (percentage >= 60) return 'hsl(142, 76%, 36%)'; // Good progress (green)
    if (percentage >= 40) return 'hsl(45, 93%, 47%)'; // Moderate (orange)
    return 'hsl(220, 13%, 69%)'; // Low (muted)
  };

  const color = getColor(percentage);
  const circumference = 2 * Math.PI * 16; // radius = 16
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative flex items-center justify-center", config.container)}>
        {/* Background circle */}
        <svg 
          className="absolute inset-0 w-full h-full transform -rotate-90"
          viewBox="0 0 40 40"
        >
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={config.stroke}
            opacity="0.2"
          />
          {/* Progress circle */}
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke={color}
            strokeWidth={config.stroke}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        
        {/* Heart icon in center representing health/nutrition */}
        <Heart
          className={cn(config.icon, "text-muted-foreground")} 
          style={{ color }} 
        />
      </div>
      
      {showLabel && (
        <div className="flex flex-col">
          <span className={cn("font-medium", config.text)} style={{ color }}>
            {portions}/{maxPortions}
          </span>
          {size !== 'small' && (
            <span className="text-xs text-muted-foreground">
              of your 5-a-day
            </span>
          )}
        </div>
      )}
    </div>
  );
};