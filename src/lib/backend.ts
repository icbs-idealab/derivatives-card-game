import { createClient } from '@supabase/supabase-js'
// let isDev = import.meta.env.DEV
// const VITE_SUPABASE_URL = isDev ?
//     import.meta.env.VITE_SUPABASE_URL as string
//     : import.meta.env.VITE_SUPABASE_URL_ICBS as string

// const VITE_SUPABASE_ANON_KEY = isDev ?
//     import.meta.env.VITE_SUPABASE_ANON_KEY as string
//     : import.meta.env.VITE_SUPABASE_ANON_KEY_ICBS as string

// console.log('VITE_SUPABASE_URL: ', VITE_SUPABASE_URL)
// console.log('VITE_SUPABASE_ANON_KEY: ', VITE_SUPABASE_ANON_KEY)

const supabaseURL = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
export const supabase = createClient(supabaseURL, anonKey)
