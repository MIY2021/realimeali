import React from 'react';
import { cn } from '@/lib/utils';

interface FruitVegIndicatorProps {
  portions: number;
  size?: 'tiny' | 'small' | 'medium' | 'large';
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
  const filledCircles = Math.floor(portions);
  const partialCircle = portions - filledCircles;
  
  const sizeConfig = {
    tiny: { 
      circle: 'w-1.5 h-1.5',
      gap: 'gap-0.5', 
      text: 'text-[10px]'
    },
    small: { 
      circle: 'w-2 h-2',
      gap: 'gap-1', 
      text: 'text-xs'
    },
    medium: { 
      circle: 'w-3 h-3',
      gap: 'gap-1', 
      text: 'text-sm'
    },
    large: { 
      circle: 'w-4 h-4',
      gap: 'gap-1.5', 
      text: 'text-base'
    }
  };

  const config = sizeConfig[size];
  
  // Color based on how close to 5-a-day goal
  const getColor = (isFilled: boolean, isPartial: boolean = false) => {
    if (!isFilled && !isPartial) return 'hsl(var(--muted))';
    
    const percentage = (portions / maxPortions) * 100;
    if (percentage >= 100) return 'hsl(var(--primary))'; // Full goal achieved
    if (percentage >= 60) return 'hsl(142, 76%, 36%)'; // Good progress (green)
    if (percentage >= 40) return 'hsl(45, 93%, 47%)'; // Moderate (orange)
    return 'hsl(220, 13%, 69%)'; // Low (muted)
  };

  const activeColor = getColor(true);
  const inactiveColor = getColor(false);

  return (
    <div className={cn("flex items-center", config.gap, className)}>
      {/* 5 circles representing portions */}
      <div className={cn("flex items-center", config.gap)}>
        {Array.from({ length: maxPortions }, (_, index) => {
          const isFilled = index < filledCircles;
          const isPartial = index === filledCircles && partialCircle > 0;
          
          return (
            <div
              key={index}
              className={cn(
                "rounded-full transition-all duration-300",
                config.circle
              )}
              style={{
                backgroundColor: isFilled || isPartial ? activeColor : inactiveColor,
                opacity: isPartial ? 0.5 + (partialCircle * 0.5) : 1
              }}
            />
          );
        })}
      </div>
      
      {showLabel && (
        <span className={cn("font-medium ml-2", config.text)} style={{ color: activeColor }}>
          {portions}/{maxPortions}
        </span>
      )}
    </div>
  );
};