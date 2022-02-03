import { createClient } from '@supabase/supabase-js'
const supabaseURL = process.env.VITE_SUPABASE_URL as string
const anonKey = process.env.VITE_SUPABASE_ADMIN_KEY as string
// const supabaseURL = process.env.VITE_SUPABASE_URL_TEST as string
// const anonKey = process.env.VITE_SUPABASE_ADMIN_KEY_TEST as string
export const supabase = createClient(supabaseURL, anonKey)

export default async function handler(request, response) {
    const req = JSON.parse(request.body);
    const {email} = req

    const {data, error} = await supabase.auth.api.resetPasswordForEmail(email)
    console.log('result of sending reset email: ', data)
    console.log('error of sending reset email: ', error)
    !error && data && response.status(200).send(JSON.stringify({success: !error, email}));
    error && response.status(400).send(JSON.stringify({email, error}));
}