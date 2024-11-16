import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Initialize Supabase client
const supabase = createClient(
    'https://flayyfibpsxcobykocsw.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYXl5ZmlicHN4Y29ieWtvY3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzOTgxOTUsImV4cCI6MjA0NTk3NDE5NX0.9Y9BvjdjXDvcQbBweiGMeJtTurtO9T1mNgKcScr3IaU'
);

// Check if user is authenticated
export async function requireAuth() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
            // Redirect to login page if not authenticated
            window.location.href = '/auth-test.html';
            return null;
        }
        
        return user;
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/auth-test.html';
        return null;
    }
}

// Get current user without redirect
export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

// Check if user is authenticated and return boolean
export async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user;
}

// Handle logout
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = '/auth-test.html';
    } catch (error) {
        console.error('Sign out error:', error);
    }
}
