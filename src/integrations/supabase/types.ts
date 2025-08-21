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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agent_performance: {
        Row: {
          agent_id: string
          client_satisfaction: number | null
          conversion_rate: number | null
          created_at: string
          deals_completed: number | null
          id: string
          month: string
          response_time_hours: number | null
          target_revenue: number | null
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          client_satisfaction?: number | null
          conversion_rate?: number | null
          created_at?: string
          deals_completed?: number | null
          id?: string
          month: string
          response_time_hours?: number | null
          target_revenue?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          client_satisfaction?: number | null
          conversion_rate?: number | null
          created_at?: string
          deals_completed?: number | null
          id?: string
          month?: string
          response_time_hours?: number | null
          target_revenue?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_performance_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          address: string | null
          created_at: string
          email: string
          experience: number | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          qualifications: string | null
          role: string
          specialization: string[] | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          experience?: number | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          qualifications?: string | null
          role: string
          specialization?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          experience?: number | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          qualifications?: string | null
          role?: string
          specialization?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      automated_followups: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          scheduled_for: string
          sent_at: string | null
          status: string | null
          template_id: string | null
          trigger_type: string
          trigger_value: number | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          trigger_type: string
          trigger_value?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          trigger_type?: string
          trigger_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automated_followups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automated_followups_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          agent_id: string | null
          budget_max: number | null
          budget_min: number | null
          client_type: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          preferred_locations: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          agent_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          client_type?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          preferred_locations?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          agent_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          client_type?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          preferred_locations?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          agent_id: string | null
          client_id: string | null
          content: string
          created_at: string
          delivered_at: string | null
          id: string
          metadata: Json | null
          read_at: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          type: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          client_id?: string | null
          content: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          client_id?: string | null
          content?: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          agent_id: string | null
          client_id: string | null
          created_at: string
          description: string | null
          document_type: string | null
          file_url: string | null
          id: string
          property_id: string | null
          title: string
        }
        Insert: {
          agent_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          document_type?: string | null
          file_url?: string | null
          id?: string
          property_id?: string | null
          title: string
        }
        Update: {
          agent_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          document_type?: string | null
          file_url?: string | null
          id?: string
          property_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          agent_id: string | null
          amount: number
          client_id: string | null
          commission_amount: number | null
          commission_rate: number | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          invoice_number: string
          notes: string | null
          paid_date: string | null
          property_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          amount: number
          client_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          invoice_number: string
          notes?: string | null
          paid_date?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          amount?: number
          client_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_date?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_agent_id: string | null
          budget: number | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          interest_type: string | null
          notes: string | null
          phone: string | null
          preferred_locations: string[] | null
          property_id: string | null
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          budget?: number | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          interest_type?: string | null
          notes?: string | null
          phone?: string | null
          preferred_locations?: string[] | null
          property_id?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          budget?: number | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          interest_type?: string | null
          notes?: string | null
          phone?: string | null
          preferred_locations?: string[] | null
          property_id?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_reminders: {
        Row: {
          created_at: string
          id: string
          meeting_id: string | null
          reminder_time: string
          reminder_type: string
          sent: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          meeting_id?: string | null
          reminder_time: string
          reminder_type: string
          sent?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          meeting_id?: string | null
          reminder_time?: string
          reminder_type?: string
          sent?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_reminders_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agent_id: string | null
          client_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          follow_up_required: boolean | null
          id: string
          location: string | null
          meeting_date: string
          meeting_notes: string | null
          meeting_type: string | null
          next_follow_up_date: string | null
          notes: string | null
          outcome: string | null
          property_id: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          follow_up_required?: boolean | null
          id?: string
          location?: string | null
          meeting_date: string
          meeting_notes?: string | null
          meeting_type?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          outcome?: string | null
          property_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          follow_up_required?: boolean | null
          id?: string
          location?: string | null
          meeting_date?: string
          meeting_notes?: string | null
          meeting_type?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          outcome?: string | null
          property_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          agent_id: string | null
          bathrooms: number | null
          bedrooms: number | null
          city: string
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          images: string[] | null
          listing_date: string | null
          lot_size: number | null
          price: number
          property_type_id: string | null
          square_feet: number | null
          state: string
          status: string | null
          title: string
          updated_at: string
          year_built: number | null
          zip_code: string | null
        }
        Insert: {
          address: string
          agent_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          listing_date?: string | null
          lot_size?: number | null
          price: number
          property_type_id?: string | null
          square_feet?: number | null
          state: string
          status?: string | null
          title: string
          updated_at?: string
          year_built?: number | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          agent_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          listing_date?: string | null
          lot_size?: number | null
          price?: number
          property_type_id?: string | null
          square_feet?: number | null
          state?: string
          status?: string | null
          title?: string
          updated_at?: string
          year_built?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_property_type_id_fkey"
            columns: ["property_type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
        ]
      }
      property_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_target_achievement: {
        Args: { agent_uuid: string; target_month: string }
        Returns: number
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_profile_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_agent_for_client: {
        Args: { client_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
