import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'
import { getMockSupabaseClient, CookieStore } from './mock'

export async function createClient() {
  const cookieStore = await cookies()

  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isPlaceholder = !supabaseUrl || !supabaseUrl.startsWith('http') || supabaseUrl.includes('placeholder-project');

  if (isPlaceholder) {
    const serverCookieStore: CookieStore = {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        cookieStore.set(name, value, options);
      },
      delete(name) {
        cookieStore.delete(name);
      }
    };
    return getMockSupabaseClient(serverCookieStore);
  }

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
                      'placeholder-anon-key';

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
