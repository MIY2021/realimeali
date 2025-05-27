
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { User } from "lucide-react";

interface DebugAvatarProps {
  src?: string;
  alt?: string;
  fallbackText?: string;
  className?: string;
  userId?: string;
  showDebugInfo?: boolean;
}

export const DebugAvatar = ({ 
  src, 
  alt, 
  fallbackText, 
  className,
  userId,
  showDebugInfo = false 
}: DebugAvatarProps) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error' | 'no-src'>('loading');
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    if (!src) {
      setImageStatus('no-src');
      return;
    }

    setImageStatus('loading');
    
    // Test if the image URL is accessible
    const img = new Image();
    
    img.onload = () => {
      console.log('DebugAvatar - Image loaded successfully:', {
        userId,
        src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        timestamp: new Date().toISOString()
      });
      
      setImageStatus('loaded');
      setDebugInfo({
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      });
    };
    
    img.onerror = (error) => {
      console.error('DebugAvatar - Image failed to load:', {
        userId,
        src,
        error,
        timestamp: new Date().toISOString()
      });
      
      setImageStatus('error');
      setDebugInfo({ error: 'Failed to load' });
    };
    
    // Test CORS by trying to fetch the image
    fetch(src, { method: 'HEAD', mode: 'no-cors' })
      .then(() => {
        console.log('DebugAvatar - Fetch test passed for:', src);
      })
      .catch((error) => {
        console.warn('DebugAvatar - Fetch test failed for:', src, error);
      });
    
    img.src = src;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, userId]);

  const getStatusColor = () => {
    switch (imageStatus) {
      case 'loaded': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'loading': return 'bg-yellow-500';
      case 'no-src': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative">
      <Avatar className={className}>
        <AvatarImage 
          src={src} 
          alt={alt}
          className="object-cover"
        />
        <AvatarFallback className="bg-terracotta/20 text-terracotta">
          {fallbackText ? fallbackText.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      {showDebugInfo && (
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${getStatusColor()}`} 
             title={`Image status: ${imageStatus}${src ? ` - ${src}` : ' - No source'}`} />
      )}
      
      {showDebugInfo && imageStatus === 'error' && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-black text-white text-xs rounded z-10 whitespace-nowrap">
          Failed to load: {src}
        </div>
      )}
    </div>
  );
};
