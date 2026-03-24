import { supabase } from '@/integrations/supabase/client';

export const authService = {
  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  async signUp(email: string, password: string, metadata?: Record<string, unknown>) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata, emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getUserRole(userId: string) {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    return data?.role || null;
  },

  async getUserProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('gym_id')
      .eq('id', userId)
      .single();
    return data;
  },
};
