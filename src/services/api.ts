import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

export type Exam = Database['public']['Tables']['exams']['Row'] & { states?: { name: string } | null, departments?: { name: string } | null };
export type Scheme = Database['public']['Tables']['schemes']['Row'] & { states?: { name: string } | null, departments?: { name: string } | null };
export type Scholarship = Database['public']['Tables']['scholarships']['Row'] & { states?: { name: string } | null };
export type Education = Database['public']['Tables']['education']['Row'] & { states?: { name: string } | null };

export const api = {
  // --- Exams ---
  async getExams(searchQuery?: string, qualification?: string, stateName?: string, page = 0, limit = 50) {
    const supabase = createClient();
    
    // We want to return both All India and the specific state if stateName is provided
    let query = supabase.from('exams').select('*, states!inner(name), departments(name)', { count: 'exact' });
    
    if (stateName && stateName !== 'All India') {
      query = query.in('states.name', ['All India', stateName]);
    }

    if (searchQuery) {
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

  async getTrendingExams(limit = 3) {
    const supabase = createClient();
    // In a real app this might use analytics, here we order by vacancies or random
    const { data, error } = await supabase.from('exams')
      .select('*, states(name), departments(name)')
      .order('vacancies', { ascending: false, nullsFirst: false })
      .limit(limit);
    if (error) throw error;
    return data as Exam[];
  },

  async getLatestNotifications(limit = 5) {
    const supabase = createClient();
    const { data, error } = await supabase.from('exams')
      .select('*, states(name), departments(name)')
      .order('notification_date', { ascending: false, nullsFirst: false })
      .limit(limit);
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
  async getSchemes(searchQuery?: string, category?: string, stateName?: string, page = 0, limit = 50) {
    const supabase = createClient();
    let query = supabase.from('schemes').select('*, states!inner(name), departments(name)', { count: 'exact' });
    
    if (stateName && stateName !== 'All India') {
      query = query.in('states.name', ['All India', stateName]);
    }

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

  async getLatestSchemes(limit = 3) {
    const supabase = createClient();
    const { data, error } = await supabase.from('schemes')
      .select('*, states(name), departments(name)')
      .order('last_updated', { ascending: false })
      .limit(limit);
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
  async getScholarships(searchQuery?: string, type?: string, stateName?: string, page = 0, limit = 50) {
    const supabase = createClient();
    let query = supabase.from('scholarships').select('*, states!inner(name)', { count: 'exact' });
    
    if (stateName && stateName !== 'All India') {
      query = query.in('states.name', ['All India', stateName]);
    }

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
  async getEducation(searchQuery?: string, category?: string, stateName?: string, page = 0, limit = 50) {
    const supabase = createClient();
    let query = supabase.from('education').select('*, states!inner(name)', { count: 'exact' });
    
    if (stateName && stateName !== 'All India') {
      query = query.in('states.name', ['All India', stateName]);
    }

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

  async getEducationById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('education').select('*, states(name)').eq('id', id).single();
    if (error) throw error;
    return data as Education;
  },

  // --- Global Search ---
  async globalSearch(queryStr: string) {
    if (!queryStr || queryStr.length < 2) return { exams: [], schemes: [], scholarships: [], education: [] };
    const supabase = createClient();
    
    const [exams, schemes, scholarships, education] = await Promise.all([
      supabase.from('exams').select('id, title, states(name)').or(`title.ilike.%${queryStr}%,description.ilike.%${queryStr}%`).limit(3),
      supabase.from('schemes').select('id, title, states(name)').or(`title.ilike.%${queryStr}%,description.ilike.%${queryStr}%`).limit(3),
      supabase.from('scholarships').select('id, title, states(name)').or(`title.ilike.%${queryStr}%,description.ilike.%${queryStr}%`).limit(3),
      supabase.from('education').select('id, title, states(name)').or(`title.ilike.%${queryStr}%,details.ilike.%${queryStr}%`).limit(3),
    ]);

    return {
      exams: exams.data || [],
      schemes: schemes.data || [],
      scholarships: scholarships.data || [],
      education: education.data || []
    };
  },

  // --- Stats ---
  async getStatistics() {
    const supabase = createClient();
    const [exams, schemes, scholarships] = await Promise.all([
      supabase.from('exams').select('*', { count: 'exact', head: true }),
      supabase.from('schemes').select('*', { count: 'exact', head: true }),
      supabase.from('scholarships').select('*', { count: 'exact', head: true })
    ]);
    return {
      examsCount: exams.count || 24,
      schemesCount: schemes.count || 15,
      scholarshipsCount: scholarships.count || 8,
      usersCount: 142 // Mock for now
    };
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

    const { error } = await (supabase.from('saved_items') as any)
      .insert({ user_id: user.id, item_type: itemType, item_id: itemId });
    
    if (error) throw error;
  },

  async unsaveItem(itemType: string, itemId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in to unsave items");

    const { error } = await (supabase.from('saved_items') as any)
      .delete()
      .match({ user_id: user.id, item_type: itemType, item_id: itemId });
    
    if (error) throw error;
  },
  
  async removeSavedItem(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
  
  async isItemSaved(itemType: string, itemId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data } = await supabase
      .from('saved_items')
      .select('id')
      .match({ user_id: user.id, item_type: itemType, item_id: itemId })
      .maybeSingle();
      
    return !!data;
  }
};
