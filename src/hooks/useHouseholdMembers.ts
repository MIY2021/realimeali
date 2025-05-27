
// This hook has been deprecated and its functionality moved to HouseholdContext
// to prevent infinite re-rendering and improve performance.
// Please use the useHousehold hook instead.

import { useHousehold } from "@/contexts/HouseholdContext";

export const useHouseholdMembers = (householdId: string | null) => {
  console.warn("useHouseholdMembers is deprecated. Use useHousehold instead.");
  
  const { householdMembers, isLoadingMembers, removeMember } = useHousehold();
  
  return {
    members: householdMembers,
    isLoading: isLoadingMembers,
    removeMember,
    fetchMembers: () => {
      console.warn("fetchMembers is no longer needed. Data is automatically fetched by HouseholdContext.");
    }
  };
};
