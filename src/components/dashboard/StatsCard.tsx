import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type ComponentType } from "react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ComponentType<{ className?: string }>;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'accent' | 'muted';
}

export const StatsCard = ({ 
  title, 
  value, 
  icon: IconComponent, 
  isLoading = false,
  variant = 'primary' 
}: StatsCardProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-terracotta/10 text-primary border-terracotta/20';
      case 'secondary':
        return 'bg-sage/10 text-secondary border-sage/20';
      case 'accent':
        return 'bg-butter/10 text-accent-foreground border-butter/20';
      case 'muted':
        return 'bg-navy/10 text-foreground border-navy/20';
      default:
        return 'bg-terracotta/10 text-primary border-terracotta/20';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return 'text-terracotta';
      case 'secondary':
        return 'text-sage';
      case 'accent':
        return 'text-butter';
      case 'muted':
        return 'text-navy';
      default:
        return 'text-terracotta';
    }
  };

  return (
    <Card className={`${getVariantClasses()} transition-all hover:shadow-md`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="text-3xl font-bold mt-2">{value}</p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-background/50`}>
            <IconComponent className={`h-6 w-6 ${getIconColor()}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};