import { supabase } from '@/integrations/supabase/client';

export const subscriptionService = {
  async getByClientId(clientId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('client_id', clientId)
      .order('start_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getActiveByClientId(clientId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'actif')
      .single();
    if (error) return null;
    return data;
  },

  async countByStatus(gymId: string, status: 'actif' | 'expiré') {
    const { count, error } = await supabase
      .from('subscriptions')
      .select('*, clients!inner(gym_id)', { count: 'exact', head: true })
      .eq('clients.gym_id', gymId)
      .eq('status', status);
    if (error) throw error;
    return count || 0;
  },

  async getExpired(gymId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, clients!inner(name, phone, gym_id)')
      .eq('clients.gym_id', gymId)
      .eq('status', 'expiré')
      .order('end_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getExpiringSoon(gymId: string, days = 7) {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, clients!inner(name, phone, gym_id)')
      .eq('clients.gym_id', gymId)
      .eq('status', 'actif')
      .gte('end_date', today)
      .lte('end_date', futureDateStr)
      .order('end_date', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getAllByGym(gymId: string, search?: string) {
    let query = supabase
      .from('subscriptions')
      .select('*, clients!inner(name, phone, photo_url, gym_id)')
      .eq('clients.gym_id', gymId)
      .order('created_at', { ascending: false });
    if (search) {
      query = query.ilike('clients.name', `%${search}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async renew(subscriptionId: string, newEnd: string) {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'actif', end_date: newEnd })
      .eq('id', subscriptionId);
    if (error) throw error;
  },

  async create(sub: {
    client_id: string;
    type: string;
    start_date: string;
    end_date: string;
    status?: string;
  }) {
    const { error } = await supabase
      .from('subscriptions')
      .insert({ ...sub, status: sub.status || 'actif' });
    if (error) throw error;
  },
};
