import { useEffect, useRef } from 'react';

interface UseInfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number; // Distance from bottom in pixels to trigger load
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 200
}: UseInfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // When the sentinel element becomes visible, load more
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      {
        // Start loading when sentinel is within `threshold` pixels of viewport
        rootMargin: `${threshold}px`
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [onLoadMore, hasMore, isLoading, threshold]);

  return sentinelRef;
}
