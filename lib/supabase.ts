import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://bexgujzjoppygclwqawf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJleGd1anpqb3BweWdjbHdxYXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0Nzg0NjIsImV4cCI6MjA3MDA1NDQ2Mn0.G-WlDZ6opc9H5H7fDlPcLpfnIUXkazex8kzeEb__D00';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
