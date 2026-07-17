export interface CookieStore {
  get(name: string): string | undefined;
  set(name: string, value: string, options?: any): void;
  delete(name: string): void;
}

const authListeners = new Set<(event: string, session: any) => void>();

export function getMockSupabaseClient(cookieStore: CookieStore) {
  const triggerAuthStateChange = (event: string, user: any) => {
    console.log(`[Mock Auth] Triggering auth state change: ${event}`);
    const session = user ? { user, access_token: 'mock-access-token' } : null;
    authListeners.forEach(listener => {
      try {
        listener(event, session);
      } catch (e) {
        console.error('[Mock Auth] Error in auth state change listener:', e);
      }
    });
  };

  return {
    auth: {
      async getUser() {
        const userCookie = cookieStore.get('sb-mock-user');
        console.log('[Mock Auth] getUser called, cookie value:', userCookie ? 'exists' : 'null');
        if (userCookie) {
          try {
            return { data: { user: JSON.parse(userCookie) }, error: null };
          } catch (e) {}
        }
        return { data: { user: null }, error: null };
      },
      async getSession() {
        const userCookie = cookieStore.get('sb-mock-user');
        console.log('[Mock Auth] getSession called, cookie value:', userCookie ? 'exists' : 'null');
        if (userCookie) {
          try {
            const user = JSON.parse(userCookie);
            return { data: { session: { user, access_token: 'mock-access-token' } }, error: null };
          } catch (e) {}
        }
        return { data: { session: null }, error: null };
      },
      async signInWithOAuth(options: any) {
        console.log('[Mock Auth] signInWithOAuth called with options:', options);
        const mockUser = {
          id: 'mock-user-1234',
          email: 'citizen.demouser@gmail.com',
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            name: 'Citizen Demo User',
            avatar_url: 'https://www.svgrepo.com/show/475656/google-color.svg',
            full_name: 'Citizen Demo User',
            iss: 'https://accounts.google.com',
            sub: 'mock-google-sub'
          },
          app_metadata: {
            provider: 'google',
            providers: ['google']
          },
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        cookieStore.set('sb-mock-user', JSON.stringify(mockUser));
        
        let redirectTo = options?.options?.redirectTo || '/auth/callback';
        const separator = redirectTo.includes('?') ? '&' : '?';
        redirectTo = `${redirectTo}${separator}code=mock-code`;

        if (typeof window !== 'undefined') {
          setTimeout(() => {
            console.log("[Mock Auth] Redirecting window to:", redirectTo);
            window.location.href = redirectTo;
          }, 200);
        }
        return { data: { provider: 'google', url: redirectTo }, error: null };
      },
      async signInWithPassword(credentials: any) {
        console.log('[Mock Auth] signInWithPassword called for:', credentials?.email);
        const email = credentials?.email || 'citizen.demouser@gmail.com';
        const mockUser = {
          id: 'mock-user-1234',
          email,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            name: email.split('@')[0],
            full_name: email.split('@')[0]
          },
          app_metadata: { provider: 'email', providers: ['email'] },
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        cookieStore.set('sb-mock-user', JSON.stringify(mockUser));
        triggerAuthStateChange('SIGNED_IN', mockUser);
        return { data: { user: mockUser, session: { user: mockUser, access_token: 'mock-access-token' } }, error: null };
      },
      async signUp(credentials: any) {
        console.log('[Mock Auth] signUp called for:', credentials?.email);
        const email = credentials?.email || 'citizen.demouser@gmail.com';
        const metadata = credentials?.options?.data || {};
        const mockUser = {
          id: 'mock-user-1234',
          email,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            name: email.split('@')[0],
            full_name: email.split('@')[0],
            ...metadata
          },
          app_metadata: { provider: 'email', providers: ['email'] },
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        cookieStore.set('sb-mock-user', JSON.stringify(mockUser));
        triggerAuthStateChange('SIGNED_IN', mockUser);
        return { data: { user: mockUser, session: { user: mockUser, access_token: 'mock-access-token' } }, error: null };
      },
      async signOut() {
        console.log('[Mock Auth] signOut called');
        cookieStore.delete('sb-mock-user');
        triggerAuthStateChange('SIGNED_OUT', null);
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
        return { error: null };
      },
      onAuthStateChange(callback: any) {
        console.log('[Mock Auth] onAuthStateChange registered');
        if (typeof window !== 'undefined') {
          const listener = (event: string, session: any) => {
            callback(event, session);
          };
          authListeners.add(listener);
          
          const userCookie = cookieStore.get('sb-mock-user');
          if (userCookie) {
            try {
              const user = JSON.parse(userCookie);
              callback('SIGNED_IN', { user, access_token: 'mock-access-token' });
            } catch (e) {
              callback('SIGNED_OUT', null);
            }
          } else {
            callback('SIGNED_OUT', null);
          }

          return {
            data: {
              subscription: {
                unsubscribe: () => {
                  console.log('[Mock Auth] onAuthStateChange listener unsubscribed');
                  authListeners.delete(listener);
                }
              }
            }
          };
        }
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      async exchangeCodeForSession(code: string) {
        console.log('[Mock Auth] exchangeCodeForSession called with code:', code);
        const userCookie = cookieStore.get('sb-mock-user');
        if (userCookie) {
          try {
            const user = JSON.parse(userCookie);
            return { data: { session: { user, access_token: 'mock-access-token' } }, error: null };
          } catch (e) {}
        }
        return { data: { session: null }, error: null };
      },
      async updateUser(attributes: any) {
        console.log('[Mock Auth] updateUser called with attributes:', attributes);
        const userCookie = cookieStore.get('sb-mock-user');
        if (userCookie) {
          try {
            const user = JSON.parse(userCookie);
            const updatedUser = {
              ...user,
              user_metadata: {
                ...user.user_metadata,
                ...attributes.data
              }
            };
            cookieStore.set('sb-mock-user', JSON.stringify(updatedUser));
            triggerAuthStateChange('USER_UPDATED', updatedUser);
            return { data: { user: updatedUser }, error: null };
          } catch (e) {}
        }
        return { data: { user: null }, error: 'User not logged in' };
      },
      async resetPasswordForEmail(email: string, options: any) {
        console.log('[Mock Auth] resetPasswordForEmail called for:', email);
        return { data: {}, error: null };
      }
    },
    from(table: string) {
      console.log(`[Mock DB] from() called for table: ${table}`);
      const builder = {
        select(fields: string, options?: any) {
          return builder;
        },
        eq(column: string, value: any) {
          return builder;
        },
        single() {
          return builder;
        },
        upsert(data: any) {
          return builder;
        },
        update(data: any) {
          return builder;
        },
        // Support thenable structure for async/await
        then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
          if (table === 'profiles') {
            const userCookie = cookieStore.get('sb-mock-user');
            let user: any = null;
            if (userCookie) {
              try {
                user = JSON.parse(userCookie);
              } catch (e) {}
            }
            const mockProfile = user ? {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || 'Citizen Demo User',
              role: 'citizen',
              created_at: user.created_at,
              updated_at: user.updated_at
            } : null;
            
            return Promise.resolve({ data: mockProfile, error: null }).then(onfulfilled, onrejected);
          }
          return Promise.resolve({ data: [], error: null }).then(onfulfilled, onrejected);
        }
      };
      return builder;
    }
  };
}
