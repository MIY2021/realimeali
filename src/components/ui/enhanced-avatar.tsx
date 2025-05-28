
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface EnhancedAvatarProps {
  src?: string;
  alt?: string;
  fallbackText?: string;
  className?: string;
  avatarType?: 'google' | 'uploaded' | 'fruit';
  avatarData?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EnhancedAvatar = ({ 
  src, 
  alt, 
  fallbackText, 
  className,
  avatarType = 'fruit',
  avatarData,
  size = 'md'
}: EnhancedAvatarProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl'
  };

  const renderFallback = () => {
    if (avatarType === 'fruit' && avatarData) {
      return (
        <AvatarFallback className={`bg-terracotta/20 text-terracotta ${textSizeClasses[size]}`}>
          {avatarData}
        </AvatarFallback>
      );
    }

    if (fallbackText) {
      return (
        <AvatarFallback className="bg-terracotta/20 text-terracotta">
          {fallbackText.charAt(0).toUpperCase()}
        </AvatarFallback>
      );
    }

    return (
      <AvatarFallback className="bg-terracotta/20 text-terracotta">
        <User className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} />
      </AvatarFallback>
    );
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {src && <AvatarImage src={src} alt={alt} />}
      {renderFallback()}
    </Avatar>
  );
};
