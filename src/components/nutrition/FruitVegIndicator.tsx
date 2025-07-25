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
  const hasPartialCircle = partialCircle > 0;
  
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
          const isPartial = index === filledCircles && hasPartialCircle;
          
          return (
            <div
              key={index}
              className={cn(
                "rounded-full border-2 transition-all duration-300 relative overflow-hidden",
                config.circle
              )}
              style={{
                borderColor: isFilled || isPartial ? activeColor : inactiveColor,
                backgroundColor: isFilled ? activeColor : 'transparent',
              }}
            >
              {isPartial && (
                <div
                  className="absolute top-0 left-0 h-full transition-all duration-300"
                  style={{
                    width: `${partialCircle * 100}%`,
                    backgroundColor: activeColor,
                    borderRight: size === 'tiny' || size === 'small' ? `1px solid ${activeColor}` : 'none',
                    boxShadow: size === 'tiny' || size === 'small' ? `inset -1px 0 0 ${activeColor}` : 'none',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {showLabel && (
        <span className={cn("font-medium", config.text)} style={{ color: activeColor }}>
          {portions}/{maxPortions}
        </span>
      )}
    </div>
  );
};