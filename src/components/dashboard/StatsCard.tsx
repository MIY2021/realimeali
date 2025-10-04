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
  const getGradientClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-br from-blue-500 to-blue-600';
      case 'secondary':
        return 'bg-gradient-to-br from-emerald-500 to-emerald-600';
      case 'accent':
        return 'bg-gradient-to-br from-purple-500 to-purple-600';
      case 'muted':
        return 'bg-gradient-to-br from-red-500 to-pink-500';
      default:
        return 'bg-gradient-to-br from-blue-500 to-blue-600';
    }
  };

  return (
    <div 
      className={`
        ${getGradientClasses()} 
        rounded-3xl p-6 shadow-lg
        transition-all duration-300
        ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-xl active:scale-95' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-medium text-white/90">{title}</p>
          <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            <IconComponent className="h-6 w-6 text-white" />
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-10 w-16" />
        ) : (
          <p className="text-4xl font-extrabold text-white">{value}</p>
        )}
      </div>
    </div>
  );
};