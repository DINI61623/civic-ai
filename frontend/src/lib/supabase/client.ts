import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'
import { getMockSupabaseClient, CookieStore } from './mock'

let client: any = null;

const clientCookieStore: CookieStore = {
  get(name) {
    if (typeof window === 'undefined') return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(';').shift()!);
    return undefined;
  },
  set(name, value) {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000`;
  },
  delete(name) {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=; path=/; max-age=-1`;
  }
};

export function createClient() {
  if (client) return client;

  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isPlaceholder = !supabaseUrl || !supabaseUrl.startsWith('http') || supabaseUrl.includes('placeholder-project');

  if (isPlaceholder) {
    client = getMockSupabaseClient(clientCookieStore);
    return client;
  }

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
                      'placeholder-anon-key';
  client = createBrowserClient<Database>(supabaseUrl, supabaseKey);
  return client;
}
