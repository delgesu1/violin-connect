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
      attachment_associations: {
        Row: {
          attachment_id: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          attachment_id: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          attachment_id?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      attachments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          mime_type: string | null
          name: string
          size: number | null
          type: string
          updated_at: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          name: string
          size?: number | null
          type: string
          updated_at?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          name?: string
          size?: number | null
          type?: string
          updated_at?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          created_at: string | null
          description: string | null
          end_time: string
          event_type: string
          id: string
          lesson_id: string | null
          location: string | null
          recurrence_rule: string | null
          start_time: string
          student_id: string | null
          teacher_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          all_day?: boolean | null
          created_at?: string | null
          description?: string | null
          end_time: string
          event_type: string
          id?: string
          lesson_id?: string | null
          location?: string | null
          recurrence_rule?: string | null
          start_time: string
          student_id?: string | null
          teacher_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          all_day?: boolean | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          event_type?: string
          id?: string
          lesson_id?: string | null
          location?: string | null
          recurrence_rule?: string | null
          start_time?: string
          student_id?: string | null
          teacher_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          metadata: Json | null
          status: string
          student_id: string | null
          student_name: string | null
          teacher_id: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          metadata?: Json | null
          status?: string
          student_id?: string | null
          student_name?: string | null
          teacher_id: string
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          metadata?: Json | null
          status?: string
          student_id?: string | null
          student_name?: string | null
          teacher_id?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          beautified: string | null
          created_at: string
          date: string
          frustrations: string | null
          id: string
          improvements: string | null
          notes: string | null
          practice_goals: string | null
          updated_at: string
          user_id: string
          went_well: string | null
        }
        Insert: {
          beautified?: string | null
          created_at?: string
          date: string
          frustrations?: string | null
          id?: string
          improvements?: string | null
          notes?: string | null
          practice_goals?: string | null
          updated_at?: string
          user_id: string
          went_well?: string | null
        }
        Update: {
          beautified?: string | null
          created_at?: string
          date?: string
          frustrations?: string | null
          id?: string
          improvements?: string | null
          notes?: string | null
          practice_goals?: string | null
          updated_at?: string
          user_id?: string
          went_well?: string | null
        }
        Relationships: []
      }
      journal_insights: {
        Row: {
          challenges: Json | null
          created_at: string
          generation_method: string | null
          id: string
          last_generated_at: string | null
          strengths: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          challenges?: Json | null
          created_at?: string
          generation_method?: string | null
          id?: string
          last_generated_at?: string | null
          strengths?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          challenges?: Json | null
          created_at?: string
          generation_method?: string | null
          id?: string
          last_generated_at?: string | null
          strengths?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_events: {
        Row: {
          calendar_event_id: string | null
          end_time: string | null
          lesson_id: string | null
          location: string | null
          notes: string | null
          start_time: string | null
          student_avatar: string | null
          student_id: string | null
          student_name: string | null
          summary: string | null
          user_id: string | null
        }
        Insert: {
          calendar_event_id?: string | null
          end_time?: string | null
          lesson_id?: string | null
          location?: string | null
          notes?: string | null
          start_time?: string | null
          student_avatar?: string | null
          student_id?: string | null
          student_name?: string | null
          summary?: string | null
          user_id?: string | null
        }
        Update: {
          calendar_event_id?: string | null
          end_time?: string | null
          lesson_id?: string | null
          location?: string | null
          notes?: string | null
          start_time?: string | null
          student_avatar?: string | null
          student_id?: string | null
          student_name?: string | null
          summary?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lesson_history_with_repertoire: {
        Row: {
          end_time: string | null
          lesson_date: string | null
          lesson_id: string | null
          repertoire_pieces: string[] | null
          start_time: string | null
          student_id: string | null
          student_name: string | null
        }
        Insert: {
          end_time?: string | null
          lesson_date?: string | null
          lesson_id?: string | null
          repertoire_pieces?: string[] | null
          start_time?: string | null
          student_id?: string | null
          student_name?: string | null
        }
        Update: {
          end_time?: string | null
          lesson_date?: string | null
          lesson_id?: string | null
          repertoire_pieces?: string[] | null
          start_time?: string | null
          student_id?: string | null
          student_name?: string | null
        }
        Relationships: []
      }
      lesson_repertoire: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          notes: string | null
          progress: string | null
          student_piece_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          notes?: string | null
          progress?: string | null
          student_piece_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          notes?: string | null
          progress?: string | null
          student_piece_id?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          ai_summary: string | null
          created_at: string
          date: string
          end_time: string | null
          id: string
          location: string | null
          notes: string | null
          start_time: string | null
          status: string | null
          student_id: string
          summary: string | null
          teacher_id: string | null
          transcript_url: string | null
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          date: string
          end_time?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          start_time?: string | null
          status?: string | null
          student_id: string
          summary?: string | null
          teacher_id?: string | null
          transcript_url?: string | null
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          start_time?: string | null
          status?: string | null
          student_id?: string
          summary?: string | null
          teacher_id?: string | null
          transcript_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      master_repertoire: {
        Row: {
          composer: string | null
          created_at: string
          difficulty: string | null
          genre: string | null
          id: string
          instrument: string | null
          level: string | null
          notes: string | null
          period: string | null
          started_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          composer?: string | null
          created_at?: string
          difficulty?: string | null
          genre?: string | null
          id?: string
          instrument?: string | null
          level?: string | null
          notes?: string | null
          period?: string | null
          started_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          composer?: string | null
          created_at?: string
          difficulty?: string | null
          genre?: string | null
          id?: string
          instrument?: string | null
          level?: string | null
          notes?: string | null
          period?: string | null
          started_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      repertoire_files: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          master_piece_id: string
          updated_at: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          master_piece_id: string
          updated_at?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          master_piece_id?: string
          updated_at?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      repertoire_links: {
        Row: {
          created_at: string
          description: string | null
          id: string
          link_type: string | null
          master_piece_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          link_type?: string | null
          master_piece_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          link_type?: string | null
          master_piece_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      student_performance_history: {
        Row: {
          assigned_date: string | null
          completed_date: string | null
          composer: string | null
          repertoire_id: string | null
          status: string | null
          student_id: string | null
          student_name: string | null
          title: string | null
        }
        Insert: {
          assigned_date?: string | null
          completed_date?: string | null
          composer?: string | null
          repertoire_id?: string | null
          status?: string | null
          student_id?: string | null
          student_name?: string | null
          title?: string | null
        }
        Update: {
          assigned_date?: string | null
          completed_date?: string | null
          composer?: string | null
          repertoire_id?: string | null
          status?: string | null
          student_id?: string | null
          student_name?: string | null
          title?: string | null
        }
        Relationships: []
      }
      student_repertoire: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          master_piece_id: string
          notes: string | null
          performance_date: string | null
          performance_location: string | null
          start_date: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          master_piece_id: string
          notes?: string | null
          performance_date?: string | null
          performance_location?: string | null
          start_date?: string | null
          status: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          master_piece_id?: string
          notes?: string | null
          performance_date?: string | null
          performance_location?: string | null
          start_date?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_teacher_relationships: {
        Row: {
          created_at: string
          id: string
          status: string
          student_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          student_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          student_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          academic_year: string | null
          avatar_url: string | null
          created_at: string
          difficulty_level: string | null
          email: string | null
          id: string
          last_lesson_date: string | null
          level: string | null
          name: string
          next_lesson: string | null
          next_lesson_id: string | null
          phone: string | null
          start_date: string | null
          unread_messages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_year?: string | null
          avatar_url?: string | null
          created_at?: string
          difficulty_level?: string | null
          email?: string | null
          id?: string
          last_lesson_date?: string | null
          level?: string | null
          name: string
          next_lesson?: string | null
          next_lesson_id?: string | null
          phone?: string | null
          start_date?: string | null
          unread_messages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_year?: string | null
          avatar_url?: string | null
          created_at?: string
          difficulty_level?: string | null
          email?: string | null
          id?: string
          last_lesson_date?: string | null
          level?: string | null
          name?: string
          next_lesson?: string | null
          next_lesson_id?: string | null
          phone?: string | null
          start_date?: string | null
          unread_messages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      upcoming_lessons: {
        Row: {
          avatar_url: string | null
          date: string | null
          end_time: string | null
          id: string | null
          location: string | null
          notes: string | null
          start_time: string | null
          status: string | null
          student_id: string | null
          student_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          date?: string | null
          end_time?: string | null
          id?: string | null
          location?: string | null
          notes?: string | null
          start_time?: string | null
          status?: string | null
          student_id?: string | null
          student_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          date?: string | null
          end_time?: string | null
          id?: string | null
          location?: string | null
          notes?: string | null
          start_time?: string | null
          status?: string | null
          student_id?: string | null
          student_name?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_invitation_valid: {
        Args: {
          token_param: string
        }
        Returns: boolean
      }
      is_user_student: {
        Args: {
          user_id_param: string
        }
        Returns: boolean
      }
      is_user_teacher: {
        Args: {
          user_id_param: string
        }
        Returns: boolean
      }
      upsert_journal_entry: {
        Args: {
          p_id: string
          p_user_id: string
          p_date: string
          p_practice_goals?: string
          p_notes?: string
          p_went_well?: string
          p_beautified?: string
          p_frustrations?: string
          p_improvements?: string
          p_created_at?: string
          p_updated_at?: string
        }
        Returns: string
      }
      upsert_lesson: {
        Args: {
          p_id: string
          p_student_id: string
          p_date: string
          p_summary?: string
          p_notes?: string
          p_created_at?: string
          p_updated_at?: string
          p_teacher_id?: string
          p_start_time?: string
          p_end_time?: string
          p_location?: string
          p_status?: string
          p_ai_summary?: string
          p_transcript?: string
        }
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

