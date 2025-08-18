import { supabase } from "@/integrations/supabase/client";

/**
 * Helper function to make a user an admin.
 * This should be used in the browser console by the initial administrator.
 * 
 * Usage:
 * 1. Sign in to your account
 * 2. Open browser console (F12)
 * 3. Run: await makeAdmin()
 * 
 * This will add the admin role to the currently logged-in user.
 */
export const makeAdmin = async () => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return;
    }
    
    if (!user) {
      console.error('No user logged in');
      return;
    }
    
    // Check if user is already an admin
    if (user.user_metadata?.role === 'admin') {
      console.log('User is already an admin');
      return;
    }
    
    // Add admin role to user metadata
    const { error } = await supabase.auth.updateUser({
      data: { role: 'admin' }
    });
    
    if (error) {
      console.error('Error adding admin role:', error);
      return;
    }
    
    console.log('✅ Successfully added admin role to user:', user.email);
    console.log('Please refresh the page to see admin features');
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// Make it available globally in development
if (typeof window !== 'undefined') {
  (window as any).makeAdmin = makeAdmin;
}