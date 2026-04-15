export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      course_specializations: {
        Row: {
          course_id: string
          role: string
          specialization_id: number
        }
        Insert: {
          course_id: string
          role: string
          specialization_id: number
        }
        Update: {
          course_id?: string
          role?: string
          specialization_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_specializations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_specializations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_specializations_specialization_id_fkey"
            columns: ["specialization_id"]
            isOneToOne: false
            referencedRelation: "specializations"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          color: string
          created_at: string
          description: string
          ec: number
          icon: string
          id: string
          studiegids_url: string
          title: string
        }
        Insert: {
          code: string
          color?: string
          created_at?: string
          description: string
          ec?: number
          icon?: string
          id?: string
          studiegids_url: string
          title: string
        }
        Update: {
          code?: string
          color?: string
          created_at?: string
          description?: string
          ec?: number
          icon?: string
          id?: string
          studiegids_url?: string
          title?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_id: string
          body: string
          course_id: string
          created_at: string
          difficulty: number
          id: string
          rating: number
          title: string
          workload_hours: number
        }
        Insert: {
          author_id: string
          body: string
          course_id: string
          created_at?: string
          difficulty: number
          id?: string
          rating: number
          title: string
          workload_hours: number
        }
        Update: {
          author_id?: string
          body?: string
          course_id?: string
          created_at?: string
          difficulty?: number
          id?: string
          rating?: number
          title?: string
          workload_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      specializations: {
        Row: {
          code: string
          id: number
          name: string
          study_id: string | null
        }
        Insert: {
          code: string
          id?: number
          name: string
          study_id?: string | null
        }
        Update: {
          code?: string
          id?: number
          name?: string
          study_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      courses_with_stats: {
        Row: {
          avg_difficulty: number | null
          avg_rating: number | null
          avg_workload: number | null
          code: string | null
          color: string | null
          created_at: string | null
          description: string | null
          ec: number | null
          icon: string | null
          id: string | null
          review_count: number | null
          studiegids_url: string | null
          title: string | null
        }
        Relationships: []
      }
      reviews_public: {
        Row: {
          body: string | null
          course_id: string | null
          created_at: string | null
          difficulty: number | null
          id: string | null
          rating: number | null
          title: string | null
          workload_hours: number | null
        }
        Insert: {
          body?: string | null
          course_id?: string | null
          created_at?: string | null
          difficulty?: number | null
          id?: string | null
          rating?: number | null
          title?: string | null
          workload_hours?: number | null
        }
        Update: {
          body?: string | null
          course_id?: string | null
          created_at?: string | null
          difficulty?: number | null
          id?: string | null
          rating?: number | null
          title?: string | null
          workload_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

