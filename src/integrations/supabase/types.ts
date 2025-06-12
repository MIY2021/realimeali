export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      community_recipe_favorites: {
        Row: {
          community_recipe_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          community_recipe_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          community_recipe_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_recipe_favorites_community_recipe_id_fkey"
            columns: ["community_recipe_id"]
            isOneToOne: false
            referencedRelation: "community_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      community_recipes: {
        Row: {
          ai_generated_description: string | null
          ai_generated_image_url: string | null
          approved_at: string | null
          approved_by: string | null
          category: string | null
          cook_time: number | null
          created_at: string | null
          cuisine: string | null
          description: string | null
          difficulty_level: string | null
          id: string
          image_credit: string | null
          image_url: string | null
          is_active: boolean | null
          is_approved: boolean | null
          moderation_status: string | null
          moderator_notes: string | null
          prep_time: number | null
          reported_count: number | null
          save_count: number | null
          servings: number | null
          source_url: string
          submitted_by: string
          submitted_by_name: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          ai_generated_description?: string | null
          ai_generated_image_url?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          cook_time?: number | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          image_credit?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_approved?: boolean | null
          moderation_status?: string | null
          moderator_notes?: string | null
          prep_time?: number | null
          reported_count?: number | null
          save_count?: number | null
          servings?: number | null
          source_url: string
          submitted_by: string
          submitted_by_name?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          ai_generated_description?: string | null
          ai_generated_image_url?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          cook_time?: number | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          image_credit?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_approved?: boolean | null
          moderation_status?: string | null
          moderator_notes?: string | null
          prep_time?: number | null
          reported_count?: number | null
          save_count?: number | null
          servings?: number | null
          source_url?: string
          submitted_by?: string
          submitted_by_name?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      feedback_suggestions: {
        Row: {
          created_at: string
          email: string | null
          id: string
          image_url: string | null
          message: string
          status: string
          subject: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          message: string
          status?: string
          subject: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          message?: string
          status?: string
          subject?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      household_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          household_id: string
          id: string
          invitation_code: string
          invited_by: string
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          household_id: string
          id?: string
          invitation_code: string
          invited_by: string
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          household_id?: string
          id?: string
          invitation_code?: string
          invited_by?: string
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_invitations_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_join_requests: {
        Row: {
          created_at: string
          household_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      household_meal_plans: {
        Row: {
          created_at: string
          created_by: string
          date_scheduled: string
          household_id: string
          id: string
          is_leftover: boolean
          leftover_servings: number | null
          meal_type: string
          notes: string | null
          original_servings: number | null
          parent_meal_plan_id: string | null
          planned_servings: number | null
          recipe_id: string
          slot_index: number
          updated_at: string
          week_number: number
        }
        Insert: {
          created_at?: string
          created_by: string
          date_scheduled?: string
          household_id: string
          id?: string
          is_leftover?: boolean
          leftover_servings?: number | null
          meal_type: string
          notes?: string | null
          original_servings?: number | null
          parent_meal_plan_id?: string | null
          planned_servings?: number | null
          recipe_id: string
          slot_index?: number
          updated_at?: string
          week_number: number
        }
        Update: {
          created_at?: string
          created_by?: string
          date_scheduled?: string
          household_id?: string
          id?: string
          is_leftover?: boolean
          leftover_servings?: number | null
          meal_type?: string
          notes?: string | null
          original_servings?: number | null
          parent_meal_plan_id?: string | null
          planned_servings?: number | null
          recipe_id?: string
          slot_index?: number
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "household_meal_plans_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_meal_plans_parent_meal_plan_id_fkey"
            columns: ["parent_meal_plan_id"]
            isOneToOne: false
            referencedRelation: "household_meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_meal_plans_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          household_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["household_role"]
          user_id: string
        }
        Insert: {
          household_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["household_role"]
          user_id: string
        }
        Update: {
          household_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["household_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_recipe_categories: {
        Row: {
          created_at: string
          created_by: string
          household_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          household_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          household_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_recipe_categories_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_recipe_cooking_status: {
        Row: {
          cooked_at: string | null
          created_at: string
          has_cooked: boolean
          household_id: string
          id: string
          recipe_id: string
          updated_at: string
        }
        Insert: {
          cooked_at?: string | null
          created_at?: string
          has_cooked?: boolean
          household_id: string
          id?: string
          recipe_id: string
          updated_at?: string
        }
        Update: {
          cooked_at?: string | null
          created_at?: string
          has_cooked?: boolean
          household_id?: string
          id?: string
          recipe_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      household_shopping_lists: {
        Row: {
          consolidated_quantity: number | null
          consolidated_unit: string | null
          created_at: string
          created_by: string
          household_id: string
          id: string
          is_checked: boolean
          is_custom: boolean
          name: string
          quantity: number | null
          recipe_ids: string[] | null
          source_ingredients: string[] | null
          unit: string | null
          updated_at: string
          week_number: number
        }
        Insert: {
          consolidated_quantity?: number | null
          consolidated_unit?: string | null
          created_at?: string
          created_by: string
          household_id: string
          id?: string
          is_checked?: boolean
          is_custom?: boolean
          name: string
          quantity?: number | null
          recipe_ids?: string[] | null
          source_ingredients?: string[] | null
          unit?: string | null
          updated_at?: string
          week_number?: number
        }
        Update: {
          consolidated_quantity?: number | null
          consolidated_unit?: string | null
          created_at?: string
          created_by?: string
          household_id?: string
          id?: string
          is_checked?: boolean
          is_custom?: boolean
          name?: string
          quantity?: number | null
          recipe_ids?: string[] | null
          source_ingredients?: string[] | null
          unit?: string | null
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "household_shopping_lists_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      meal_plan_approval_requests: {
        Row: {
          created_at: string
          expires_at: string
          household_id: string
          id: string
          message: string | null
          requested_by: string
          status: Database["public"]["Enums"]["approval_request_status"]
          updated_at: string
          week_number: number
        }
        Insert: {
          created_at?: string
          expires_at?: string
          household_id: string
          id?: string
          message?: string | null
          requested_by: string
          status?: Database["public"]["Enums"]["approval_request_status"]
          updated_at?: string
          week_number: number
        }
        Update: {
          created_at?: string
          expires_at?: string
          household_id?: string
          id?: string
          message?: string | null
          requested_by?: string
          status?: Database["public"]["Enums"]["approval_request_status"]
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_approval_requests_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_approvals: {
        Row: {
          approval_request_id: string
          approved: boolean
          comments: string | null
          id: string
          responded_at: string
          user_id: string
        }
        Insert: {
          approval_request_id: string
          approved: boolean
          comments?: string | null
          id?: string
          responded_at?: string
          user_id: string
        }
        Update: {
          approval_request_id?: string
          approved?: boolean
          comments?: string | null
          id?: string
          responded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_approvals_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_approval_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_provider: string | null
          avatar_data: string | null
          avatar_type: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          profile_completed: boolean | null
          updated_at: string
        }
        Insert: {
          auth_provider?: string | null
          avatar_data?: string | null
          avatar_type?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          profile_completed?: boolean | null
          updated_at?: string
        }
        Update: {
          auth_provider?: string | null
          avatar_data?: string | null
          avatar_type?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          profile_completed?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      public_recipe_shares: {
        Row: {
          categories: Database["public"]["Enums"]["recipe_category"][] | null
          cook_time: number | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          image: string | null
          ingredients: string[]
          instructions: string[]
          is_active: boolean
          original_household_id: string
          original_recipe_id: string
          prep_time: number | null
          public_share_id: string
          servings: number | null
          shared_by_household_name: string | null
          shared_by_name: string | null
          shared_by_user_id: string
          slug: string | null
          title: string
          view_count: number | null
        }
        Insert: {
          categories?: Database["public"]["Enums"]["recipe_category"][] | null
          cook_time?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          image?: string | null
          ingredients?: string[]
          instructions?: string[]
          is_active?: boolean
          original_household_id: string
          original_recipe_id: string
          prep_time?: number | null
          public_share_id: string
          servings?: number | null
          shared_by_household_name?: string | null
          shared_by_name?: string | null
          shared_by_user_id: string
          slug?: string | null
          title: string
          view_count?: number | null
        }
        Update: {
          categories?: Database["public"]["Enums"]["recipe_category"][] | null
          cook_time?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          image?: string | null
          ingredients?: string[]
          instructions?: string[]
          is_active?: boolean
          original_household_id?: string
          original_recipe_id?: string
          prep_time?: number | null
          public_share_id?: string
          servings?: number | null
          shared_by_household_name?: string | null
          shared_by_name?: string | null
          shared_by_user_id?: string
          slug?: string | null
          title?: string
          view_count?: number | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          complexity_level:
            | Database["public"]["Enums"]["complexity_level"]
            | null
          cook_time: number | null
          cooking_method: Database["public"]["Enums"]["cooking_method"] | null
          created_at: string | null
          cuisine_region: Database["public"]["Enums"]["cuisine_region"] | null
          description: string | null
          diet_lifestyle: Database["public"]["Enums"]["diet_lifestyle"][] | null
          has_cooked: boolean
          household_id: string
          id: string
          image: string | null
          ingredients: string[]
          instructions: string[]
          is_favorite: boolean | null
          main_ingredient: Database["public"]["Enums"]["main_ingredient"] | null
          meal_plan_count: number
          meal_type: Database["public"]["Enums"]["meal_type"] | null
          prep_time: number | null
          servings: number | null
          title: string
          top_tip: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          complexity_level?:
            | Database["public"]["Enums"]["complexity_level"]
            | null
          cook_time?: number | null
          cooking_method?: Database["public"]["Enums"]["cooking_method"] | null
          created_at?: string | null
          cuisine_region?: Database["public"]["Enums"]["cuisine_region"] | null
          description?: string | null
          diet_lifestyle?:
            | Database["public"]["Enums"]["diet_lifestyle"][]
            | null
          has_cooked?: boolean
          household_id: string
          id?: string
          image?: string | null
          ingredients?: string[]
          instructions?: string[]
          is_favorite?: boolean | null
          main_ingredient?:
            | Database["public"]["Enums"]["main_ingredient"]
            | null
          meal_plan_count?: number
          meal_type?: Database["public"]["Enums"]["meal_type"] | null
          prep_time?: number | null
          servings?: number | null
          title: string
          top_tip?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          complexity_level?:
            | Database["public"]["Enums"]["complexity_level"]
            | null
          cook_time?: number | null
          cooking_method?: Database["public"]["Enums"]["cooking_method"] | null
          created_at?: string | null
          cuisine_region?: Database["public"]["Enums"]["cuisine_region"] | null
          description?: string | null
          diet_lifestyle?:
            | Database["public"]["Enums"]["diet_lifestyle"][]
            | null
          has_cooked?: boolean
          household_id?: string
          id?: string
          image?: string | null
          ingredients?: string[]
          instructions?: string[]
          is_favorite?: boolean | null
          main_ingredient?:
            | Database["public"]["Enums"]["main_ingredient"]
            | null
          meal_plan_count?: number
          meal_type?: Database["public"]["Enums"]["meal_type"] | null
          prep_time?: number | null
          servings?: number | null
          title?: string
          top_tip?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_community_recipe: {
        Args: { recipe_id: string }
        Returns: undefined
      }
      create_household_with_owner: {
        Args: { household_name: string }
        Returns: string
      }
      generate_fruit_avatar: {
        Args: { user_id_param: string }
        Returns: string
      }
      generate_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_public_share_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_households: {
        Args: { user_id: string }
        Returns: string[]
      }
      has_role: {
        Args: { _user_id: string; _role: string }
        Returns: boolean
      }
      increment_community_recipe_save_count: {
        Args: { recipe_id: string }
        Returns: undefined
      }
      increment_community_recipe_view_count: {
        Args: { recipe_id: string }
        Returns: undefined
      }
      increment_recipe_meal_plan_count: {
        Args: { recipe_id_param: string }
        Returns: undefined
      }
      increment_share_view_count: {
        Args: { share_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_household_member: {
        Args: { household_id: string; user_id: string }
        Returns: boolean
      }
      is_household_member_simple: {
        Args: { household_id: string; user_id: string }
        Returns: boolean
      }
      is_household_owner: {
        Args: { household_id: string; user_id: string }
        Returns: boolean
      }
      is_user_household_member: {
        Args: { check_household_id: string; check_user_id: string }
        Returns: boolean
      }
      is_user_household_owner: {
        Args: { check_household_id: string; check_user_id: string }
        Returns: boolean
      }
      reject_community_recipe: {
        Args: { recipe_id: string }
        Returns: undefined
      }
      toggle_community_recipe_favorite: {
        Args: { recipe_id: string }
        Returns: boolean
      }
      toggle_recipe_cooking_status: {
        Args: { recipe_id_param: string; household_id_param: string }
        Returns: boolean
      }
      toggle_recipe_cooking_status_simple: {
        Args: { recipe_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      approval_request_status: "pending" | "approved" | "rejected" | "expired"
      complexity_level: "quick_easy" | "standard" | "complex"
      cooking_method:
        | "one_pot"
        | "oven_baked"
        | "air_fryer"
        | "slow_cooker"
        | "pressure_cooker"
        | "bbq_grilled"
        | "stir_fried"
        | "roasted"
        | "raw_no_cook"
      cuisine_region:
        | "british"
        | "american"
        | "italian"
        | "french"
        | "mexican"
        | "indian"
        | "chinese"
        | "japanese"
        | "thai"
        | "mediterranean"
        | "middle_eastern"
        | "african"
        | "korean"
        | "caribbean"
        | "nordic"
        | "eastern_european"
        | "greek"
      diet_lifestyle:
        | "vegetarian"
        | "vegan"
        | "pescatarian"
        | "gluten_free"
        | "dairy_free"
        | "low_carb_keto"
        | "high_protein"
        | "paleo"
        | "diabetic_friendly"
        | "budget_meals"
        | "kid_friendly"
        | "pregnancy_safe"
      household_role: "owner" | "member"
      invitation_status: "pending" | "accepted" | "declined" | "expired"
      main_ingredient:
        | "chicken"
        | "beef"
        | "pork"
        | "lamb"
        | "fish"
        | "tofu_tempeh"
        | "eggs"
        | "cheese"
        | "pasta"
        | "rice"
        | "lentils_beans"
        | "vegetables"
        | "potatoes"
        | "fruit"
        | "nuts_seeds"
        | "chocolate"
      meal_type:
        | "breakfast"
        | "lunch"
        | "dinner"
        | "snacks"
        | "sides"
        | "desserts"
        | "drinks"
      recipe_category:
        | "Bulk"
        | "Easy"
        | "Cheap"
        | "Healthy"
        | "Vegetarian"
        | "Fish"
        | "Super Tasty"
        | "Pasta"
        | "Tapas"
        | "Winter"
        | "BBQ"
        | "Faffy"
        | "Pricey!"
        | "Not Yet Made"
        | "Snacks"
        | "Breakfast"
        | "Lunch"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      approval_request_status: ["pending", "approved", "rejected", "expired"],
      complexity_level: ["quick_easy", "standard", "complex"],
      cooking_method: [
        "one_pot",
        "oven_baked",
        "air_fryer",
        "slow_cooker",
        "pressure_cooker",
        "bbq_grilled",
        "stir_fried",
        "roasted",
        "raw_no_cook",
      ],
      cuisine_region: [
        "british",
        "american",
        "italian",
        "french",
        "mexican",
        "indian",
        "chinese",
        "japanese",
        "thai",
        "mediterranean",
        "middle_eastern",
        "african",
        "korean",
        "caribbean",
        "nordic",
        "eastern_european",
        "greek",
      ],
      diet_lifestyle: [
        "vegetarian",
        "vegan",
        "pescatarian",
        "gluten_free",
        "dairy_free",
        "low_carb_keto",
        "high_protein",
        "paleo",
        "diabetic_friendly",
        "budget_meals",
        "kid_friendly",
        "pregnancy_safe",
      ],
      household_role: ["owner", "member"],
      invitation_status: ["pending", "accepted", "declined", "expired"],
      main_ingredient: [
        "chicken",
        "beef",
        "pork",
        "lamb",
        "fish",
        "tofu_tempeh",
        "eggs",
        "cheese",
        "pasta",
        "rice",
        "lentils_beans",
        "vegetables",
        "potatoes",
        "fruit",
        "nuts_seeds",
        "chocolate",
      ],
      meal_type: [
        "breakfast",
        "lunch",
        "dinner",
        "snacks",
        "sides",
        "desserts",
        "drinks",
      ],
      recipe_category: [
        "Bulk",
        "Easy",
        "Cheap",
        "Healthy",
        "Vegetarian",
        "Fish",
        "Super Tasty",
        "Pasta",
        "Tapas",
        "Winter",
        "BBQ",
        "Faffy",
        "Pricey!",
        "Not Yet Made",
        "Snacks",
        "Breakfast",
        "Lunch",
      ],
    },
  },
} as const
