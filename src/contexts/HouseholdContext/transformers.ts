
import { Household, HouseholdJoinRequest, HouseholdMember } from '@/types';

export const transformHousehold = (dbHousehold: any): Household => ({
  id: dbHousehold.id,
  name: dbHousehold.name,
  createdAt: dbHousehold.created_at,
  updatedAt: dbHousehold.updated_at,
  createdBy: dbHousehold.created_by,
});

export const transformJoinRequest = (dbRequest: any): HouseholdJoinRequest => ({
  id: dbRequest.id,
  householdId: dbRequest.household_id,
  userId: dbRequest.user_id,
  status: dbRequest.status,
  createdAt: dbRequest.created_at,
  updatedAt: dbRequest.updated_at,
});

export const transformHouseholdMember = (member: any): HouseholdMember => ({
  id: member.id,
  userId: member.user_id,
  householdId: member.household_id,
  role: member.role,
  joinedAt: member.joined_at,
  createdAt: member.joined_at,
  updatedAt: member.joined_at,
  profile: member.profiles
    ? {
        fullName: member.profiles.full_name,
        email: member.profiles.email,
        avatarUrl: member.profiles.avatar_url,
      }
    : undefined,
});
