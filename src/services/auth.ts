import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DEMO_USER_STORAGE_KEY = 'elsewhere_demo_user';

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
}

export const authService = {
  /**
   * Get currently active session / user
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      return {
        id: session.user.id,
        email: session.user.email || '',
        display_name: profile?.display_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Campus Student'
      };
    } else {
      // Local demo user
      const raw = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
      // Default initial mock user for instant testing convenience
      const defaultUser: UserProfile = {
        id: 'usr-student-001',
        email: 'student@campus.edu',
        display_name: 'Alex Rivera'
      };
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }
  },

  /**
   * Sign In
   */
  async signIn(email: string, password?: string): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      if (!password) {
        throw new Error('Password is required for Supabase authentication');
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('User not found');
      }

      return {
        id: data.user.id,
        email: data.user.email || email,
        display_name: data.user.user_metadata?.full_name || email.split('@')[0]
      };
    } else {
      // Local demo mode
      const user: UserProfile = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        email,
        display_name: email.split('@')[0].replace('.', ' ').replace(/^./, str => str.toUpperCase())
      };
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    }
  },

  /**
   * Sign Up
   */
  async signUp(email: string, password?: string, displayName?: string): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      if (!password) {
        throw new Error('Password is required for Supabase registration');
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName || email.split('@')[0]
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Failed to create account. Check your email if email confirmation is enabled.');
      }

      return {
        id: data.user.id,
        email: data.user.email || email,
        display_name: displayName || email.split('@')[0]
      };
    } else {
      // Local demo mode
      const user: UserProfile = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        email,
        display_name: displayName || email.split('@')[0]
      };
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    }
  },

  /**
   * Sign Out
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    }
  }
};
