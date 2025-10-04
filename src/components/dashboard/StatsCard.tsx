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
        return 'bg-gradient-to-br from-blue-200 to-blue-300';
      case 'secondary':
        return 'bg-gradient-to-br from-emerald-200 to-emerald-300';
      case 'accent':
        return 'bg-gradient-to-br from-purple-200 to-purple-300';
      case 'muted':
        return 'bg-gradient-to-br from-rose-200 to-pink-300';
      default:
        return 'bg-gradient-to-br from-blue-200 to-blue-300';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return 'text-blue-800';
      case 'secondary':
        return 'text-emerald-800';
      case 'accent':
        return 'text-purple-800';
      case 'muted':
        return 'text-rose-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div 
      className={`
        ${getGradientClasses()} 
        rounded-3xl p-6 shadow-md
        transition-all duration-300
        ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg active:scale-95' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-start justify-between mb-4">
          <p className={`text-sm font-medium ${getTextColor()} opacity-80`}>{title}</p>
          <div className="p-2 rounded-full bg-white/40 backdrop-blur-sm">
            <IconComponent className={`h-6 w-6 ${getTextColor()}`} />
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-10 w-16" />
        ) : (
          <p className={`text-4xl font-extrabold ${getTextColor()}`}>{value}</p>
        )}
      </div>
    </div>
  );
};