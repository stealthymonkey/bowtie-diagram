// Shim to prevent Supabase initialization errors
// This file prevents any accidental Supabase imports from causing runtime errors

if (typeof window !== 'undefined') {
  // Prevent Supabase from initializing
  (window as any).__SUPABASE_DISABLED__ = true;
}

// Export a dummy client if something tries to import it
export const createClient = () => {
  console.warn('Supabase is not configured in this project');
  return {
    from: () => ({ select: () => ({ data: null, error: null }) }),
    auth: { getUser: () => Promise.resolve({ data: { user: null }, error: null }) },
  };
};

