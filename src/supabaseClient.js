import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Key missing! App will load in non-functional mode.')
}

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        auth: {
            getSession: () => Promise.resolve({ data: { session: null } }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            signOut: () => Promise.resolve(),
            signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase keys missing' } }),
            signUp: () => Promise.resolve({ error: { message: 'Supabase keys missing' } }),
            signInWithOAuth: () => Promise.resolve({ error: { message: 'Supabase keys missing' } })
        },
        from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) }) // minimal mock
    };
