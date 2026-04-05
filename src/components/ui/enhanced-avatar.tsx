import { useEffect, useId, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { profileImageReferrerPolicy } from "@/utils/resolveProfilePhotoUrl";

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
  const instanceId = useId();
  const [imageBroken, setImageBroken] = useState(false);

  useEffect(() => {
    setImageBroken(false);
  }, [src]);

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

  const userIconClass =
    size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-9 w-9' : 'h-4 w-4';

  const renderFallback = () => {
    const fruitEmoji =
      avatarType === 'fruit' && avatarData?.trim() ? avatarData.trim() : null;

    if (fruitEmoji) {
      return (
        <AvatarFallback
          delayMs={0}
          className={cn(
            /* Avoid theme `muted` (often ~95% L) — invisible on cream backgrounds */
            'bg-gradient-to-br from-terracotta/25 via-[#F0E8DC] to-[#E8DDD0] text-terracotta ring-2 ring-inset ring-terracotta/20',
            textSizeClasses[size]
          )}
        >
          {fruitEmoji}
        </AvatarFallback>
      );
    }

    /* No photo URL: visible warm plate (explicit tones, not hsl-muted) */
    return (
      <AvatarFallback
        delayMs={0}
        className={cn(
          'bg-gradient-to-br from-[#E4DDD4] via-[#DDD4C8] to-[#D3C9BC] ring-2 ring-inset ring-[#C4B8A8]/50 shadow-inner',
          textSizeClasses[size]
        )}
      >
        {fallbackText ? (
          <span className="select-none font-semibold tabular-nums text-[hsl(233_18%_32%)]">
            {fallbackText.charAt(0).toUpperCase()}
          </span>
        ) : (
          <User
            className={cn(userIconClass, 'text-[hsl(233_12%_48%)]/55')}
            strokeWidth={1.25}
          />
        )}
      </AvatarFallback>
    );
  };

  const showImage = Boolean(src) && !imageBroken;

  /* Radix Avatar keeps imageLoadingStatus=loaded on the root after a photo loads.
   * Unmounting AvatarImage (emoji mode) does not reset it, so AvatarFallback
   * stays hidden (it only renders when status !== "loaded"). Remount when
   * switching between URL and fallback-only. */
  const radixResetKey = `${instanceId}-${showImage ? "with-src" : "fallback-mode"}`;

  return (
    <Avatar key={radixResetKey} className={`${sizeClasses[size]} ${className}`}>
      {showImage ? (
        <AvatarImage
          src={src}
          alt={alt}
          className="object-cover"
          referrerPolicy={profileImageReferrerPolicy(src)}
          onError={() => setImageBroken(true)}
        />
      ) : null}
      {renderFallback()}
    </Avatar>
  );
};
