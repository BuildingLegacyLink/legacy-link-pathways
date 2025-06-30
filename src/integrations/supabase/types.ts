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
      assets: {
        Row: {
          created_at: string
          growth_method: string | null
          growth_rate: number | null
          holdings: Json | null
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          growth_method?: string | null
          growth_rate?: number | null
          holdings?: Json | null
          id?: string
          name: string
          type: string
          updated_at?: string
          user_id: string
          value?: number
        }
        Update: {
          created_at?: string
          growth_method?: string | null
          growth_rate?: number | null
          holdings?: Json | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          frequency: string
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          frequency?: string
          id?: string
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          frequency?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_plans: {
        Row: {
          assets_last_until_age: number
          created_at: string
          current_savings_rate: number
          id: string
          monthly_expenses: number
          monthly_income: number
          monthly_savings: number
          name: string
          projected_retirement_savings: number
          status: string
          target_retirement_age: number
          target_savings_rate: number
          total_assets: number
          updated_at: string
          user_id: string
        }
        Insert: {
          assets_last_until_age?: number
          created_at?: string
          current_savings_rate?: number
          id?: string
          monthly_expenses?: number
          monthly_income?: number
          monthly_savings?: number
          name?: string
          projected_retirement_savings?: number
          status?: string
          target_retirement_age?: number
          target_savings_rate?: number
          total_assets?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          assets_last_until_age?: number
          created_at?: string
          current_savings_rate?: number
          id?: string
          monthly_expenses?: number
          monthly_income?: number
          monthly_savings?: number
          name?: string
          projected_retirement_savings?: number
          status?: string
          target_retirement_age?: number
          target_savings_rate?: number
          total_assets?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          priority: number | null
          target_amount: number
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          priority?: number | null
          target_amount: number
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          priority?: number | null
          target_amount?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      income: {
        Row: {
          amount: number
          created_at: string
          end_date: string | null
          frequency: string
          id: string
          is_current: boolean | null
          name: string
          start_date: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_current?: boolean | null
          name: string
          start_date?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_current?: boolean | null
          name?: string
          start_date?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          attempts: number | null
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          level: string | null
          module_id: string
          score: number | null
          topic_id: string | null
          total_xp: number | null
          updated_at: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          attempts?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          level?: string | null
          module_id: string
          score?: number | null
          topic_id?: string | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          attempts?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          level?: string | null
          module_id?: string
          score?: number | null
          topic_id?: string | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      liabilities: {
        Row: {
          balance: number
          created_at: string
          id: string
          interest_rate: number | null
          minimum_payment: number | null
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          interest_rate?: number | null
          minimum_payment?: number | null
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          interest_rate?: number | null
          minimum_payment?: number | null
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          description: string | null
          id: string
          level: string
          name: string
          questions: Json
          sort_order: number | null
          topic_id: string
          xp_value: number | null
        }
        Insert: {
          description?: string | null
          id: string
          level: string
          name: string
          questions?: Json
          sort_order?: number | null
          topic_id: string
          xp_value?: number | null
        }
        Update: {
          description?: string | null
          id?: string
          level?: string
          name?: string
          questions?: Json
          sort_order?: number | null
          topic_id?: string
          xp_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_projections: {
        Row: {
          age: number
          annual_expenses: number
          cash_flow: number
          created_at: string
          id: string
          net_worth: number
          plan_id: string
          portfolio_value: number
          year: number
        }
        Insert: {
          age: number
          annual_expenses?: number
          cash_flow?: number
          created_at?: string
          id?: string
          net_worth?: number
          plan_id: string
          portfolio_value?: number
          year: number
        }
        Update: {
          age?: number
          annual_expenses?: number
          cash_flow?: number
          created_at?: string
          id?: string
          net_worth?: number
          plan_id?: string
          portfolio_value?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_projections_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          first_name: string | null
          id: string
          last_name: string | null
          projected_death_age: number | null
          retirement_age: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          projected_death_age?: number | null
          retirement_age?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          projected_death_age?: number | null
          retirement_age?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      savings: {
        Row: {
          amount: number
          created_at: string
          frequency: string
          goal_id: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          frequency?: string
          goal_id?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          frequency?: string
          goal_id?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      test_out_progress: {
        Row: {
          completed: boolean | null
          created_at: string
          id: string
          level: string
          passed: boolean | null
          score: number | null
          topic_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          id?: string
          level: string
          passed?: boolean | null
          score?: number | null
          topic_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          id?: string
          level?: string
          passed?: boolean | null
          score?: number | null
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_out_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      ticker_returns: {
        Row: {
          avg_annual_return: number
          created_at: string
          name: string | null
          ticker: string
        }
        Insert: {
          avg_annual_return: number
          created_at?: string
          name?: string | null
          ticker: string
        }
        Update: {
          avg_annual_return?: number
          created_at?: string
          name?: string | null
          ticker?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id: string
          name: string
          sort_order?: number | null
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
