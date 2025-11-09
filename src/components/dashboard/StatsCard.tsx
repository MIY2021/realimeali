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

  return (
    <div 
      className={`
        bg-white
        rounded-3xl p-4 shadow-sm
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md active:scale-95' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">{title}</p>
          <IconComponent className={`h-5 w-5 ${getIconColor()}`} />
        </div>
        <div className="relative h-9">
          {/* Loading state - subtle shimmer effect */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center">
              <div 
                className="h-8 w-20 rounded-md overflow-hidden"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.04) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s ease-in-out infinite'
                }}
              />
            </div>
          )}
          
          {/* Actual value - fades in when loaded */}
          <p 
            className={`
              text-3xl font-bold text-gray-900
              transition-opacity duration-500 ease-out
              ${isLoading ? 'opacity-0' : 'opacity-100'}
            `}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};