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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
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
          source: string | null
          verification_status: string | null
        }
        Insert: {
          details?: string | null
          id?: string
          last_updated?: string | null
          official_website?: string | null
          state_id?: string | null
          title: string
          type?: string | null
          source?: string | null
          verification_status?: string | null
        }
        Update: {
          details?: string | null
          id?: string
          last_updated?: string | null
          official_website?: string | null
          state_id?: string | null
          title?: string
          type?: string | null
          source?: string | null
          verification_status?: string | null
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
          source: string | null
          verification_status: string | null
          salary: string | null
          vacancies: number | null
          category: string | null
          selection_process: string | null
          exam_pattern: string | null
          syllabus_link: string | null
          previous_papers_link: string | null
          notification_date: string | null
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
          source?: string | null
          verification_status?: string | null
          salary?: string | null
          vacancies?: number | null
          category?: string | null
          selection_process?: string | null
          exam_pattern?: string | null
          syllabus_link?: string | null
          previous_papers_link?: string | null
          notification_date?: string | null
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
          source?: string | null
          verification_status?: string | null
          salary?: string | null
          vacancies?: number | null
          category?: string | null
          selection_process?: string | null
          exam_pattern?: string | null
          syllabus_link?: string | null
          previous_papers_link?: string | null
          notification_date?: string | null
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
          source: string | null
          verification_status: string | null
          ministry: string | null
          application_start_date: string | null
          application_end_date: string | null
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
          source?: string | null
          verification_status?: string | null
          ministry?: string | null
          application_start_date?: string | null
          application_end_date?: string | null
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
          source?: string | null
          verification_status?: string | null
          ministry?: string | null
          application_start_date?: string | null
          application_end_date?: string | null
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
          source: string | null
          verification_status: string | null
          income_limit: string | null
          documents_required: string | null
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
          source?: string | null
          verification_status?: string | null
          income_limit?: string | null
          documents_required?: string | null
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
          source?: string | null
          verification_status?: string | null
          income_limit?: string | null
          documents_required?: string | null
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
