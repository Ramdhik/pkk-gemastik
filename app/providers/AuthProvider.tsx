import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  hasAuthError: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  hasAuthError: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAuthError, setHasAuthError] = useState(false);

  const clearAuthData = async () => {
    try {
      // Clear all potential auth storage keys
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter((key) => key.includes('supabase') || key.includes('auth') || key.includes('sb-'));

      if (authKeys.length > 0) {
        await AsyncStorage.multiRemove(authKeys);
      }

      // Sign out from supabase
      await supabase.auth.signOut();

      setSession(null);
      setUser(null);
      setHasAuthError(true);

      console.log('🧹 Auth data cleared due to error');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        setHasAuthError(false);

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Error getting session:', error);

          // Check if it's AuthSessionMissingError or similar
          if (error.message?.includes('Auth session missing') || error.message?.includes('session') || error.name === 'AuthSessionMissingError') {
            console.log('🔄 Auth session missing, clearing data...');
            await clearAuthData();
            return;
          }
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false); // Set loading false here
        }
      } catch (error: any) {
        console.error('❌ Error in getInitialSession:', error);

        // Handle AuthSessionMissingError or any auth-related errors
        if (error.message?.includes('Auth session missing') || error.message?.includes('session') || error.name === 'AuthSessionMissingError') {
          await clearAuthData();
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 AuthProvider - Auth State Change:', event);
      console.log('🔐 AuthProvider - Session:', session ? `✅ ${session.user?.email}` : '❌ None');
      console.log('🔐 AuthProvider - Mounted:', mounted);

      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Reset error state on successful auth
        if (session) {
          console.log('🎉 AuthProvider - Session found, should navigate to tabs');
          setHasAuthError(false);
        } else if (event === 'INITIAL_SESSION') {
          // If initial session is null, we're not authenticated
          console.log('🚫 AuthProvider - No initial session found, user needs to login');
          setHasAuthError(false); // Don't set error for normal "not logged in" state
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 AuthProvider - User signed out');
          setHasAuthError(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Global error handler for auth errors
  useEffect(() => {
    const handleGlobalError = (error: any) => {
      if (error.message?.includes('Auth session missing') || error.name === 'AuthSessionMissingError') {
        console.log('🚨 Global auth error detected, clearing session...');
        clearAuthData();
      }
    };

    // You can add global error listeners here if needed
    // For example, if you're using a global error handler

    return () => {
      // Cleanup
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session: hasAuthError ? null : session,
        user: hasAuthError ? null : user,
        isLoading,
        hasAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Named export
export { AuthProvider };

// Default export
export default AuthProvider;
