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
      feedback_suggestions: {
        Row: {
          created_at: string
          email: string | null
          id: string
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
      household_shopping_lists: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          household_id: string
          id: string
          is_checked: boolean
          is_custom: boolean
          name: string
          quantity: number | null
          recipe_ids: string[] | null
          unit: string | null
          updated_at: string
          week_number: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          household_id: string
          id?: string
          is_checked?: boolean
          is_custom?: boolean
          name: string
          quantity?: number | null
          recipe_ids?: string[] | null
          unit?: string | null
          updated_at?: string
          week_number?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          household_id?: string
          id?: string
          is_checked?: boolean
          is_custom?: boolean
          name?: string
          quantity?: number | null
          recipe_ids?: string[] | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
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
          categories: Database["public"]["Enums"]["recipe_category"][] | null
          cook_time: number | null
          created_at: string | null
          description: string | null
          household_id: string
          id: string
          image: string | null
          ingredients: string[]
          instructions: string[]
          is_favorite: boolean | null
          prep_time: number | null
          servings: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          categories?: Database["public"]["Enums"]["recipe_category"][] | null
          cook_time?: number | null
          created_at?: string | null
          description?: string | null
          household_id: string
          id?: string
          image?: string | null
          ingredients?: string[]
          instructions?: string[]
          is_favorite?: boolean | null
          prep_time?: number | null
          servings?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          categories?: Database["public"]["Enums"]["recipe_category"][] | null
          cook_time?: number | null
          created_at?: string | null
          description?: string | null
          household_id?: string
          id?: string
          image?: string | null
          ingredients?: string[]
          instructions?: string[]
          is_favorite?: boolean | null
          prep_time?: number | null
          servings?: number | null
          title?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_household_with_owner: {
        Args: { household_name: string }
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
      increment_share_view_count: {
        Args: { share_id: string }
        Returns: undefined
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
    }
    Enums: {
      household_role: "owner" | "member"
      invitation_status: "pending" | "accepted" | "declined" | "expired"
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
      household_role: ["owner", "member"],
      invitation_status: ["pending", "accepted", "declined", "expired"],
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
