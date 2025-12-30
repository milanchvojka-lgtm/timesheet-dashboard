export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          costlocker_person_id: number | null
          is_team_member: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          costlocker_person_id?: number | null
          is_team_member?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          costlocker_person_id?: number | null
          is_team_member?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      planned_fte: {
        Row: {
          id: string
          user_id: string
          person_name: string
          fte_value: number
          valid_from: string
          valid_to: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          person_name: string
          fte_value: number
          valid_from: string
          valid_to?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          person_name?: string
          fte_value?: number
          valid_from?: string
          valid_to?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planned_fte_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_fte_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_keywords: {
        Row: {
          id: string
          keyword: string
          category: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          keyword: string
          category: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          keyword?: string
          category?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_keywords_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_log: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string | null
          old_values: Json | null
          new_values: Json | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          value_type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array'
          is_public: boolean
          created_at: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          value_type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array'
          is_public?: boolean
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          value_type?: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array'
          is_public?: boolean
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ignored_timesheets: {
        Row: {
          id: string
          user_id: string
          costlocker_timesheet_id: number
          person_name: string
          project_name: string
          activity_name: string
          date: string
          hours: number
          reason: string | null
          ignored_at: string
          ignored_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          costlocker_timesheet_id: number
          person_name: string
          project_name: string
          activity_name: string
          date: string
          hours: number
          reason?: string | null
          ignored_at?: string
          ignored_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          costlocker_timesheet_id?: number
          person_name?: string
          project_name?: string
          activity_name?: string
          date?: string
          hours?: number
          reason?: string | null
          ignored_at?: string
          ignored_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ignored_timesheets_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ignored_timesheets_ignored_by_fkey"
            columns: ["ignored_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      upload_history: {
        Row: {
          id: string
          filename: string
          file_size: number
          file_type: string
          total_rows: number
          successful_rows: number
          failed_rows: number
          data_date_from: string | null
          data_date_to: string | null
          uploaded_by_email: string
          uploaded_by_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          filename: string
          file_size: number
          file_type: string
          total_rows: number
          successful_rows: number
          failed_rows: number
          data_date_from?: string | null
          data_date_to?: string | null
          uploaded_by_email: string
          uploaded_by_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          filename?: string
          file_size?: number
          file_type?: string
          total_rows?: number
          successful_rows?: number
          failed_rows?: number
          data_date_from?: string | null
          data_date_to?: string | null
          uploaded_by_email?: string
          uploaded_by_name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      timesheet_entries: {
        Row: {
          id: string
          person_id: number
          person_name: string
          person_email: string | null
          project_id: number
          project_name: string
          project_category: string
          activity_id: number
          activity_name: string
          date: string
          hours: number
          description: string | null
          approved: boolean
          billable: boolean
          upload_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          person_id: number
          person_name: string
          person_email?: string | null
          project_id: number
          project_name: string
          project_category: string
          activity_id: number
          activity_name: string
          date: string
          hours: number
          description?: string | null
          approved?: boolean
          billable?: boolean
          upload_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          person_id?: number
          person_name?: string
          person_email?: string | null
          project_id?: number
          project_name?: string
          project_category?: string
          activity_id?: number
          activity_name?: string
          date?: string
          hours?: number
          description?: string | null
          approved?: boolean
          billable?: boolean
          upload_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheet_entries_upload_id_fkey"
            columns: ["upload_id"]
            referencedRelation: "upload_history"
            referencedColumns: ["id"]
          }
        ]
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
