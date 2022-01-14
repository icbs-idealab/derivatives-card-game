import { createClient } from '@supabase/supabase-js'
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL_ICBS as string
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY_ICBS as string
console.log('VITE_SUPABASE_URL: ', VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY: ', VITE_SUPABASE_ANON_KEY)
export const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
