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
      departments: {
        Row: {
          id: string
          is_central: boolean | null
          name: string
          state_id: string | null
        }
        Insert: {
          id?: string
          is_central?: boolean | null
          name: string
          state_id?: string | null
        }
        Update: {
          id?: string
          is_central?: boolean | null
          name?: string
          state_id?: string | null
        }
      }
      education: {
        Row: {
          details: string | null
          id: string
          last_updated: string | null
          official_website: string | null
          state_id: string | null
          title: string
          type: string | null
        }
        Insert: {
          details?: string | null
          id?: string
          last_updated?: string | null
          official_website?: string | null
          state_id?: string | null
          title: string
          type?: string | null
        }
        Update: {
          details?: string | null
          id?: string
          last_updated?: string | null
          official_website?: string | null
          state_id?: string | null
          title?: string
          type?: string | null
        }
      }
      exams: {
        Row: {
          age_limit: string | null
          apply_link: string | null
          department_id: string | null
          description: string | null
          eligibility: string | null
          id: string
          last_date: string | null
          last_updated: string | null
          notification_url: string | null
          official_website: string | null
          qualification: string | null
          start_date: string | null
          state_id: string | null
          title: string
        }
        Insert: {
          age_limit?: string | null
          apply_link?: string | null
          department_id?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          last_date?: string | null
          last_updated?: string | null
          notification_url?: string | null
          official_website?: string | null
          qualification?: string | null
          start_date?: string | null
          state_id?: string | null
          title: string
        }
        Update: {
          age_limit?: string | null
          apply_link?: string | null
          department_id?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          last_date?: string | null
          last_updated?: string | null
          notification_url?: string | null
          official_website?: string | null
          qualification?: string | null
          start_date?: string | null
          state_id?: string | null
          title?: string
        }
      }
      saved_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
      }
      schemes: {
        Row: {
          apply_link: string | null
          benefits: string | null
          category: string | null
          department_id: string | null
          description: string | null
          eligibility: string | null
          id: string
          last_updated: string | null
          official_website: string | null
          required_documents: string | null
          state_id: string | null
          title: string
        }
        Insert: {
          apply_link?: string | null
          benefits?: string | null
          category?: string | null
          department_id?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          last_updated?: string | null
          official_website?: string | null
          required_documents?: string | null
          state_id?: string | null
          title: string
        }
        Update: {
          apply_link?: string | null
          benefits?: string | null
          category?: string | null
          department_id?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          last_updated?: string | null
          official_website?: string | null
          required_documents?: string | null
          state_id?: string | null
          title?: string
        }
      }
      scholarships: {
        Row: {
          apply_link: string | null
          description: string | null
          eligibility: string | null
          id: string
          last_date: string | null
          last_updated: string | null
          official_website: string | null
          state_id: string | null
          title: string
          type: string | null
        }
        Insert: {
          apply_link?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          last_date?: string | null
          last_updated?: string | null
          official_website?: string | null
          state_id?: string | null
          title: string
          type?: string | null
        }
        Update: {
          apply_link?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          last_date?: string | null
          last_updated?: string | null
          official_website?: string | null
          state_id?: string | null
          title?: string
          type?: string | null
        }
      }
      states: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
      }
    }
  }
}
