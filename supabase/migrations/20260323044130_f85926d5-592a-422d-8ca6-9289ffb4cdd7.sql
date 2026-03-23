
-- Create storage bucket for client photos
INSERT INTO storage.buckets (id, name, public) VALUES ('client-photos', 'client-photos', true);

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload client photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'client-photos');

-- Allow public read access
CREATE POLICY "Public can read client photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'client-photos');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete client photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'client-photos');
