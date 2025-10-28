import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tdrwgbbcpzhvbieqimka.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkcndnYmJjcHpodmJpZXFpbWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzIzNjUsImV4cCI6MjA3NDU0ODM2NX0.oPVBT767irf4DjCZSn4vI0kxqTtZEJ2ojzkyvMpINbI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
