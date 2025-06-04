
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

  // Enhanced debug logging
  console.log('EnhancedAvatar render:', {
    src,
    alt,
    fallbackText,
    avatarType,
    avatarData,
    size,
    hasSrc: !!src,
    hasAvatarData: !!avatarData,
    className
  });

  const renderFallback = () => {
    if (avatarType === 'fruit' && avatarData) {
      console.log('EnhancedAvatar: Rendering fruit avatar:', avatarData);
      return (
        <AvatarFallback className={`bg-terracotta/20 text-terracotta ${textSizeClasses[size]}`}>
          {avatarData}
        </AvatarFallback>
      );
    }

    if (fallbackText) {
      console.log('EnhancedAvatar: Rendering text fallback:', fallbackText);
      return (
        <AvatarFallback className="bg-terracotta/20 text-terracotta">
          {fallbackText.charAt(0).toUpperCase()}
        </AvatarFallback>
      );
    }

    console.log('EnhancedAvatar: Rendering user icon fallback');
    return (
      <AvatarFallback className="bg-terracotta/20 text-terracotta">
        <User className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} />
      </AvatarFallback>
    );
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {src && (
        <AvatarImage 
          src={src} 
          alt={alt} 
          onLoad={() => console.log('EnhancedAvatar: Image loaded successfully:', src)}
          onError={() => console.log('EnhancedAvatar: Image failed to load:', src)}
        />
      )}
      {renderFallback()}
    </Avatar>
  );
};
