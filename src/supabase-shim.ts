// Shim to prevent Supabase initialization errors
// This file prevents any accidental Supabase imports from causing runtime errors

if (typeof window !== 'undefined') {
  // Prevent Supabase from initializing
  (window as any).__SUPABASE_DISABLED__ = true;
}

// Export a dummy client if something tries to import it
export const createClient = (options?: any) => {
  // Check if supabaseUrl is required and provide a dummy value
  if (!options || !options.supabaseUrl) {
    console.warn('Supabase is not configured in this project. Using dummy client.');
    return {
      from: () => ({ 
        select: () => ({ data: null, error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
      auth: { 
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
      storage: {
        from: () => ({ upload: () => Promise.resolve({ data: null, error: null }) }),
      },
    };
  }
  // If options are provided, still return dummy to prevent actual initialization
  return {
    from: () => ({ select: () => ({ data: null, error: null }) }),
    auth: { getUser: () => Promise.resolve({ data: { user: null }, error: null }) },
  };
};

// Export default for different import styles
export default { createClient };

