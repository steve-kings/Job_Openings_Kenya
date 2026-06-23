'use server'

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function createAdminUser(email: string, password: string, fullName: string) {
    try {
        // Input validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, message: 'Invalid email address' };
        }
        if (password.length < 8) {
            return { success: false, message: 'Password must be at least 8 characters' };
        }
        if (!fullName.trim()) {
            return { success: false, message: 'Full name is required' };
        }

        const supabase = await createClient();

        // Check if current user is admin
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
            return { success: false, message: 'Not authenticated' };
        }

        // Check if current user has admin role
        const { data: currentProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();

        if (currentProfile?.role !== 'admin') {
            return { success: false, message: 'Unauthorized: Only admins can create admin users' };
        }

        // Use admin client for user creation
        const adminClient = createAdminClient();

        // Create the new user using Supabase Admin API
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName
            }
        });

        if (createError) {
            return { success: false, message: createError.message };
        }

        if (!newUser.user) {
            return { success: false, message: 'Failed to create user' };
        }

        // Update the profile to set role as admin using admin client
        const { error: updateError } = await adminClient
            .from('profiles')
            .update({ 
                role: 'admin',
                full_name: fullName
            })
            .eq('id', newUser.user.id);

        if (updateError) {
            return { success: false, message: `User created but role update failed: ${updateError.message}` };
        }

        return { 
            success: true, 
            message: `Admin user created successfully! Email: ${email}` 
        };

    } catch (error: unknown) {
        console.error('Error creating admin user:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'An unexpected error occurred'
        };
    }
}

export async function getAdminUsers() {
    try {
        const supabase = await createClient();

        // Check if current user is admin
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
            return { success: false, message: 'Not authenticated', data: [] };
        }

        // Check if current user has admin role
        const { data: currentProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();

        if (currentProfile?.role !== 'admin') {
            return { success: false, message: 'Unauthorized', data: [] };
        }

        // Use admin client to fetch data
        const adminClient = createAdminClient();

        // Get all admin users from profiles
        const { data: adminProfiles, error: profileError } = await adminClient
            .from('profiles')
            .select('id, full_name, role, created_at')
            .eq('role', 'admin')
            .order('created_at', { ascending: false });

        if (profileError) {
            return { success: false, message: profileError.message, data: [] };
        }

        // Get email addresses from auth.users for each admin
        const adminUsersWithEmail = await Promise.all(
            (adminProfiles || []).map(async (profile) => {
                const { data: userData } = await adminClient.auth.admin.getUserById(profile.id);
                return {
                    ...profile,
                    email: userData.user?.email || 'No email'
                };
            })
        );

        return { 
            success: true, 
            message: 'Admin users fetched successfully',
            data: adminUsersWithEmail
        };

    } catch (error: unknown) {
        console.error('Error fetching admin users:', error);
        return { 
            success: false, 
            message: error instanceof Error ? error.message : 'An unexpected error occurred',
            data: []
        };
    }
}

export async function updateAdminUser(userId: string, fullName: string, email: string) {
    try {
        const supabase = await createClient();

        // Check if current user is admin
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
            return { success: false, message: 'Not authenticated' };
        }

        // Check if current user has admin role
        const { data: currentProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();

        if (currentProfile?.role !== 'admin') {
            return { success: false, message: 'Unauthorized: Only admins can update admin users' };
        }

        // Use admin client for updates
        const adminClient = createAdminClient();

        // Update user email using admin API
        const { error: emailError } = await adminClient.auth.admin.updateUserById(
            userId,
            { email }
        );

        if (emailError) {
            return { success: false, message: `Failed to update email: ${emailError.message}` };
        }

        // Update profile
        const { error: profileError } = await adminClient
            .from('profiles')
            .update({ 
                full_name: fullName
            })
            .eq('id', userId);

        if (profileError) {
            return { success: false, message: `Failed to update profile: ${profileError.message}` };
        }

        return { 
            success: true, 
            message: 'Admin user updated successfully!' 
        };

    } catch (error: unknown) {
        console.error('Error updating admin user:', error);
        return { 
            success: false, 
            message: error instanceof Error ? error.message : 'An unexpected error occurred'
        };
    }
}

export async function deleteAdminUser(userId: string) {
    try {
        const supabase = await createClient();

        // Check if current user is admin
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
            return { success: false, message: 'Not authenticated' };
        }

        // Prevent self-deletion
        if (currentUser.id === userId) {
            return { success: false, message: 'You cannot delete your own account' };
        }

        // Check if current user has admin role
        const { data: currentProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();

        if (currentProfile?.role !== 'admin') {
            return { success: false, message: 'Unauthorized: Only admins can delete admin users' };
        }

        // Use admin client for deletion
        const adminClient = createAdminClient();

        // Delete profile row first (no FK cascade guarantee)
        await adminClient.from('profiles').delete().eq('id', userId);

        // Delete auth user
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

        if (deleteError) {
            return { success: false, message: `Failed to delete user: ${deleteError.message}` };
        }

        return { 
            success: true, 
            message: 'Admin user deleted successfully!' 
        };

    } catch (error: unknown) {
        console.error('Error deleting admin user:', error);
        return { 
            success: false, 
            message: error instanceof Error ? error.message : 'An unexpected error occurred'
        };
    }
}

export async function resetAdminPassword(userId: string, newPassword: string) {
    try {
        const supabase = await createClient();

        // Check if current user is admin
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
            return { success: false, message: 'Not authenticated' };
        }

        // Check if current user has admin role
        const { data: currentProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();

        if (currentProfile?.role !== 'admin') {
            return { success: false, message: 'Unauthorized: Only admins can reset passwords' };
        }

        // Use admin client for password reset
        const adminClient = createAdminClient();

        // Update password using admin API
        const { error } = await adminClient.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        );

        if (error) {
            return { success: false, message: `Failed to reset password: ${error.message}` };
        }

        return { 
            success: true, 
            message: 'Password reset successfully!' 
        };

    } catch (error: unknown) {
        console.error('Error resetting password:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'An unexpected error occurred'
        };
    }
}
