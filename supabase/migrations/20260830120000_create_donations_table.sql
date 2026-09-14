-- Donations: records Paystack donations, written ONLY by Edge Functions
-- (verify-donation / paystack-webhook) using the service_role key, which
-- bypasses RLS. There is intentionally no INSERT/UPDATE/DELETE policy for
-- anon/authenticated, so the public API cannot write or tamper with rows.

CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  email TEXT,
  donor_name TEXT,
  amount NUMERIC(12,2) NOT NULL,        -- major unit (e.g. GHS 100.00)
  currency TEXT NOT NULL DEFAULT 'GHS',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | success | failed
  channel TEXT,                          -- card | mobile_money | bank, etc.
  paid_at TIMESTAMP WITH TIME ZONE,
  raw_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS. Only admins may read; no public write path exists.
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view donations"
ON public.donations
FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE INDEX idx_donations_created_at ON public.donations (created_at DESC);
CREATE INDEX idx_donations_status ON public.donations (status);

-- Keep updated_at fresh (reuses the shared trigger function).
CREATE TRIGGER update_donations_updated_at
BEFORE UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
