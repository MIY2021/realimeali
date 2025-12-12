import { Achievement } from '@/types/achievements';
import { getBadgeColor } from '@/lib/badgeColors';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { Circle, Sparkles, Share } from 'lucide-react';
import { format } from 'date-fns';

interface BadgeBottomSheetProps {
  achievement: Achievement | null;
  open: boolean;
  onClose: () => void;
}

export const BadgeBottomSheet = ({ achievement, open, onClose }: BadgeBottomSheetProps) => {
  if (!achievement) return null;

  const { name, category, summary, topTip, iconName, isUnlocked, unlockedAt } = achievement;
  const color = getBadgeColor(category);
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Circle;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="max-h-[85vh] rounded-t-3xl p-0 overflow-hidden bg-white"
      >
        {/* Decorative top border */}
        <div className="h-1.5 w-20 bg-gray-200 rounded-full mx-auto mt-3 mb-2" />
        
        <div className="flex flex-col items-center gap-5 py-6 px-6 overflow-y-auto">
          {/* Badge with enhanced visual treatment */}
          <div className="relative">
            <div
              className={cn(
                "relative h-36 w-36 rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all duration-500",
                isUnlocked
                  ? "ring-4 ring-white scale-105"
                  : "grayscale opacity-70"
              )}
              style={{
                background: isUnlocked
                  ? `linear-gradient(135deg, ${color.light} 0%, ${color.dark} 100%)`
                  : 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
              }}
            >
              <IconComponent 
                className={cn(
                  "h-20 w-20 relative z-10 transition-transform duration-300",
                  isUnlocked ? "text-white drop-shadow-lg" : "text-white/60"
                )} 
              />
              {!isUnlocked && (
                <Circle className="absolute right-3 bottom-3 h-6 w-6 fill-gray-700/80 text-gray-700/80 z-20" />
              )}
              
              {/* Sparkle decorations for unlocked */}
              {isUnlocked && (
                <>
                  <Sparkles className="absolute -top-1 -right-1 h-7 w-7 text-yellow-400 animate-pulse z-20" />
                  <Sparkles className="absolute -bottom-1 -left-1 h-6 w-6 text-yellow-300 animate-pulse z-20" style={{ animationDelay: '0.5s' }} />
                </>
              )}
            </div>
          </div>
          
          {/* Category Pill - Enhanced */}
          <div 
            className="rounded-full px-4 py-1.5 text-xs uppercase font-bold tracking-wider shadow-sm"
            style={{ 
              background: `linear-gradient(135deg, ${color.base}25 0%, ${color.base}15 100%)`,
              color: color.dark,
              border: `1.5px solid ${color.base}30`
            }}
          >
            {category}
          </div>
          
          {/* Title - Larger and bolder */}
          <h2 className="text-2xl font-bold text-center px-2" style={{ color: '#1A1A1A' }}>
            {name}
          </h2>
          
          {/* Summary - Better typography */}
          <p className="text-sm text-center text-[#6B6B6B] leading-relaxed max-w-sm px-2">
            {summary}
          </p>
          
          {/* Top Tip Card - More prominent */}
          <div 
            className="w-full rounded-2xl p-5 border-2 shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${color.base}12 0%, ${color.base}08 100%)`,
              borderColor: `${color.base}35`
            }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="rounded-full p-2 shrink-0 shadow-sm"
                style={{ 
                  backgroundColor: `${color.base}25`,
                  border: `1.5px solid ${color.base}30`
                }}
              >
                <LucideIcons.Lightbulb 
                  className="h-5 w-5" 
                  style={{ color: color.dark }} 
                />
              </div>
              <p className="text-sm leading-relaxed font-medium flex-1" style={{ color: color.dark }}>
                {topTip}
              </p>
            </div>
          </div>
          
          {/* Unlock Status / Progress */}
          {isUnlocked && unlockedAt ? (
            <div className="text-center space-y-1">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${color.base}15 0%, ${color.base}10 100%)`,
                  border: `1px solid ${color.base}25`
                }}
              >
                <Sparkles className="h-4 w-4" style={{ color: color.dark }} />
                <p className="text-xs font-semibold" style={{ color: color.dark }}>
                  Unlocked {format(new Date(unlockedAt), 'dd MMM yyyy')}
                </p>
              </div>
            </div>
          ) : achievement.progress ? (
            <div className="w-full space-y-3">
              {/* Progress Bar - Enhanced */}
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full transition-all duration-500 rounded-full relative overflow-hidden"
                  style={{ 
                    width: `${achievement.progress.percentage}%`,
                    background: `linear-gradient(90deg, ${color.base} 0%, ${color.dark} 100%)`
                  }}
                >
                  {/* Shimmer effect */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    style={{
                      animation: 'shimmer 2s infinite',
                      transform: 'translateX(-100%)'
                    }}
                  />
                </div>
              </div>
              {/* Progress Text */}
              <div className="flex items-center justify-between px-1">
                <p className="text-sm font-semibold" style={{ color: color.dark }}>
                  {achievement.progress.current} / {achievement.progress.required} completed
                </p>
                <span className="text-xs font-medium text-muted-foreground">
                  {achievement.progress.percentage}%
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Not yet unlocked</p>
          )}
          
          {/* Actions - Enhanced Share Button */}
          <div className="flex w-full mt-4 pt-2">
            <Button 
              variant="default"
              onClick={() => console.log('Share achievement:', name)}
              disabled={!isUnlocked}
              className="w-full gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isUnlocked 
                  ? `linear-gradient(135deg, ${color.base} 0%, ${color.dark} 100%)`
                  : 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
                color: 'white',
                border: 'none'
              }}
            >
              <Share className="h-4 w-4" />
              {isUnlocked ? 'Share Achievement' : 'Share Progress'}
            </Button>
          </div>
        </div>
        
        {/* Add shimmer animation */}
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </SheetContent>
    </Sheet>
  );
};
