import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import { SplashScreen, useRouter, usePathname } from "expo-router";
import { Alert } from "react-native";

import { Session, AuthError } from "@supabase/supabase-js";

import { supabase } from "@/config/supabase";

SplashScreen.preventAutoHideAsync();

// TEMPORARY: Set to true to disable authentication for development
const AUTH_DISABLED = false;

type AuthState = {
	initialized: boolean;
	session: Session | null;
	loading: boolean;
	signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
	signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
	signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
	signOut: () => Promise<{ success: boolean; error?: string }>;
};

export const AuthContext = createContext<AuthState>({
	initialized: false,
	session: null,
	loading: false,
	signUp: async () => ({ success: false }),
	signIn: async () => ({ success: false }),
	signInWithGoogle: async () => ({ success: false }),
	signOut: async () => ({ success: false }),
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: PropsWithChildren) {
	const [initialized, setInitialized] = useState(false);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(false);
	const [lastNavigationTime, setLastNavigationTime] = useState(0);
	const router = useRouter();
	const pathname = usePathname();

	const signUp = async (email: string, password: string) => {
		try {
			setLoading(true);
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
			});

			if (error) {
				console.error("Error signing up:", error);
				return { 
					success: false, 
					error: error.message || "An error occurred during sign up" 
				};
			}

			if (data.session) {
				setSession(data.session);
				console.log("User signed up with session:", data.user);
				return { success: true };
			} else if (data.user && !data.user.email_confirmed_at) {
				console.log("User signed up, email verification required:", data.user);
				return { 
					success: true, 
					needsVerification: true 
				};
			} else {
				console.log("No user returned from sign up");
				return { 
					success: false, 
					error: "Account creation failed. Please try again." 
				};
			}
		} catch (error) {
			console.error("Sign up error:", error);
			return { 
				success: false, 
				error: "An unexpected error occurred. Please try again." 
			};
		} finally {
			setLoading(false);
		}
	};

	const signIn = async (email: string, password: string) => {
		try {
			setLoading(true);
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				console.error("Error signing in:", error);
				return { 
					success: false, 
					error: error.message || "Invalid email or password" 
				};
			}

			if (data.session) {
				setSession(data.session);
				console.log("User signed in:", data.user);
				return { success: true };
			} else {
				console.log("No session returned from sign in");
				return { 
					success: false, 
					error: "Sign in failed. Please check your credentials." 
				};
			}
		} catch (error) {
			console.error("Sign in error:", error);
			return { 
				success: false, 
				error: "An unexpected error occurred. Please try again." 
			};
		} finally {
			setLoading(false);
		}
	};

	const signInWithGoogle = async () => {
		try {
			setLoading(true);
			
			// Get the current host dynamically for better Docker compatibility
			const getRedirectURL = () => {
				if (typeof window !== 'undefined') {
					// Web environment - use current origin
					return `${window.location.origin}/auth/callback`;
				}
				// Fallback for non-web environments
				return process.env.EXPO_PUBLIC_AUTH_CALLBACK_URL || 'http://localhost:8081/auth/callback';
			};
			
			const redirectTo = getRedirectURL();
			console.log('Google OAuth redirect URL:', redirectTo);
			
			// Use Supabase's OAuth flow with PKCE
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					scopes: 'email profile',
					redirectTo,
					queryParams: {
						access_type: 'offline',
						prompt: 'consent',
					}
				}
			});

			if (error) {
				console.error("Error signing in with Google:", error);
				return { 
					success: false, 
					error: error.message || "Google sign in failed" 
				};
			}

			if (data?.url) {
				console.log('Redirecting to Google OAuth URL:', data.url);
				// The redirect will be handled automatically by Supabase
				// No need for manual window.location.href since we removed skipBrowserRedirect
				return { success: true };
			} else {
				console.error("No authorization URL received from Supabase");
				return { 
					success: false, 
					error: "Failed to get authorization URL" 
				};
			}
		} catch (error) {
			console.error("Google sign in error:", error);
			return { 
				success: false, 
				error: "An unexpected error occurred with Google sign in." 
			};
		} finally {
			setLoading(false);
		}
	};

	const signOut = async () => {
		try {
			setLoading(true);
			const { error } = await supabase.auth.signOut();

			if (error) {
				console.error("Error signing out:", error);
				return { 
					success: false, 
					error: error.message || "Sign out failed" 
				};
			}

			console.log("User signed out");
			return { success: true };
		} catch (error) {
			console.error("Sign out error:", error);
			return { 
				success: false, 
				error: "An unexpected error occurred during sign out." 
			};
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (AUTH_DISABLED) {
			setSession({} as Session); // Fake session object
			setInitialized(true);
			return;
		}

		// Initialize authentication state
		const initializeAuth = async () => {
			try {
				console.log('Initializing authentication...');
				const { data: { session }, error } = await supabase.auth.getSession();
				
				if (error) {
					console.error('Error getting initial session:', error);
				} else {
					console.log('Initial session:', session?.user?.email ? 'Found user: ' + session.user.email : 'No session');
					setSession(session);
				}
			} catch (error) {
				console.error('Failed to initialize auth:', error);
			} finally {
				setInitialized(true);
			}
		};

		// Set up auth state listener
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
			console.log('Auth state change:', event, session?.user?.email ? `User: ${session.user.email}` : 'No user');
			setSession(session);
			
			// Handle specific authentication events
			if (event === 'SIGNED_IN' && session?.user) {
				console.log('User successfully signed in:', session.user.email);
				console.log('Session established, should redirect to protected area');
				// Additional debugging for PKCE flow
				if (session.provider_token) {
					console.log('OAuth provider token received - PKCE flow successful');
				}
			} else if (event === 'SIGNED_OUT') {
				console.log('User signed out');
			} else if (event === 'TOKEN_REFRESHED' && session?.user) {
				console.log('Token refreshed for user:', session.user.email);
			} else if (event === 'USER_UPDATED' && session?.user) {
				console.log('User updated:', session.user.email);
			}
		});

		initializeAuth();

		// Cleanup subscription on unmount
		return () => {
			subscription.unsubscribe();
		};
	}, []);

	useEffect(() => {
		if (initialized) {
			SplashScreen.hideAsync();
			
			// Prevent rapid navigation loops - add debounce
			const now = Date.now();
			if (now - lastNavigationTime < 100) {
				return;
			}
			
			// Ensure pathname is properly defined before using it
			const currentPath = pathname || '';
			
			// Don't interfere with authentication pages or OAuth callback processing
			if (currentPath.includes('/auth/callback') || 
				currentPath.includes('/sign-in') || 
				currentPath.includes('/sign-up')) {
				console.log('Skipping navigation - on auth page:', currentPath);
				return;
			}
			
			// Don't interfere with tab navigation within protected area
			if (currentPath.startsWith('/(protected)')) {
				return;
			}
			
			if (AUTH_DISABLED) {
				// Always route to home if auth is disabled
				setLastNavigationTime(now);
				try {
					router.replace("/(protected)/(tabs)");
				} catch (error) {
					console.error("Navigation error in AUTH_DISABLED mode:", error);
				}
				return;
			}
			
			if (session) {
				// User is authenticated, redirect to protected area only from public pages
				if (currentPath === '/welcome' || currentPath === '/' || currentPath === '') {
					console.log('Redirecting authenticated user to protected area from:', currentPath);
					setLastNavigationTime(now);
					try {
						router.replace("/(protected)/(tabs)");
					} catch (error) {
						console.error("Navigation error when redirecting authenticated user:", error);
					}
				}
			} else {
				// User is not authenticated, redirect to welcome from any non-auth page
				if (currentPath !== '/welcome' && currentPath !== '/sign-in' && currentPath !== '/sign-up' && 
					!currentPath.includes('/auth/callback')) {
					console.log('Redirecting unauthenticated user to welcome from:', currentPath);
					setLastNavigationTime(now);
					try {
						router.replace("/welcome");
					} catch (error) {
						console.error("Navigation error when redirecting unauthenticated user:", error);
					}
				}
			}
		}
		// eslint-disable-next-line
	}, [initialized, session, pathname]);

	return (
		<AuthContext.Provider
			value={{
				initialized,
				session: AUTH_DISABLED ? ({} as Session) : session,
				loading,
				signUp,
				signIn,
				signInWithGoogle,
				signOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
