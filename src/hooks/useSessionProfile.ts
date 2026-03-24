import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const sessionProfileQueryKey = (userId: string) => ["session-profile", userId] as const;

export function useSessionProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: sessionProfileQueryKey(user?.id ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}
