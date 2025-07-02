
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHistoryIndicatorProps {
  isVisible: boolean;
  onClick?: () => void;
}

export const ChatHistoryIndicator = ({ isVisible, onClick }: ChatHistoryIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "absolute top-2 left-1/2 transform -translate-x-1/2 z-10",
      "transition-all duration-300 ease-in-out",
      isVisible ? "opacity-60 translate-y-0" : "opacity-0 -translate-y-2"
    )}>
      <button 
        onClick={onClick}
        className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-200/50 p-1.5 hover:bg-white/100 transition-colors cursor-pointer"
      >
        <ChevronUp className="h-3 w-3 text-gray-400 animate-pulse" />
      </button>
    </div>
  );
};
