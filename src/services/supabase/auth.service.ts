import { supabase } from '../../lib/supabase';
import type { User } from '../../types';

export const supabaseAuth = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  signUp: async (email: string, password: string, metadata: { name: string; phone: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: metadata.name, phone: metadata.phone } },
    });
    if (error) throw error;
    return data;
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'lumisalon://auth/reset-password',
    });
    if (error) throw error;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  getProfile: async (userId: string, email: string): Promise<User> => {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, phone, avatar')
      .eq('id', userId)
      .single();

    return {
      id: userId,
      name: data?.name || '',
      email,
      phone: data?.phone || undefined,
      avatar: data?.avatar || undefined,
    };
  },

  updateProfile: async (userId: string, updates: Partial<Pick<User, 'name' | 'phone' | 'avatar'>>) => {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates });
    if (error) throw error;
  },
};
