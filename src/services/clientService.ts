import { supabase } from '@/integrations/supabase/client';

export const clientService = {
  async getAll(gymId: string, search?: string) {
    let query = supabase
      .from('clients')
      .select('*, subscriptions(status, end_date)')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });
    if (search) query = query.ilike('name', `%${search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getRecent(gymId: string, limit = 5) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByQrCode(qrCode: string, gymId: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('qr_code', qrCode)
      .eq('gym_id', gymId)
      .single();
    if (error) throw error;
    return data;
  },

  async count(gymId: string) {
    const { count, error } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId);
    if (error) throw error;
    return count || 0;
  },

  async create(client: {
    name: string;
    phone: string;
    address?: string;
    gym_id: string;
    qr_code: string;
    photo_url: string;
  }) {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select('id')
      .single();
    if (error) throw error;
    return data;
  },

  async uploadPhoto(gymId: string, file: File) {
    const ext = file.name.split('.').pop();
    const path = `${gymId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from('client-photos')
      .upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('client-photos').getPublicUrl(path);
    return data.publicUrl;
  },
};
