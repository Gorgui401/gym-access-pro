
DROP POLICY "Managers can create a gym" ON public.gyms;

CREATE POLICY "Authenticated users can create a gym"
ON public.gyms
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.gym_id IS NOT NULL
  )
);
