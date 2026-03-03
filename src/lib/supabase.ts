import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jlldtawccoagkbweatgn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsbGR0YXdjY29hZ2tid2VhdGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MTUzNzQsImV4cCI6MjA4ODA5MTM3NH0.cKe6HJdz9NG1t7sR1FHPnVWKAyE1qf1Duk1hlEyKO_0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
