export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          active: boolean | null
          created_at: string | null
          email: string
          id: number
          last_login: string | null
          password_hash: string
          role: string | null
          username: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          email: string
          id?: number
          last_login?: string | null
          password_hash: string
          role?: string | null
          username: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          email?: string
          id?: number
          last_login?: string | null
          password_hash?: string
          role?: string | null
          username?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: number
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: number
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: number
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          id: number
          image_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author: string
          category: string
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: number
          image_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: number
          image_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      complaints: {
        Row: {
          assigned_to: string | null
          company_name: string | null
          complainant_email: string | null
          complainant_name: string
          complainant_phone: string | null
          complaint_type: string
          created_at: string | null
          description: string
          id: number
          priority: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          company_name?: string | null
          complainant_email?: string | null
          complainant_name: string
          complainant_phone?: string | null
          complaint_type: string
          created_at?: string | null
          description: string
          id?: number
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          company_name?: string | null
          complainant_email?: string | null
          complainant_name?: string
          complainant_phone?: string | null
          complaint_type?: string
          created_at?: string | null
          description?: string
          id?: number
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          category: string
          created_at: string | null
          email: string
          id: number
          message: string
          name: string
          phone: string | null
          status: string | null
          subject: string
        }
        Insert: {
          category: string
          created_at?: string | null
          email: string
          id?: number
          message: string
          name: string
          phone?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          category?: string
          created_at?: string | null
          email?: string
          id?: number
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      content: {
        Row: {
          created_at: string
          generated_content: Json
          id: string
          input_type: string
          original_input: string
          status: string
          tone_analysis: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_content: Json
          id?: string
          input_type?: string
          original_input: string
          status?: string
          tone_analysis?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generated_content?: Json
          id?: string
          input_type?: string
          original_input?: string
          status?: string
          tone_analysis?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_platforms: {
        Row: {
          content_id: string
          created_at: string
          engagement_metrics: Json | null
          hashtags: string[] | null
          id: string
          platform_content: string
          platform_id: string
          published_at: string | null
          scheduled_for: string | null
        }
        Insert: {
          content_id: string
          created_at?: string
          engagement_metrics?: Json | null
          hashtags?: string[] | null
          id?: string
          platform_content: string
          platform_id: string
          published_at?: string | null
          scheduled_for?: string | null
        }
        Update: {
          content_id?: string
          created_at?: string
          engagement_metrics?: Json | null
          hashtags?: string[] | null
          id?: string
          platform_content?: string
          platform_id?: string
          published_at?: string | null
          scheduled_for?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_platforms_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_platforms_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content_text: string | null
          file_path: string
          file_size: number | null
          filename: string
          id: number
          processed: boolean | null
          uploaded_at: string | null
        }
        Insert: {
          content_text?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          id?: number
          processed?: boolean | null
          uploaded_at?: string | null
        }
        Update: {
          content_text?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: number
          processed?: boolean | null
          uploaded_at?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          email_type: string
          error_message: string | null
          id: number
          recipient_email: string
          sent_at: string | null
          status: string | null
          subject: string
        }
        Insert: {
          email_type: string
          error_message?: string | null
          id?: number
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          email_type?: string
          error_message?: string | null
          id?: number
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: number
          name: string | null
          status: string | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: number
          name?: string | null
          status?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: number
          name?: string | null
          status?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          id: number
          page_path: string
          referrer: string | null
          user_agent: string | null
          user_ip: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: number
          page_path: string
          referrer?: string | null
          user_agent?: string | null
          user_ip?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: number
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
          user_ip?: string | null
          viewed_at?: string | null
        }
        Relationships: []
      }
      platforms: {
        Row: {
          character_limit: number | null
          created_at: string
          id: string
          name: string
          supports_hashtags: boolean | null
          supports_images: boolean | null
        }
        Insert: {
          character_limit?: number | null
          created_at?: string
          id?: string
          name: string
          supports_hashtags?: boolean | null
          supports_images?: boolean | null
        }
        Update: {
          character_limit?: number | null
          created_at?: string
          id?: string
          name?: string
          supports_hashtags?: boolean | null
          supports_images?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_name: string | null
          business_type: string | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      search_logs: {
        Row: {
          id: number
          query: string
          results_count: number | null
          searched_at: string | null
          user_ip: string | null
        }
        Insert: {
          id?: number
          query: string
          results_count?: number | null
          searched_at?: string | null
          user_ip?: string | null
        }
        Update: {
          id?: number
          query?: string
          results_count?: number | null
          searched_at?: string | null
          user_ip?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          created_at: string | null
          id: number
          key: string
          section: string
          type: string | null
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          key: string
          section: string
          type?: string | null
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: number
          key?: string
          section?: string
          type?: string | null
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          approved: boolean | null
          avatar_url: string | null
          company: string | null
          content: string
          created_at: string | null
          featured: boolean | null
          id: number
          name: string
          position: string | null
          rating: number | null
        }
        Insert: {
          approved?: boolean | null
          avatar_url?: string | null
          company?: string | null
          content: string
          created_at?: string | null
          featured?: boolean | null
          id?: number
          name: string
          position?: string | null
          rating?: number | null
        }
        Update: {
          approved?: boolean | null
          avatar_url?: string | null
          company?: string | null
          content?: string
          created_at?: string | null
          featured?: boolean | null
          id?: number
          name?: string
          position?: string | null
          rating?: number | null
        }
        Relationships: []
      }
      voice_samples: {
        Row: {
          created_at: string
          id: string
          sample_text: string
          source_type: string
          tone_metrics: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sample_text: string
          source_type?: string
          tone_metrics?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sample_text?: string
          source_type?: string
          tone_metrics?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_samples_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      exec_sql: {
        Args: { sql: string }
        Returns: string
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
