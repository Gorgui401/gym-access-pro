import { supabase } from '@/integrations/supabase/client';

export const checkinService = {
  async create(checkin: { client_id: string; gym_id: string }) {
    const { error } = await supabase
      .from('checkins')
      .insert(checkin);
    if (error) throw error;
  },
};
