import { Skeleton } from "@/components/ui/skeleton";
import { type ComponentType } from "react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ComponentType<{ className?: string }>;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'accent' | 'muted';
  onClick?: () => void;
}

export const StatsCard = ({ 
  title, 
  value, 
  icon: IconComponent, 
  isLoading = false,
  variant = 'primary',
  onClick
}: StatsCardProps) => {
  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return 'text-blue-500';
      case 'secondary':
        return 'text-emerald-500';
      case 'accent':
        return 'text-purple-500';
      case 'muted':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  const getGradientBg = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-br from-blue-50 to-blue-100/50';
      case 'secondary':
        return 'bg-gradient-to-br from-emerald-50 to-emerald-100/50';
      case 'accent':
        return 'bg-gradient-to-br from-purple-50 to-purple-100/50';
      case 'muted':
        return 'bg-gradient-to-br from-red-50 to-red-100/50';
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100/50';
    }
  };

  return (
    <div 
      className={`
        ${getGradientBg()}
        rounded-3xl p-5 shadow-md border border-white/50
        transition-all duration-300
        ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]' : ''}
        relative overflow-hidden
      `}
      onClick={onClick}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      
      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">{title}</p>
          <div className={`${getIconColor()} bg-white/80 rounded-full p-2 shadow-sm`}>
            <IconComponent className="h-5 w-5" />
          </div>
        </div>
        <div className="relative h-10">
          {/* Loading state - subtle shimmer effect */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center">
              <div 
                className="h-9 w-24 rounded-lg overflow-hidden bg-white/50"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s ease-in-out infinite'
                }}
              />
            </div>
          )}
          
          {/* Actual value - fades in when loaded */}
          <p 
            className={`
              text-3xl font-extrabold text-gray-900
              transition-opacity duration-500 ease-out
              ${isLoading ? 'opacity-0' : 'opacity-100'}
            `}
          >
            {typeof value === 'string' && value.includes('/') ? (
              <>
                {value.split('/')[0]}
                <span className="text-xl font-normal text-gray-500">
                  /{value.split('/')[1]}
                </span>
              </>
            ) : (
              value
            )}
          </p>
        </div>
      </div>
    </div>
  );
};