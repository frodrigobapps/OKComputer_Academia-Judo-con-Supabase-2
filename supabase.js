// Supabase Client Configuration
// This file handles the connection to Supabase backend

import { createClient } from '@supabase/supabase-js';

// Environment variables - these should be set in your .env.local file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication functions
export const auth = {
    // Sign in with email and password
    signIn: async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            // Update last login
            if (data.user) {
                await supabase
                    .from('profiles')
                    .update({ last_login: new Date().toISOString() })
                    .eq('id', data.user.id);
            }
            
            return { data, error: null };
        } catch (error) {
            console.error('Sign in error:', error);
            return { data: null, error };
        }
    },

    // Sign up with email and password
    signUp: async (email, password, metadata = {}) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            });
            
            if (error) throw error;
            
            return { data, error: null };
        } catch (error) {
            console.error('Sign up error:', error);
            return { data: null, error };
        }
    },

    // Sign out
    signOut: async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Sign out error:', error);
            return { error };
        }
    },

    // Get current user
    getUser: () => {
        return supabase.auth.getUser();
    },

    // Get current session
    getSession: () => {
        return supabase.auth.getSession();
    },

    // Reset password
    resetPassword: async (email) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/login.html`
            });
            
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Reset password error:', error);
            return { error };
        }
    },

    // Update user password
    updatePassword: async (newPassword) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Update password error:', error);
            return { error };
        }
    }
};

// Database operations
export const db = {
    // Content operations
    content: {
        // Get all content with filters
        getAll: async (filters = {}) => {
            try {
                let query = supabase
                    .from('content')
                    .select(`*, categories(name), profiles(full_name)`)
                    .order('created_at', { ascending: false });

                // Apply filters
                if (filters.type) {
                    query = query.eq('content_type', filters.type);
                }
                if (filters.category) {
                    query = query.eq('category_id', filters.category);
                }
                if (filters.beltLevel) {
                    query = query.eq('required_belt_level', filters.beltLevel);
                }
                if (filters.search) {
                    query = query.textSearch('title,description', filters.search);
                }

                const { data, error } = await query;
                if (error) throw error;

                return { data, error: null };
            } catch (error) {
                console.error('Get content error:', error);
                return { data: null, error };
            }
        },

        // Get content by ID
        getById: async (id) => {
            try {
                const { data, error } = await supabase
                    .from('content')
                    .select(`*, categories(name), profiles(full_name)`)
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return { data, error: null };
            } catch (error) {
                console.error('Get content by ID error:', error);
                return { data: null, error };
            }
        },

        // Create new content
        create: async (contentData) => {
            try {
                const { data, error } = await supabase
                    .from('content')
                    .insert([contentData])
                    .select()
                    .single();

                if (error) throw error;
                return { data, error: null };
            } catch (error) {
                console.error('Create content error:', error);
                return { data: null, error };
            }
        },

        // Update content
        update: async (id, contentData) => {
            try {
                const { data, error } = await supabase
                    .from('content')
                    .update(contentData)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                return { data, error: null };
            } catch (error) {
                console.error('Update content error:', error);
                return { data: null, error };
            }
        },

        // Delete content
        delete: async (id) => {
            try {
                const { error } = await supabase
                    .from('content')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                return { error: null };
            } catch (error) {
                console.error('Delete content error:', error);
                return { error };
            }
        }
    },

    // User operations
    users: {
        // Get all users
        getAll: async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return { data, error: null };
            } catch (error) {
                console.error('Get users error:', error);
                return { data: null, error };
            }
        },

        // Get user by ID
        getById: async (id) => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return { data, error: null };
            } catch (error) {
                console.error('Get user by ID error:', error);
                return { data: null, error };
            }
        },

        // Update user
        update: async (id, userData) => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .update(userData)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                return { data, error: null };
            } catch (error) {
                console.error('Update user error:', error);
                return { data: null, error };
            }
        },

        // Create admin user
        createAdmin: async (email, password, fullName) => {
            try {
                // First, sign up the user with Supabase Auth
                const { data: authData, error: authError } = await auth.signUp(email, password, {
                    full_name: fullName,
                    role: 'admin'
                });

                if (authError) throw authError;

                // Then update their profile with admin role
                if (authData.user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .update({ 
                            role: 'admin',
                            full_name: fullName,
                            is_active: true
                        })
                        .eq('id', authData.user.id)
                        .select()
                        .single();

                    if (error) throw error;
                    return { data, error: null };
                }

                return { data: null, error: new Error('Failed to create admin user') };
            } catch (error) {
                console.error('Create admin error:', error);
                return { data: null, error };
            }
        }
    },

    // Categories operations
    categories: {
        getAll: async () => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name', { ascending: true });

                if (error) throw error;
                return { data, error: null };
            } catch (error) {
                console.error('Get categories error:', error);
                return { data: null, error };
            }
        }
    },

    // Progress operations
    progress: {
        // Get user progress
        getByUser: async (userId) => {
            try {
                const { data, error } = await supabase
                    .from('user_progress')
                    .select('*')
                    .eq('user_id', userId);

                if (error) throw error;
                return { data, error: null };
            } catch (error) {
                console.error('Get user progress error:', error);
                return { data: null, error };
            }
        },

        // Update content progress
        updateProgress: async (userId, contentId, progress) => {
            try {
                const { data, error } = await supabase
                    .from('user_progress')
                    .upsert({
                        user_id: userId,
                        content_id: contentId,
                        progress: progress,
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (error) throw error;
                return { data, error: null };
            } catch (error) {
                console.error('Update progress error:', error);
                return { data: null, error };
            }
        }
    }
};

// Storage operations
export const storage = {
    // Upload file
    upload: async (bucket, file, path) => {
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(path, file);

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Upload error:', error);
            return { data: null, error };
        }
    },

    // Get public URL for file
    getPublicUrl: (bucket, path) => {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    },

    // Delete file
    delete: async (bucket, path) => {
        try {
            const { error } = await supabase.storage
                .from(bucket)
                .remove([path]);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Delete error:', error);
            return { error };
        }
    }
};

// Real-time subscriptions
export const realtime = {
    // Subscribe to content changes
    subscribeToContent: (callback) => {
        return supabase
            .channel('content_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'content' }, 
                callback
            )
            .subscribe();
    },

    // Subscribe to user progress changes
    subscribeToProgress: (userId, callback) => {
        return supabase
            .channel('progress_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'user_progress', filter: `user_id=eq.${userId}` }, 
                callback
            )
            .subscribe();
    }
};

// Initialize admin user function
export const initializeAdminUser = async () => {
    try {
        // Check if admin already exists
        const { data: existingAdmin, error: checkError } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'admin')
            .single();

        if (existingAdmin) {
            console.log('Admin user already exists');
            return { success: true, message: 'Admin user already exists' };
        }

        // Create default admin user
        const adminEmail = 'admin@academiajudo.com';
        const adminPassword = 'AdminJudo2024!'; // Change this in production!
        const adminName = 'Administrador Principal';

        const { data: adminData, error: createError } = await db.users.createAdmin(
            adminEmail,
            adminPassword,
            adminName
        );

        if (createError) throw createError;

        console.log('Admin user created successfully');
        return { 
            success: true, 
            message: 'Admin user created successfully',
            credentials: {
                email: adminEmail,
                password: adminPassword // Only for initial setup
            }
        };

    } catch (error) {
        console.error('Initialize admin error:', error);
        return { success: false, error: error.message };
    }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return !!user;
    } catch (error) {
        return false;
    }
};

// Get current user with profile
export const getCurrentUser = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;

        return {
            ...user,
            profile
        };
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
};

// Export supabase client for direct access if needed
export default supabase;