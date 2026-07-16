import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (client) return client;

  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    supabaseUrl = 'https://placeholder-project.supabase.co';
  }
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  client = createBrowserClient<Database>(supabaseUrl, supabaseKey);
  return client;
}
