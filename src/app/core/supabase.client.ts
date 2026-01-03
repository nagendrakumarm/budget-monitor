import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://yedfomcvvvskppnlksxx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZGZvbWN2dnZza3Bwbmxrc3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNjczNDEsImV4cCI6MjA4Mjk0MzM0MX0.eRyaw-PO4cj2LF5BlzPg_gxBFj5bGce3S9KmkullMU4'
);