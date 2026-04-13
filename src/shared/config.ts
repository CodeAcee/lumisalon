export const env = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.lumisalon.com/v1',
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY || '',
} as const;
