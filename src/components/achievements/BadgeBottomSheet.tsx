import { Achievement } from '@/types/achievements';
import { getBadgeColor } from '@/lib/badgeColors';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { Circle } from 'lucide-react';
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
      <SheetContent side="bottom" className="max-h-[80vh] rounded-t-3xl">
        <div className="flex flex-col items-center gap-4 py-6 px-4">
          {/* XL Badge */}
          <div
            className={cn(
              "relative h-32 w-32 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.12)] flex items-center justify-center",
              isUnlocked
                ? "ring-2 ring-white/60 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-t before:from-black/0 before:to-white/30 before:opacity-60 after:absolute after:inset-[8px] after:rounded-full after:ring-2 after:ring-white/40"
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
                "h-14 w-14 relative z-10",
                isUnlocked ? "text-white drop-shadow-md" : "text-white/60"
              )} 
            />
            {!isUnlocked && (
              <Circle className="absolute right-2 bottom-2 h-5 w-5 fill-gray-700/80 text-gray-700/80 z-20" />
            )}
          </div>
          
          {/* Category Pill */}
          <div 
            className="rounded-full px-3 py-1 text-xs uppercase font-bold tracking-wider"
            style={{ 
              backgroundColor: `${color.base}20`,
              color: color.dark 
            }}
          >
            {category}
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-bold text-center">{name}</h2>
          
          {/* Summary */}
          <p className="text-sm text-center text-muted-foreground leading-relaxed max-w-md">
            {summary}
          </p>
          
          {/* Top Tip Card */}
          <div 
            className="w-full rounded-2xl p-4 border"
            style={{
              backgroundColor: `${color.base}10`,
              borderColor: `${color.base}30`
            }}
          >
            <div className="flex items-start gap-2">
              <LucideIcons.Lightbulb 
                className="h-4 w-4 shrink-0 mt-0.5" 
                style={{ color: color.dark }} 
              />
              <p className="text-xs leading-relaxed" style={{ color: color.dark }}>
                {topTip}
              </p>
            </div>
          </div>
          
          {/* Unlock Status / Progress */}
          {isUnlocked && unlockedAt ? (
            <p className="text-xs text-muted-foreground">
              Unlocked on {format(new Date(unlockedAt), 'dd MMM yyyy')}
            </p>
          ) : achievement.progress ? (
            <div className="w-full space-y-2">
              {/* Progress Bar */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${achievement.progress.percentage}%`,
                    backgroundColor: color.base 
                  }}
                />
              </div>
              {/* Progress Text */}
              <p className="text-xs text-center text-muted-foreground">
                {achievement.progress.current} / {achievement.progress.required} completed
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Not yet unlocked</p>
          )}
          
          {/* Actions */}
          <div className="flex gap-2 w-full mt-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => console.log('Share achievement:', name)}
            >
              <LucideIcons.Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
