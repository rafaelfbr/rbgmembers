export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      niches: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      languages: {
        Row: {
          id: string
          name: string
          code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          cover_image: string | null
          niche_id: string | null
          language_id: string | null
          is_course: boolean
          is_ebook: boolean
          is_material: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          cover_image?: string | null
          niche_id?: string | null
          language_id?: string | null
          is_course?: boolean
          is_ebook?: boolean
          is_material?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          cover_image?: string | null
          niche_id?: string | null
          language_id?: string | null
          is_course?: boolean
          is_ebook?: boolean
          is_material?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_products: {
        Row: {
          id: string
          user_id: string
          product_id: string
          access_granted_at: string
          access_expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          access_granted_at?: string
          access_expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          access_granted_at?: string
          access_expires_at?: string | null
          created_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          product_id: string
          title: string
          description: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          title: string
          description?: string | null
          position: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          title?: string
          description?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string | null
          video_url: string | null
          position: number
          duration: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          description?: string | null
          video_url?: string | null
          position: number
          duration?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          description?: string | null
          video_url?: string | null
          position?: number
          duration?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          lesson_id: string | null
          product_id: string | null
          title: string
          description: string | null
          file_url: string
          file_type: string
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id?: string | null
          product_id?: string | null
          title: string
          description?: string | null
          file_url: string
          file_type: string
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string | null
          product_id?: string | null
          title?: string
          description?: string | null
          file_url?: string
          file_type?: string
          created_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          last_position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          last_position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed?: boolean
          last_position?: number
          created_at?: string
          updated_at?: string
        }
      }
      webhooks: {
        Row: {
          id: string
          source: string
          event_type: string
          payload: Json | null
          processed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          source: string
          event_type: string
          payload?: Json | null
          processed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          source?: string
          event_type?: string
          payload?: Json | null
          processed?: boolean
          created_at?: string
        }
      }
    }
  }
}
