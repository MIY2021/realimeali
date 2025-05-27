
import { useRef, useCallback } from "react";

export const useShoppingListInteractions = (
  isChecked: boolean,
  onCheck: (checked: boolean) => void,
  onCopy: () => void
) => {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPressing = useRef(false);
  const lastTapTime = useRef(0);
  const doubleTapDelay = 300;

  // Double tap handler for the main content area
  const handleDoubleTap = useCallback((e: React.TouchEvent) => {
    const currentTime = new Date().getTime();
    const tapTimeDiff = currentTime - lastTapTime.current;
    
    if (tapTimeDiff < doubleTapDelay && tapTimeDiff > 0) {
      // Double tap detected - toggle checkbox
      e.preventDefault();
      e.stopPropagation();
      onCheck(!isChecked);
    }
    
    lastTapTime.current = currentTime;
  }, [isChecked, onCheck]);

  // Long press handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Don't interfere with checkbox or button interactions
    const target = e.target as HTMLElement;
    if (target.closest('[role="checkbox"]') || target.closest('button')) {
      return;
    }
    
    e.preventDefault(); // Prevent default touch highlighting
    isLongPressing.current = false;
    
    longPressTimer.current = setTimeout(() => {
      isLongPressing.current = true;
      onCopy();
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms for long press
  }, [onCopy]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Don't interfere with checkbox or button interactions
    const target = e.target as HTMLElement;
    if (target.closest('[role="checkbox"]') || target.closest('button')) {
      return;
    }
    
    e.preventDefault();
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Handle double tap only if it wasn't a long press
    if (!isLongPressing.current) {
      handleDoubleTap(e);
    }
  }, [handleDoubleTap]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Cancel long press if user moves finger
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Mouse handlers for desktop long press
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't interfere with checkbox or button interactions
    const target = e.target as HTMLElement;
    if (target.closest('[role="checkbox"]') || target.closest('button')) {
      return;
    }
    
    e.preventDefault(); // Prevent default selection highlighting
    isLongPressing.current = false;
    
    longPressTimer.current = setTimeout(() => {
      isLongPressing.current = true;
      onCopy();
    }, 500);
  }, [onCopy]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Don't interfere with checkbox or button interactions
    const target = e.target as HTMLElement;
    if (target.closest('[role="checkbox"]') || target.closest('button')) {
      return;
    }
    
    e.preventDefault();
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return {
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave
  };
};
