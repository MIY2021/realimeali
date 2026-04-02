export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          description: string | null
          id: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          description?: string | null
          id: string
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      daily_cooking_tips: {
        Row: {
          created_at: string | null
          day_of_year: number
          id: string
          tip: string
        }
        Insert: {
          created_at?: string | null
          day_of_year: number
          id?: string
          tip: string
        }
        Update: {
          created_at?: string | null
          day_of_year?: number
          id?: string
          tip?: string
        }
        Relationships: []
      }
      feedback_suggestions: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string | null
          id: string
          image_url: string | null
          message: string
          priority: string | null
          status: string
          subject: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          message: string
          priority?: string | null
          status?: string
          subject: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          message?: string
          priority?: string | null
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
          is_completed: boolean
          is_freetyped: boolean
          is_leftover: boolean
          leftover_servings: number | null
          meal_name: string | null
          meal_type: string
          meal_types: string[]
          notes: string | null
          original_servings: number | null
          parent_meal_plan_id: string | null
          planned_servings: number | null
          recipe_id: string | null
          slot_index: number
          updated_at: string
          week_key: string | null
          week_number: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          date_scheduled?: string
          household_id: string
          id?: string
          is_completed?: boolean
          is_freetyped?: boolean
          is_leftover?: boolean
          leftover_servings?: number | null
          meal_name?: string | null
          meal_type: string
          meal_types?: string[]
          notes?: string | null
          original_servings?: number | null
          parent_meal_plan_id?: string | null
          planned_servings?: number | null
          recipe_id?: string | null
          slot_index?: number
          updated_at?: string
          week_key?: string | null
          week_number?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          date_scheduled?: string
          household_id?: string
          id?: string
          is_completed?: boolean
          is_freetyped?: boolean
          is_leftover?: boolean
          leftover_servings?: number | null
          meal_name?: string | null
          meal_type?: string
          meal_types?: string[]
          notes?: string | null
          original_servings?: number | null
          parent_meal_plan_id?: string | null
          planned_servings?: number | null
          recipe_id?: string | null
          slot_index?: number
          updated_at?: string
          week_key?: string | null
          week_number?: number | null
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
          category: string | null
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
          week_key: string | null
          week_number: number
        }
        Insert: {
          category?: string | null
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
          week_key?: string | null
          week_number?: number
        }
        Update: {
          category?: string | null
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
          week_key?: string | null
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
      imported_recipes: {
        Row: {
          add_count: number
          cook_time: number | null
          cooking_method: Database["public"]["Enums"]["cooking_method"] | null
          created_at: string
          cuisine_region: Database["public"]["Enums"]["cuisine_region"] | null
          description: string | null
          diet_lifestyle: Database["public"]["Enums"]["diet_lifestyle"][] | null
          fruit_veg_breakdown: string | null
          fruit_veg_ingredient_breakdown: Json | null
          fruit_veg_portions: number | null
          fruit_veg_recommendations: Json | null
          fruit_veg_total_grams: number | null
          id: string
          image: string | null
          import_method: string | null
          imported_by: string
          ingredients: string[]
          instructions: string[]
          is_featured: boolean
          meal_type: Database["public"]["Enums"]["meal_type"] | null
          meal_types: string[]
          prep_time: number | null
          priority_score: number | null
          servings: number | null
          source_url: string | null
          title: string
          top_tip: string | null
          updated_at: string
          view_count: number
        }
        Insert: {
          add_count?: number
          cook_time?: number | null
          cooking_method?: Database["public"]["Enums"]["cooking_method"] | null
          created_at?: string
          cuisine_region?: Database["public"]["Enums"]["cuisine_region"] | null
          description?: string | null
          diet_lifestyle?:
            | Database["public"]["Enums"]["diet_lifestyle"][]
            | null
          fruit_veg_breakdown?: string | null
          fruit_veg_ingredient_breakdown?: Json | null
          fruit_veg_portions?: number | null
          fruit_veg_recommendations?: Json | null
          fruit_veg_total_grams?: number | null
          id?: string
          image?: string | null
          import_method?: string | null
          imported_by: string
          ingredients?: string[]
          instructions?: string[]
          is_featured?: boolean
          meal_type?: Database["public"]["Enums"]["meal_type"] | null
          meal_types?: string[]
          prep_time?: number | null
          priority_score?: number | null
          servings?: number | null
          source_url?: string | null
          title: string
          top_tip?: string | null
          updated_at?: string
          view_count?: number
        }
        Update: {
          add_count?: number
          cook_time?: number | null
          cooking_method?: Database["public"]["Enums"]["cooking_method"] | null
          created_at?: string
          cuisine_region?: Database["public"]["Enums"]["cuisine_region"] | null
          description?: string | null
          diet_lifestyle?:
            | Database["public"]["Enums"]["diet_lifestyle"][]
            | null
          fruit_veg_breakdown?: string | null
          fruit_veg_ingredient_breakdown?: Json | null
          fruit_veg_portions?: number | null
          fruit_veg_recommendations?: Json | null
          fruit_veg_total_grams?: number | null
          id?: string
          image?: string | null
          import_method?: string | null
          imported_by?: string
          ingredients?: string[]
          instructions?: string[]
          is_featured?: boolean
          meal_type?: Database["public"]["Enums"]["meal_type"] | null
          meal_types?: string[]
          prep_time?: number | null
          priority_score?: number | null
          servings?: number | null
          source_url?: string | null
          title?: string
          top_tip?: string | null
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      ingredient_categories: {
        Row: {
          category: string
          cleaned_name: string | null
          created_at: string
          id: string
          ingredient_name: string
          updated_at: string
        }
        Insert: {
          category: string
          cleaned_name?: string | null
          created_at?: string
          id?: string
          ingredient_name: string
          updated_at?: string
        }
        Update: {
          category?: string
          cleaned_name?: string | null
          created_at?: string
          id?: string
          ingredient_name?: string
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
          has_seen_welcome: boolean
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
          has_seen_welcome?: boolean
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
          has_seen_welcome?: boolean
          id?: string
          profile_completed?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      public_recipe_shares: {
        Row: {
          alcoholic_pairing: string | null
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
          meal_types: string[]
          non_alcoholic_pairing: string | null
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
          alcoholic_pairing?: string | null
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
          meal_types?: string[]
          non_alcoholic_pairing?: string | null
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
          alcoholic_pairing?: string | null
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
          meal_types?: string[]
          non_alcoholic_pairing?: string | null
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
      realichef_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          page_context: Json | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          page_context?: Json | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          page_context?: Json | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_import_logs: {
        Row: {
          created_at: string
          failed_imports: number
          filename: string
          id: string
          import_notes: string | null
          imported_by: string
          successful_imports: number
          total_records: number
        }
        Insert: {
          created_at?: string
          failed_imports?: number
          filename: string
          id?: string
          import_notes?: string | null
          imported_by: string
          successful_imports?: number
          total_records?: number
        }
        Update: {
          created_at?: string
          failed_imports?: number
          filename?: string
          id?: string
          import_notes?: string | null
          imported_by?: string
          successful_imports?: number
          total_records?: number
        }
        Relationships: []
      }
      recipe_notes: {
        Row: {
          content: string
          created_at: string
          created_by: string
          household_id: string
          id: string
          recipe_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          household_id: string
          id?: string
          recipe_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          household_id?: string
          id?: string
          recipe_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_notes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_notes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          alcoholic_pairing: string | null
          cook_time: number | null
          cooking_method: Database["public"]["Enums"]["cooking_method"] | null
          created_at: string | null
          cuisine_region: Database["public"]["Enums"]["cuisine_region"] | null
          deleted_at: string | null
          description: string | null
          diet_lifestyle: Database["public"]["Enums"]["diet_lifestyle"][] | null
          fruit_veg_breakdown: string | null
          fruit_veg_ingredient_breakdown: Json | null
          fruit_veg_portions: number | null
          fruit_veg_recommendations: Json | null
          fruit_veg_total_grams: number | null
          has_cooked: boolean
          household_id: string
          id: string
          image: string | null
          image_thumbnail: string | null
          import_method: string | null
          ingredients: string[]
          instructions: string[]
          is_deleted: boolean
          is_favorite: boolean | null
          last_updated_by: string | null
          meal_plan_count: number
          meal_type: Database["public"]["Enums"]["meal_type"] | null
          meal_types: string[]
          non_alcoholic_pairing: string | null
          prep_time: number | null
          servings: number | null
          source_url: string | null
          title: string
          top_tip: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alcoholic_pairing?: string | null
          cook_time?: number | null
          cooking_method?: Database["public"]["Enums"]["cooking_method"] | null
          created_at?: string | null
          cuisine_region?: Database["public"]["Enums"]["cuisine_region"] | null
          deleted_at?: string | null
          description?: string | null
          diet_lifestyle?:
            | Database["public"]["Enums"]["diet_lifestyle"][]
            | null
          fruit_veg_breakdown?: string | null
          fruit_veg_ingredient_breakdown?: Json | null
          fruit_veg_portions?: number | null
          fruit_veg_recommendations?: Json | null
          fruit_veg_total_grams?: number | null
          has_cooked?: boolean
          household_id: string
          id?: string
          image?: string | null
          image_thumbnail?: string | null
          import_method?: string | null
          ingredients?: string[]
          instructions?: string[]
          is_deleted?: boolean
          is_favorite?: boolean | null
          last_updated_by?: string | null
          meal_plan_count?: number
          meal_type?: Database["public"]["Enums"]["meal_type"] | null
          meal_types?: string[]
          non_alcoholic_pairing?: string | null
          prep_time?: number | null
          servings?: number | null
          source_url?: string | null
          title: string
          top_tip?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alcoholic_pairing?: string | null
          cook_time?: number | null
          cooking_method?: Database["public"]["Enums"]["cooking_method"] | null
          created_at?: string | null
          cuisine_region?: Database["public"]["Enums"]["cuisine_region"] | null
          deleted_at?: string | null
          description?: string | null
          diet_lifestyle?:
            | Database["public"]["Enums"]["diet_lifestyle"][]
            | null
          fruit_veg_breakdown?: string | null
          fruit_veg_ingredient_breakdown?: Json | null
          fruit_veg_portions?: number | null
          fruit_veg_recommendations?: Json | null
          fruit_veg_total_grams?: number | null
          has_cooked?: boolean
          household_id?: string
          id?: string
          image?: string | null
          image_thumbnail?: string | null
          import_method?: string | null
          ingredients?: string[]
          instructions?: string[]
          is_deleted?: boolean
          is_favorite?: boolean | null
          last_updated_by?: string | null
          meal_plan_count?: number
          meal_type?: Database["public"]["Enums"]["meal_type"] | null
          meal_types?: string[]
          non_alcoholic_pairing?: string | null
          prep_time?: number | null
          servings?: number | null
          source_url?: string | null
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
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string | null
          household_id: string
          id: string
          progress_data: Json | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          household_id: string
          id?: string
          progress_data?: Json | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          household_id?: string
          id?: string
          progress_data?: Json | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_household_id_fkey"
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
      cleanup_old_deleted_recipes: { Args: never; Returns: undefined }
      create_household_with_owner: {
        Args: { household_name: string }
        Returns: string
      }
      generate_fruit_avatar: {
        Args: { user_id_param: string }
        Returns: string
      }
      generate_invitation_code: { Args: never; Returns: string }
      generate_public_share_id: { Args: never; Returns: string }
      get_user_households: { Args: { user_id: string }; Returns: string[] }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      increment_recipe_meal_plan_count: {
        Args: { recipe_id_param: string }
        Returns: undefined
      }
      increment_share_view_count: {
        Args: { share_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
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
      permanent_delete_recipe: {
        Args: { recipe_id: string }
        Returns: undefined
      }
      reject_community_recipe: {
        Args: { recipe_id: string }
        Returns: undefined
      }
      restore_recipe: { Args: { recipe_id: string }; Returns: undefined }
      soft_delete_recipe: { Args: { recipe_id: string }; Returns: undefined }
      toggle_community_recipe_favorite: {
        Args: { recipe_id: string }
        Returns: boolean
      }
      toggle_recipe_cooking_status: {
        Args: { household_id_param: string; recipe_id_param: string }
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
        | "spanish"
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
        | "low_fat"
        | "batch_cooking"
      household_role: "owner" | "member"
      invitation_status: "pending" | "accepted" | "declined" | "expired"
      meal_type:
        | "breakfast"
        | "lunch"
        | "dinner"
        | "snacks"
        | "sides"
        | "desserts"
        | "drinks"
        | "appetizers"
        | "sauce"
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
        "spanish",
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
        "low_fat",
        "batch_cooking",
      ],
      household_role: ["owner", "member"],
      invitation_status: ["pending", "accepted", "declined", "expired"],
      meal_type: [
        "breakfast",
        "lunch",
        "dinner",
        "snacks",
        "sides",
        "desserts",
        "drinks",
        "appetizers",
        "sauce",
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
