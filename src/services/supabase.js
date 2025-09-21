// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://grrgopimouontsvfmtje.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdycmdvcGltb3VvbnRzdmZtdGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NzY0NjgsImV4cCI6MjA2NzU1MjQ2OH0.jxfKPEk1qGUP2_yUxbYAWpWU94Ca60k04eeQZnANGB4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);