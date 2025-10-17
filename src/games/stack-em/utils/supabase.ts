import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase config:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing',
  urlLength: supabaseUrl?.length || 0,
  keyLength: supabaseAnonKey?.length || 0
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
} else {
  console.log('✅ Supabase client will be created');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)