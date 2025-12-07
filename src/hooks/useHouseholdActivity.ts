import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';
import { useRecipes } from '@/contexts/RecipesContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { supabase } from '@/integrations/supabase/client';

export type ActivityType = 
  | 'recipe-added'
  | 'recipe-edited' 
  | 'recipe-favorited'
  | 'recipe-unfavorited'
  | 'recipe-cooked'
  | 'recipe-uncooked'
  | 'meal-plan-added'
  | 'custom-meal-added'
  | 'leftover-meal-added'
  | 'recipe-note-added'
  | 'member-joined'
  | 'recipe-deleted'
  | 'recipe-restored';

export interface HouseholdActivity {
  id: string;
  type: ActivityType;
  title: string;
  user: string;
  timestamp: string;
  description: string;
  metadata?: Record<string, any>;
}

export const useHouseholdActivity = () => {
  const { user } = useAuth();
  const { currentHousehold, householdMembers } = useHousehold();
  const { recipes } = useRecipes();
  const { mealPlans } = useMealPlan();
  
  const [cookingStatusActivities, setCookingStatusActivities] = useState<any[]>([]);
  const [recipeNotes, setRecipeNotes] = useState<any[]>([]);
  const [memberActivities, setMemberActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentHousehold?.id || !user) {
      setIsLoading(false);
      return;
    }

    const fetchAdditionalActivities = async () => {
      try {
        setIsLoading(true);
        
        // Fetch cooking status changes from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [cookingStatus, notes, members] = await Promise.all([
          // Cooking status activities
          supabase
            .from('household_recipe_cooking_status')
            .select(`
              *,
              recipes!inner(title, created_by)
            `)
            .eq('household_id', currentHousehold.id)
            .gte('updated_at', thirtyDaysAgo.toISOString())
            .order('updated_at', { ascending: false }),

          // Recipe notes
          supabase
            .from('recipe_notes')
            .select(`
              *,
              recipes!inner(title)
            `)
            .eq('household_id', currentHousehold.id)
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: false }),

          // Recent member joins
          supabase
            .from('household_members')
            .select('*')
            .eq('household_id', currentHousehold.id)
            .gte('joined_at', thirtyDaysAgo.toISOString())
            .order('joined_at', { ascending: false })
        ]);

        if (cookingStatus.data) setCookingStatusActivities(cookingStatus.data);
        if (notes.data) setRecipeNotes(notes.data);
        if (members.data) setMemberActivities(members.data);
        
      } catch (error) {
        console.error('Error fetching additional activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdditionalActivities();
  }, [currentHousehold?.id, user]);

  const activities = useMemo(() => {
    if (!householdMembers.length) {
      console.log('🏠 No household members loaded yet');
      return [];
    }

    // Create a map of user_id -> profile for faster lookup
    const userProfileMap = new Map<string, { full_name?: string | null; email?: string | null }>();
    householdMembers.forEach(member => {
      if (member.user_id) {
        userProfileMap.set(member.user_id, {
          full_name: member.profile?.full_name || null,
          email: member.profile?.email || null
        });
      }
    });

    console.log('🏠 Computing activities with household members:', {
      memberCount: householdMembers.length,
      profileMapSize: userProfileMap.size,
      members: householdMembers.map(m => ({
        user_id: m.user_id,
        full_name: m.profile?.full_name,
        email: m.profile?.email,
        hasProfile: !!m.profile
      })),
      userProfileMapEntries: Array.from(userProfileMap.entries()).map(([id, profile]) => ({
        user_id: id,
        full_name: profile.full_name,
        email: profile.email
      }))
    });

    const getUserName = (userId: string) => {
      // Handle empty or invalid user IDs
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        console.log(`👤 Empty or invalid userId provided:`, userId);
        return 'Someone';
      }

      // Trim the userId for comparison
      const trimmedUserId = userId.trim();
      
      // Try to find member by exact match
      let member = householdMembers.find(m => m.user_id === trimmedUserId);
      
      // Also check if it's in our profile map
      const profileData = userProfileMap.get(trimmedUserId);
      
      console.log(`👤 Looking up user "${trimmedUserId}":`, {
        memberFound: !!member,
        profileInMap: !!profileData,
        memberProfile: member?.profile ? {
          full_name: member.profile.full_name,
          email: member.profile.email
        } : null,
        mapProfile: profileData || null,
        allMemberUserIds: householdMembers.map(m => m.user_id)
      });
      
      // Use member profile if found, otherwise use map data
      const fullName = member?.profile?.full_name || profileData?.full_name;
      const email = member?.profile?.email || profileData?.email;
      
      // Try full_name first (check for null, undefined, and empty string)
      if (fullName && typeof fullName === 'string' && fullName.trim() !== '') {
        const name = fullName.trim();
        console.log(`👤 ✅ Found name for user ${trimmedUserId}: "${name}"`);
        return name;
      }
      
      // Fallback to email username
      if (email && typeof email === 'string' && email.trim() !== '') {
        const emailUsername = email.trim().split('@')[0];
        const capitalized = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
        console.log(`👤 ✅ Found email for user ${trimmedUserId}, using username: "${capitalized}"`);
        return capitalized;
      }
      
      // Last resort: return 'Someone'
      console.warn(`👤 ❌ Could not find name or email for userId: "${trimmedUserId}"`, {
        memberExists: !!member,
        hasProfile: !!member?.profile,
        profileData: profileData,
        availableUserIds: Array.from(userProfileMap.keys())
      });
      return 'Someone';
    };

    // Collect all unique user IDs from recipes and activities for debugging
    const recipeUserIds = new Set<string>();
    recipes.forEach(recipe => {
      if (recipe.created_by) recipeUserIds.add(recipe.created_by);
      if (recipe.last_updated_by) recipeUserIds.add(recipe.last_updated_by);
    });
    mealPlans.forEach(plan => {
      if (plan.created_by) recipeUserIds.add(plan.created_by);
    });
    cookingStatusActivities.forEach(status => {
      if (status.recipes?.created_by) recipeUserIds.add(status.recipes.created_by);
    });
    recipeNotes.forEach(note => {
      if (note.created_by) recipeUserIds.add(note.created_by);
    });
    memberActivities.forEach(member => {
      if (member.user_id) recipeUserIds.add(member.user_id);
    });

    console.log('🔍 DEBUG: User ID comparison:', {
      recipeUserIds: Array.from(recipeUserIds),
      householdMemberUserIds: householdMembers.map(m => m.user_id),
      missingUserIds: Array.from(recipeUserIds).filter(id => !householdMembers.some(m => m.user_id === id))
    });

    const allActivities: HouseholdActivity[] = [];

    // Recipe activities
    recipes.forEach(recipe => {
      // Recipe added
      allActivities.push({
        id: `recipe-added-${recipe.id}`,
        type: 'recipe-added',
        title: recipe.title,
        user: getUserName(recipe.created_by || ''),
        timestamp: recipe.created_at || new Date().toISOString(),
        description: `added recipe "${recipe.title}"`,
        metadata: { userId: recipe.created_by, recipeId: recipe.id }
      });

      // Recipe edited (if updated_at is different from created_at)
      if (recipe.updated_at && recipe.created_at && 
          new Date(recipe.updated_at).getTime() > new Date(recipe.created_at).getTime() + 5000) {
        allActivities.push({
          id: `recipe-edited-${recipe.id}`,
          type: 'recipe-edited',
          title: recipe.title,
          user: getUserName(recipe.last_updated_by || recipe.created_by || ''),
          timestamp: recipe.updated_at,
          description: `updated recipe "${recipe.title}"`,
          metadata: { userId: recipe.last_updated_by || recipe.created_by, recipeId: recipe.id }
        });
      }

      // Recipe favorited (if currently favorited)
      if (recipe.is_favorite) {
        allActivities.push({
          id: `recipe-favorited-${recipe.id}`,
          type: 'recipe-favorited',
          title: recipe.title,
          user: getUserName(recipe.created_by || ''),
          timestamp: recipe.updated_at || recipe.created_at || new Date().toISOString(),
          description: `favorited "${recipe.title}"`,
          metadata: { userId: recipe.created_by, recipeId: recipe.id }
        });
      }

      // Recipe deleted (soft deleted)
      if ((recipe as any).is_deleted && (recipe as any).deleted_at) {
        allActivities.push({
          id: `recipe-deleted-${recipe.id}`,
          type: 'recipe-deleted',
          title: recipe.title,
          user: getUserName((recipe as any).last_updated_by || recipe.created_by || ''),
          timestamp: (recipe as any).deleted_at,
          description: `deleted recipe "${recipe.title}"`,
          metadata: { userId: (recipe as any).last_updated_by || recipe.created_by }
        });
      }
    });

    // Meal plan activities
    mealPlans.forEach(plan => {
      const mealTypeDisplay = plan.meal_types?.[0] || plan.meal_type || 'meal';
      const dateDisplay = plan.date 
        ? new Date(plan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '';
      
      if (plan.is_freetyped && plan.meal_name) {
        if (plan.is_leftover) {
          allActivities.push({
            id: `leftover-meal-${plan.id}`,
            type: 'leftover-meal-added',
            title: plan.meal_name,
            user: getUserName(plan.created_by),
            timestamp: plan.created_at || '',
            description: `planned "${plan.meal_name}" as leftover ${mealTypeDisplay}${dateDisplay ? ` for ${dateDisplay}` : ''}`,
            metadata: { userId: plan.created_by }
          });
        } else {
          allActivities.push({
            id: `custom-meal-${plan.id}`,
            type: 'custom-meal-added',
            title: plan.meal_name,
            user: getUserName(plan.created_by),
            timestamp: plan.created_at || '',
            description: `planned "${plan.meal_name}" for ${mealTypeDisplay}${dateDisplay ? ` on ${dateDisplay}` : ''}`,
            metadata: { userId: plan.created_by }
          });
        }
      } else if (plan.recipe_id) {
        const recipe = recipes.find(r => r.id === plan.recipe_id);
        if (recipe) {
          allActivities.push({
            id: `meal-plan-${plan.id}`,
            type: 'meal-plan-added',
            title: recipe.title,
            user: getUserName(plan.created_by),
            timestamp: plan.created_at || '',
            description: `planned "${recipe.title}" for ${mealTypeDisplay}${dateDisplay ? ` on ${dateDisplay}` : ''}`,
            metadata: { userId: plan.created_by, recipeId: recipe.id }
          });
        }
      }
    });

    // Cooking status activities
    cookingStatusActivities.forEach(status => {
      if (status.recipes) {
        allActivities.push({
          id: `cooking-${status.id}`,
          type: status.has_cooked ? 'recipe-cooked' : 'recipe-uncooked',
          title: status.recipes.title,
          user: getUserName(status.recipes.created_by || ''),
          timestamp: status.updated_at,
          description: status.has_cooked 
            ? `marked "${status.recipes.title}" as cooked` 
            : `marked "${status.recipes.title}" as not cooked yet`,
          metadata: { userId: status.recipes.created_by, recipeId: status.recipe_id }
        });
      }
    });

    // Recipe notes activities
    recipeNotes.forEach(note => {
      if (note.recipes) {
        allActivities.push({
          id: `note-${note.id}`,
          type: 'recipe-note-added',
          title: note.recipes.title,
          user: getUserName(note.created_by),
          timestamp: note.created_at,
          description: `added a note to "${note.recipes.title}"`,
          metadata: { userId: note.created_by, recipeId: note.recipe_id }
        });
      }
    });

    // Member activities
    memberActivities.forEach(member => {
      // Skip the first member (household creator)
      if (member.role !== 'owner') {
        allActivities.push({
          id: `member-joined-${member.id}`,
          type: 'member-joined',
          title: getUserName(member.user_id),
          user: getUserName(member.user_id),
          timestamp: member.joined_at,
          description: 'joined the household',
          metadata: { userId: member.user_id }
        });
      }
    });

    // Sort all activities by timestamp (most recent first)
    return allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50); // Limit to most recent 50 activities for performance
      
  }, [recipes, mealPlans, cookingStatusActivities, recipeNotes, memberActivities, householdMembers]);

  return {
    activities,
    isLoading,
    hasData: !!user && !!currentHousehold
  };
};