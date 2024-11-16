# Supabase Configuration Documentation

## Project Details
- **Project URL:** https://flayyfibpsxcobykocsw.supabase.co
- **Project Reference ID:** flayyfibpsxcobykocsw
- **Environment:** Development

## Authentication Configuration
```javascript
{
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  storage: window.localStorage,
  storageKey: 'matchpro-auth',
  flowType: 'pkce'
}
```

## Security Best Practices
1. **Environment Variables**
   - NEVER commit `.env` files to version control
   - Use `.env.example` for documentation
   - Keep production keys separate from development

2. **Authentication Flow**
   - Using PKCE (Proof Key for Code Exchange) for enhanced security
   - Session persistence in localStorage
   - Automatic token refresh enabled

3. **API Security**
   - Using anon key only for public operations
   - Implementing RLS (Row Level Security) for data access
   - Headers configured for request tracking

## Database Schema
To be documented:
- [ ] User table structure
- [ ] Profile table structure
- [ ] Application tables
- [ ] RLS policies

## Required Setup Steps
1. **Database Setup**
   ```sql
   -- Health check table
   CREATE TABLE public.health_check (
     id SERIAL PRIMARY KEY,
     status TEXT NOT NULL,
     last_checked TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );

   -- Add RLS policy
   ALTER TABLE public.health_check ENABLE ROW LEVEL SECURITY;
   ```

2. **Authentication Setup**
   - Configure email templates
   - Set up password reset flow
   - Configure OAuth providers (if needed)

3. **Storage Setup**
   - Configure storage buckets
   - Set up storage policies

## Client Integration
```javascript
// Example usage
import { supabase } from '../config/supabaseClient';

// Authentication
const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

// Database query
const fetchData = async () => {
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
    .limit(10);
  return { data, error };
};
```

## Error Handling
Common error codes and their meanings:
- `400`: Bad request (invalid input)
- `401`: Unauthorized (invalid credentials)
- `403`: Forbidden (valid credentials, but insufficient permissions)
- `404`: Not found
- `409`: Conflict (e.g., duplicate email)
- `500`: Server error

## Monitoring and Debugging
1. Check Supabase dashboard for:
   - Real-time API requests
   - Authentication events
   - Database queries
   - Storage operations

2. Client-side logging:
   - Auth state changes
   - API request/response cycles
   - Error events

## TODO
- [ ] Set up proper RLS policies
- [ ] Configure email templates
- [ ] Add OAuth providers
- [ ] Set up storage buckets
- [ ] Create database indexes
- [ ] Add API documentation
