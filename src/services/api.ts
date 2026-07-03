import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

export type Exam = Database['public']['Tables']['exams']['Row'] & { states?: { name: string } | null, departments?: { name: string } | null };
export type Scheme = Database['public']['Tables']['schemes']['Row'] & { states?: { name: string } | null, departments?: { name: string } | null };
export type Scholarship = Database['public']['Tables']['scholarships']['Row'] & { states?: { name: string } | null };
export type Education = Database['public']['Tables']['education']['Row'] & { states?: { name: string } | null };

export const api = {
  // --- Exams ---
  async getExams(searchQuery?: string, qualification?: string, page = 0, limit = 50) {
    const supabase = createClient();
    let query = supabase.from('exams').select('*, states(name), departments(name)', { count: 'exact' });
    
    if (searchQuery) {
      // Use textSearch for natural language matching if full-text search is setup, fallback to ilike
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    if (qualification && qualification !== 'Any Qualification') {
      query = query.ilike('qualification', `%${qualification}%`);
    }

    const { data, count, error } = await query
      .order('last_updated', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
      
    if (error) throw error;
    return { data: data as Exam[], count };
  },

  async getExamById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('exams').select('*, states(name), departments(name)').eq('id', id).single();
    if (error) throw error;
    return data as Exam;
  },

  // --- Schemes ---
  async getSchemes(searchQuery?: string, category?: string, page = 0, limit = 50) {
    const supabase = createClient();
    let query = supabase.from('schemes').select('*, states(name), departments(name)', { count: 'exact' });
    
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    if (category && category !== 'All Categories') {
      query = query.eq('category', category);
    }

    const { data, count, error } = await query
      .order('last_updated', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
      
    if (error) throw error;
    return { data: data as Scheme[], count };
  },

  async getSchemeById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('schemes').select('*, states(name), departments(name)').eq('id', id).single();
    if (error) throw error;
    return data as Scheme;
  },

  // --- Scholarships ---
  async getScholarships(searchQuery?: string, type?: string, page = 0, limit = 50) {
    const supabase = createClient();
    let query = supabase.from('scholarships').select('*, states(name)', { count: 'exact' });
    
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    if (type && type !== 'All Types') {
      query = query.eq('type', type);
    }

    const { data, count, error } = await query
      .order('last_updated', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
      
    if (error) throw error;
    return { data: data as Scholarship[], count };
  },

  async getScholarshipById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('scholarships').select('*, states(name)').eq('id', id).single();
    if (error) throw error;
    return data as Scholarship;
  },

  // --- Education ---
  async getEducation(searchQuery?: string, category?: string, page = 0, limit = 50) {
    const supabase = createClient();
    let query = supabase.from('education').select('*, states(name)', { count: 'exact' });
    
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,details.ilike.%${searchQuery}%`);
    }
    if (category && category !== 'All Categories') {
      const typeMap: Record<string, string> = {
        'Universities': 'University',
        'Entrance Exams': 'Entrance Exam',
        'Fellowships': 'Fellowship'
      };
      const dbType = typeMap[category];
      if (dbType) query = query.eq('type', dbType);
    }

    const { data, count, error } = await query
      .order('last_updated', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
      
    if (error) throw error;
    return { data: data as Education[], count };
  },

  // --- User Profile & Admin ---
  async getUserProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
    return data;
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
  },
  
  async isItemSaved(itemType: string, itemId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('saved_items')
      .select('id')
      .match({ user_id: user.id, item_type: itemType, item_id: itemId })
      .maybeSingle();
      
    return !!data;
  }
};
