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
    const { data: existing } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (existing) {
      console.log('User is already an admin');
      return;
    }
    
    // Add admin role
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: user.id, role: 'admin' });
    
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