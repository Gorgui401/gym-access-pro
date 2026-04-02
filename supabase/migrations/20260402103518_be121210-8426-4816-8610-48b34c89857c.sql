
CREATE OR REPLACE FUNCTION public.assign_manager_on_gym_link()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- When gym_id changes from NULL to a value, assign manager role if no role exists
  IF OLD.gym_id IS NULL AND NEW.gym_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'manager')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_gym_linked
  AFTER UPDATE OF gym_id ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_manager_on_gym_link();
