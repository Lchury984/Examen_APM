import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = Constants?.expoConfig?.extra;

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  extra?.supabaseUrl ??
  'https://mbttsrvbrwsmbcknuvfc.supabase.co';

const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  extra?.supabaseAnonKey ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idHRzcnZicndzbWJja251dmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTA1MjcsImV4cCI6MjA3ODk4NjUyN30.HQVMQLXxbjsx9jjZCqBGSZl6iO2ivdjSxcAahG4UbK0';

export const supabase = createClient(supabaseUrl, supabaseKey);
