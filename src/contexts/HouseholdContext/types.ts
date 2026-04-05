
import { Household, HouseholdMember, HouseholdJoinRequest } from '@/types';

export interface HouseholdContextType {
  currentHousehold: Household | null;
  setCurrentHousehold: React.Dispatch<React.SetStateAction<Household | null>>;
  householdMembers: HouseholdMember[];
  setHouseholdMembers: React.Dispatch<React.SetStateAction<HouseholdMember[]>>;
  joinRequests: HouseholdJoinRequest[];
  setJoinRequests: React.Dispatch<React.SetStateAction<HouseholdJoinRequest[]>>;
  households: Household[];
  isLoadingHousehold: boolean;
  isLoadingMembers: boolean;
  createHousehold: (name: string) => Promise<Household | null>;
  updateHousehold: (id: string, updates: Partial<Household>) => Promise<Household | null>;
  joinHousehold: (householdId: string) => Promise<boolean>;
  requestToJoinHousehold: (householdCode: string) => Promise<boolean>;
  leaveHousehold: (householdId: string) => Promise<boolean>;
  removeMember: (memberId: string, memberUserId: string) => Promise<boolean>;
  fetchJoinRequests: () => Promise<void>;
  fetchHouseholdMembers: () => Promise<void>;
  approveJoinRequest: (requestId: string) => Promise<boolean>;
  rejectJoinRequest: (requestId: string) => Promise<boolean>;
}
