import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://zfgpaclatboaavvrckap.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmZ3BhY2xhdGJvYWF2dnJja2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NjU1MDgsImV4cCI6MjA2NzQ0MTUwOH0.uGc384eQd3DjXuLGTINAu3Mg-oy41_0Dhn9rcrWtlxY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)