
import { Household, HouseholdJoinRequest, HouseholdMember } from '@/types';

// No more transformations needed - use snake_case directly from database
export const transformHousehold = (dbHousehold: any): Household => dbHousehold;

export const transformJoinRequest = (dbRequest: any): HouseholdJoinRequest => dbRequest;

export const transformHouseholdMember = (member: any): HouseholdMember => ({
  ...member,
  profile: member.profiles
    ? {
        full_name: member.profiles.full_name,
        email: member.profiles.email,
        avatar_url: member.profiles.avatar_url,
      }
    : undefined,
});
