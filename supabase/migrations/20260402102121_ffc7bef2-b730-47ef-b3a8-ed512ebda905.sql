
-- Allow managers to create a gym (so they can set up their own gym)
CREATE POLICY "Managers can create a gym"
ON public.gyms
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow managers to update subscriptions (for renewals)
CREATE POLICY "Managers can update subscriptions"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (client_id IN (
  SELECT clients.id FROM clients
  WHERE clients.gym_id IN (
    SELECT profiles.gym_id FROM profiles WHERE profiles.id = auth.uid()
  )
))
WITH CHECK (client_id IN (
  SELECT clients.id FROM clients
  WHERE clients.gym_id IN (
    SELECT profiles.gym_id FROM profiles WHERE profiles.id = auth.uid()
  )
));
