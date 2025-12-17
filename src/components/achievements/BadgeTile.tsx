import { Achievement } from '@/types/achievements';
import { getBadgeColor } from '@/lib/badgeColors';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { Circle } from 'lucide-react';

interface BadgeTileProps {
  achievement: Achievement;
  onClick: () => void;
  index: number;
}

export const BadgeTile = ({ achievement, onClick, index }: BadgeTileProps) => {
  const { name, category, iconName, isUnlocked, progress } = achievement;
  const color = getBadgeColor(category);
  
  // Get the icon component dynamically
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Circle;

  // Calculate stroke dasharray for circular progress
  const radius = 50; // For h-[92px] badge
  const circumference = 2 * Math.PI * radius;
  const progressOffset = progress ? circumference - (progress.percentage / 100) * circumference : circumference;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg motion-reduce:transition-none motion-reduce:hover:scale-100"
      aria-pressed={isUnlocked}
      aria-label={`${name} — ${isUnlocked ? 'unlocked' : 'locked'}`}
      type="button"
      style={{
        animation: `fadeInScale 300ms ease-out ${index * 30}ms both`
      }}
    >
      <div className="relative">
        {/* Progress ring for locked achievements */}
        {!isUnlocked && progress && progress.percentage > 0 && (
          <svg 
            className="absolute inset-0 -rotate-90 h-[92px] w-[92px] sm:h-[108px] sm:w-[108px]"
            style={{ transform: 'rotate(-90deg)' }}
          >
            <circle
              cx="46"
              cy="46"
              r="44"
              stroke={color.base}
              strokeWidth="3"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              className="transition-all duration-300 opacity-60"
            />
          </svg>
        )}
        
        <div
          className={cn(
            "relative h-[92px] w-[92px] sm:h-[108px] sm:w-[108px] rounded-full shadow-[0_6px_14px_rgba(0,0,0,0.08)] flex items-center justify-center",
            isUnlocked
              ? "ring-2 ring-white/60 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-t before:from-black/0 before:to-white/30 before:opacity-60 after:absolute after:inset-[6px] after:rounded-full after:ring-2 after:ring-white/40"
              : "grayscale opacity-60"
          )}
          style={{
            background: isUnlocked
              ? `linear-gradient(135deg, ${color.light} 0%, ${color.dark} 100%)`
              : 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
          }}
        >
          <IconComponent 
            className={cn(
              "h-12 w-12 sm:h-14 sm:w-14 relative z-10",
              isUnlocked ? "text-white drop-shadow-sm" : "text-white/60"
            )} 
          />
          {!isUnlocked && (
            <Circle className="absolute right-1 bottom-1 h-4 w-4 fill-gray-700/80 text-gray-700/80 z-20" />
          )}
        </div>
      </div>
      
      <p className={cn(
        "text-xs font-semibold text-center leading-tight",
        isUnlocked ? "text-foreground" : "text-muted-foreground"
      )}>
        {name}
      </p>
    </button>
  );
};
