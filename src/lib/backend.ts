import { createClient } from '@supabase/supabase-js'
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string
export const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
