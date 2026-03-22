-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  gym_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Gyms table
CREATE TABLE public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

-- Add FK on profiles.gym_id
ALTER TABLE public.profiles ADD CONSTRAINT profiles_gym_id_fkey FOREIGN KEY (gym_id) REFERENCES public.gyms(id);

-- Clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  photo_url TEXT,
  qr_code TEXT UNIQUE NOT NULL,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mensuel', 'trimestriel', 'annuel')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'expiré')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Checkins table
CREATE TABLE public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('cash', 'wave', 'orange_money')),
  date TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- user_roles
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- profiles
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- gyms
CREATE POLICY "Managers can read their gym" ON public.gyms FOR SELECT USING (
  id IN (SELECT gym_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can manage all gyms" ON public.gyms FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- clients
CREATE POLICY "Managers can read gym clients" ON public.clients FOR SELECT USING (
  gym_id IN (SELECT gym_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Managers can insert gym clients" ON public.clients FOR INSERT WITH CHECK (
  gym_id IN (SELECT gym_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Managers can update gym clients" ON public.clients FOR UPDATE USING (
  gym_id IN (SELECT gym_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Managers can delete gym clients" ON public.clients FOR DELETE USING (
  gym_id IN (SELECT gym_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can manage all clients" ON public.clients FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- subscriptions
CREATE POLICY "Managers can read subscriptions" ON public.subscriptions FOR SELECT USING (
  client_id IN (SELECT id FROM public.clients WHERE gym_id IN (SELECT gym_id FROM public.profiles WHERE id = auth.uid()))
);
CREATE POLICY "Managers can insert subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (
  client_id IN (SELECT id FROM public.clients WHERE gym_id IN (SELECT gym_id FROM public.profiles WHERE id = auth.uid()))
);
CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- checkins
CREATE POLICY "Managers can read checkins" ON public.checkins FOR SELECT USING (
  gym_id IN (SELECT gym_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Managers can insert checkins" ON public.checkins FOR INSERT WITH CHECK (
  gym_id IN (SELECT gym_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can manage all checkins" ON public.checkins FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- payments
CREATE POLICY "Managers can read payments" ON public.payments FOR SELECT USING (
  client_id IN (SELECT id FROM public.clients WHERE gym_id IN (SELECT gym_id FROM public.profiles WHERE id = auth.uid()))
);
CREATE POLICY "Managers can insert payments" ON public.payments FOR INSERT WITH CHECK (
  client_id IN (SELECT id FROM public.clients WHERE gym_id IN (SELECT gym_id FROM public.profiles WHERE id = auth.uid()))
);
CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();