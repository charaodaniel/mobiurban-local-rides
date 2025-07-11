// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://toxgfxwzodsormpgeste.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRveGdmeHd6b2Rzb3JtcGdlc3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5ODEzMTcsImV4cCI6MjA2NjU1NzMxN30.yMJwgd9oH1y5_Lm0mdtPhjbgyhBRUjHBDeCi8_W0I-M";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});