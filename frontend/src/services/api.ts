import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

export type Exam = Database['public']['Tables']['exams']['Row'] & { states?: { name: string } | null, departments?: { name: string } | null };
export type Scheme = Database['public']['Tables']['schemes']['Row'] & { states?: { name: string } | null, departments?: { name: string } | null };
export type Scholarship = Database['public']['Tables']['scholarships']['Row'] & { states?: { name: string } | null };
export type Education = Database['public']['Tables']['education']['Row'] & { states?: { name: string } | null };

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || '';

  const mockUserCookie = getCookie('sb-mock-user') || '';

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-mock-user': mockUserCookie,
      ...init?.headers
    }
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Database request failed');
  return body as T;
}

function listUrl(resource: string, options: Record<string, string | number | undefined> = {}) {
  const params = new URLSearchParams({ resource });
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return `/api/data?${params}`;
}

export const api = {
  getCollection<T>(resource: string, limit = 100) {
    return request<{ data: T[]; count: number }>(listUrl(resource, { limit }));
  },
  getStates() {
    return request<{ data: Database['public']['Tables']['states']['Row'][]; count: number }>(listUrl('states', { limit: 100, sort: 'name', direction: 'asc' }));
  },
  getExams(searchQuery?: string, qualification?: string, stateName?: string, page = 0, limit = 50) {
    return request<{ data: Exam[]; count: number }>(listUrl('exams', { q: searchQuery, field: qualification && qualification !== 'Any Qualification' ? 'qualification' : undefined, value: qualification && qualification !== 'Any Qualification' ? qualification : undefined, state: stateName, page, limit }));
  },
  async getTrendingExams(limit = 3) {
    return (await request<{ data: Exam[] }>(listUrl('exams', { limit, sort: 'vacancies' }))).data;
  },
  async getLatestNotifications(limit = 5) {
    return (await request<{ data: Exam[] }>(listUrl('exams', { limit, sort: 'notification_date' }))).data;
  },
  getExamById(id: string) { return request<Exam>(listUrl('exams', { id })); },
  getSchemes(searchQuery?: string, category?: string, stateName?: string, page = 0, limit = 50) {
    return request<{ data: Scheme[]; count: number }>(listUrl('schemes', { q: searchQuery, field: category && category !== 'All Categories' ? 'category' : undefined, value: category && category !== 'All Categories' ? category : undefined, state: stateName, page, limit }));
  },
  async getLatestSchemes(limit = 3) { return (await request<{ data: Scheme[] }>(listUrl('schemes', { limit }))).data; },
  getSchemeById(id: string) { return request<Scheme>(listUrl('schemes', { id })); },
  getScholarships(searchQuery?: string, type?: string, stateName?: string, page = 0, limit = 50) {
    return request<{ data: Scholarship[]; count: number }>(listUrl('scholarships', { q: searchQuery, field: type && type !== 'All Types' ? 'type' : undefined, value: type && type !== 'All Types' ? type : undefined, state: stateName, page, limit }));
  },
  getScholarshipById(id: string) { return request<Scholarship>(listUrl('scholarships', { id })); },
  getEducation(searchQuery?: string, category?: string, stateName?: string, page = 0, limit = 50) {
    const typeMap: Record<string, string> = { Universities: 'University', 'Entrance Exams': 'Entrance Exam', Fellowships: 'Fellowship' };
    const type = category ? typeMap[category] : undefined;
    return request<{ data: Education[]; count: number }>(listUrl('education', { q: searchQuery, field: type ? 'type' : undefined, value: type, state: stateName, page, limit }));
  },
  getEducationById(id: string) { return request<Education>(listUrl('education', { id })); },
  globalSearch(q: string) { return request<{ exams: Exam[]; schemes: Scheme[]; scholarships: Scholarship[]; education: Education[] }>(listUrl('search', { q })); },
  getStatistics() { return request<{ examsCount: number; schemesCount: number; scholarshipsCount: number; usersCount: number }>(listUrl('statistics')); },

  // Authentication remains in Supabase; application records are stored in MongoDB.
  async getUserProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
  async getSavedItems() { return (await request<{ data: Database['public']['Tables']['saved_items']['Row'][] }>(listUrl('saved-items'))).data; },
  saveItem(itemType: string, itemId: string) { return request<{ ok: boolean }>('/api/data', { method: 'POST', body: JSON.stringify({ itemType, itemId }) }); },
  unsaveItem(itemType: string, itemId: string) { return request<{ ok: boolean }>(`${listUrl('saved-items', { itemType, itemId })}`, { method: 'DELETE' }); },
  removeSavedItem(id: string) { return request<{ ok: boolean }>(`${listUrl('saved-items', { id })}`, { method: 'DELETE' }); },
  async isItemSaved(itemType: string, itemId: string) { return (await request<{ saved: boolean }>(listUrl('saved-status', { itemType, itemId }))).saved; },
};
