import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DiscoverRecipeFilters } from "@/types/edamam";

export function useEdamamCount(baseFilters?: Omit<DiscoverRecipeFilters, 'from' | 'to'>) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchCount = async () => {
      try {
        setLoading(true);
        const filters: DiscoverRecipeFilters = {
          ...(baseFilters || {}),
          from: 0,
          to: 0,
        };
        const { data, error } = await supabase.functions.invoke('discover-recipes', {
          body: { filters },
        });
        if (!error && mounted) {
          const apiCount = typeof (data as any)?.count === 'number' ? (data as any).count : null;
          setCount(apiCount);
        }
      } catch (e) {
        // silent fail; count is optional UI enhancement
        console.warn('Failed to fetch Edamam total count');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCount();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { count, loading };
}
