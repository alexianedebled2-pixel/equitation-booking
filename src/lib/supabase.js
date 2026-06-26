import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://afqvwvbmmlzhnosbhvnu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcXZ3dmJtbWx6aG5vc2Jodm51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNzcxMDYsImV4cCI6MjA5Nzk1MzEwNn0.lGfEgE92Ml03haNyHF7fsTX4ExuGKAmBOPbrUNx-QNI'
)