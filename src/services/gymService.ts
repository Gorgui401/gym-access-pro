import { supabase } from '@/integrations/supabase/client';

export const gymService = {
  async create(data: { name: string; address?: string; phone?: string }) {
    const { data: gym, error } = await supabase
      .from('gyms')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return gym;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async linkProfileToGym(userId: string, gymId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ gym_id: gymId })
      .eq('id', userId);
    if (error) throw error;
  },

  async findByCode(code: string) {
    // Search gym by ID (the manager enters the gym ID shared by admin)
    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', code)
      .single();
    if (error) throw error;
    return data;
  },
};
