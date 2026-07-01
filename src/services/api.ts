import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

// Types
export type Exam = Database['public']['Tables']['exams']['Row'] & { states?: { name: string } | null, departments?: { name: string } | null };
export type Scheme = Database['public']['Tables']['schemes']['Row'] & { states?: { name: string } | null, departments?: { name: string } | null };
export type Scholarship = Database['public']['Tables']['scholarships']['Row'] & { states?: { name: string } | null };
export type Education = Database['public']['Tables']['education']['Row'] & { states?: { name: string } | null };

export const api = {
  // --- Exams ---
  async getExams(searchQuery?: string, qualification?: string) {
    const supabase = createClient();
    let query = supabase.from('exams').select('*, states(name), departments(name)');
    
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }
    if (qualification && qualification !== 'Any Qualification') {
      query = query.ilike('qualification', `%${qualification}%`);
    }

    const { data, error } = await query.order('last_updated', { ascending: false });
    if (error) throw error;
    return data as Exam[];
  },

  async getExamById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('exams').select('*, states(name), departments(name)').eq('id', id).single();
    if (error) throw error;
    return data as Exam;
  },

  // --- Schemes ---
  async getSchemes(searchQuery?: string, category?: string) {
    const supabase = createClient();
    let query = supabase.from('schemes').select('*, states(name), departments(name)');
    
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }
    if (category && category !== 'All Categories') {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('last_updated', { ascending: false });
    if (error) throw error;
    return data as Scheme[];
  },

  async getSchemeById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('schemes').select('*, states(name), departments(name)').eq('id', id).single();
    if (error) throw error;
    return data as Scheme;
  },

  // --- Scholarships ---
  async getScholarships(searchQuery?: string, type?: string) {
    const supabase = createClient();
    let query = supabase.from('scholarships').select('*, states(name)');
    
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }
    if (type && type !== 'All Types') {
      query = query.eq('type', type);
    }

    const { data, error } = await query.order('last_updated', { ascending: false });
    if (error) throw error;
    return data as Scholarship[];
  },

  async getScholarshipById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('scholarships').select('*, states(name)').eq('id', id).single();
    if (error) throw error;
    return data as Scholarship;
  },

  // --- Education ---
  async getEducation(searchQuery?: string, category?: string) {
    const supabase = createClient();
    let query = supabase.from('education').select('*, states(name)');
    
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }
    if (category && category !== 'All Categories') {
      // Map frontend category options to DB types
      const typeMap: Record<string, string> = {
        'Universities': 'University',
        'Entrance Exams': 'Entrance Exam',
        'Fellowships': 'Fellowship'
      };
      const dbType = typeMap[category];
      if (dbType) {
        query = query.eq('type', dbType);
      }
    }

    const { data, error } = await query.order('last_updated', { ascending: false });
    if (error) throw error;
    return data as Education[];
  },

  async getEducationById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('education').select('*, states(name)').eq('id', id).single();
    if (error) throw error;
    return data as Education;
  },

  // --- User Saved Items ---
  async getSavedItems() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async saveItem(itemType: string, itemId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in to save items");

    const { error } = await supabase
      .from('saved_items')
      .insert({ user_id: user.id, item_type: itemType, item_id: itemId });
    
    if (error) throw error;
  },

  async unsaveItem(itemType: string, itemId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in to unsave items");

    const { error } = await supabase
      .from('saved_items')
      .delete()
      .match({ user_id: user.id, item_type: itemType, item_id: itemId });
    
    if (error) throw error;
  }
};
