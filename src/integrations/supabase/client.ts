
// Temporarily use mock client instead of real Supabase
import { mockSupabase } from './mockClient';

const SUPABASE_URL = "https://bdjzefekuahfofwzxqxd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkanplZmVrdWFoZm9md3p4cXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MjE1ODQsImV4cCI6MjA2MjI5NzU4NH0.AyzVwsNDgyjeveMtz4-6mVnJGr7DaU8ZUJhr5Yk_us8";

// Export mock client for now
export const supabase = mockSupabase as any;
