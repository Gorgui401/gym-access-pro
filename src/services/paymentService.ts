import { supabase } from '@/integrations/supabase/client';

export const paymentService = {
  async getByGym(gymId: string, limit = 50) {
    const { data, error } = await supabase
      .from('payments')
      .select('*, clients!inner(name, gym_id)')
      .eq('clients.gym_id', gymId)
      .order('date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async getMonthlyRevenue(gymId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { data, error } = await supabase
      .from('payments')
      .select('amount, clients!inner(gym_id)')
      .eq('clients.gym_id', gymId)
      .gte('date', startOfMonth);
    if (error) throw error;
    return data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  },

  async create(payment: {
    client_id: string;
    amount: number;
    method: string;
  }) {
    const { error } = await supabase
      .from('payments')
      .insert(payment);
    if (error) throw error;
  },
};
