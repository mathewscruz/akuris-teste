-- Add updated_at column to temporary_passwords table
ALTER TABLE public.temporary_passwords 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger to automatically update updated_at column
CREATE TRIGGER update_temporary_passwords_updated_at
    BEFORE UPDATE ON public.temporary_passwords
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();