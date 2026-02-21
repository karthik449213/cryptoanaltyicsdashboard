-- Create price alerts table
CREATE TABLE IF NOT EXISTS public.price_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coin_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('above', 'below')),
    threshold_price NUMERIC(20, 8) NOT NULL CHECK (threshold_price > 0),
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_coin_id ON public.price_alerts(coin_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON public.price_alerts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_price_alerts_last_triggered ON public.price_alerts(last_triggered_at);

-- Enable RLS
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own alerts" ON public.price_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts" ON public.price_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON public.price_alerts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" ON public.price_alerts
    FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_price_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_price_alerts_updated_at ON public.price_alerts;
CREATE TRIGGER trigger_update_price_alerts_updated_at
    BEFORE UPDATE ON public.price_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_price_alerts_updated_at();