// Supabase client singleton for use throughout the app
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qpsuklfimmgslveolapg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc3VrbGZpbW1nc2x2ZW9sYXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MzMyMzAsImV4cCI6MjA2NTEwOTIzMH0.yTOn7_tvv-f0dRzj2FCM5rYW8ouOy-DiejPhN2YZ3CE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
