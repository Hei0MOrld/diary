import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rrppoijypfjtizixvjdo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycHBvaWp5cGZqdGl6aXh2amRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMTk0ODgsImV4cCI6MjA5MTg5NTQ4OH0.LgLM7fNCVY3PWNJnBpaY__JQfNADBt47RE1jMqjIUMs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
