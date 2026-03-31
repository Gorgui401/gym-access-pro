import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionService } from '@/services/subscriptionService';

export const useAlertCount = () => {
  const { gymId } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!gymId) return;
    const fetch = async () => {
      try {
        const [expired, expiring] = await Promise.all([
          subscriptionService.getExpired(gymId),
          subscriptionService.getExpiringSoon(gymId),
        ]);
        setCount(expired.length + expiring.length);
      } catch {
        setCount(0);
      }
    };
    fetch();
    const interval = setInterval(fetch, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [gymId]);

  return count;
};
