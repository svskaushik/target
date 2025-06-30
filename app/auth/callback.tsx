import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";

import { supabase } from "@/config/supabase";
import { SafeAreaView } from "@/components/safe-area-view";

export default function AuthCallback() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
	const [errorMessage, setErrorMessage] = useState<string>('');

	useEffect(() => {
		async function handleCallback() {
			try {
				console.log('OAuth callback received with params:', params);
				
				// Check for error parameters first
				if (params.error) {
					console.error("OAuth error from params:", params.error);
					setStatus('error');
					setErrorMessage(typeof params.error === 'string' ? params.error : 'OAuth authentication failed');
					setTimeout(() => router.replace('/sign-in'), 3000);
					return;
				}

				// Wait for Supabase to automatically detect and process the session
				console.log("Waiting for automatic session detection...");
				setStatus('processing');
				
				// Wait a moment for session to be established
				await new Promise(resolve => setTimeout(resolve, 1000));
				
				// Check if session was established
				const { data: { session }, error } = await supabase.auth.getSession();
				
				if (error) {
					console.error("Error getting session after OAuth:", error);
					setStatus('error');
					setErrorMessage(`Authentication failed: ${error.message || 'Unknown error'}`);
					setTimeout(() => router.replace('/sign-in'), 3000);
					return;
				}

				if (session?.user) {
					console.log("OAuth session established successfully:", session.user.email);
					setStatus('success');
					// Give AuthProvider time to detect the session change
					setTimeout(() => {
						router.replace('/(protected)/(tabs)');
					}, 1000);
				} else {
					console.log("No session found, waiting longer for session establishment...");
					// Wait a bit longer with exponential backoff for session processing
					let retryCount = 0;
					const maxRetries = 3;
					const baseDelay = 1000;
					
					while (retryCount < maxRetries) {
						const delay = baseDelay * Math.pow(2, retryCount);
						await new Promise(resolve => setTimeout(resolve, delay));
						
						const { data: { session: retrySession } } = await supabase.auth.getSession();
						if (retrySession?.user) {
							console.log(`OAuth session established on retry ${retryCount + 1}:`, retrySession.user.email);
							setStatus('success');
							setTimeout(() => {
								router.replace('/(protected)/(tabs)');
							}, 1000);
							return;
						}
						retryCount++;
						console.log(`Retry ${retryCount}/${maxRetries} - still waiting for session...`);
					}
					
					console.error("No session received after OAuth callback with retries");
					setStatus('error');
					setErrorMessage('Session creation failed after multiple attempts. Please try signing in again.');
					setTimeout(() => router.replace('/sign-in'), 3000);
				}
			} catch (error) {
				console.error("Unexpected error during OAuth callback:", error);
				setStatus('error');
				setErrorMessage('An unexpected error occurred during authentication.');
				setTimeout(() => router.replace('/sign-in'), 3000);
			}
		}

		// Run callback handler
		handleCallback();
	}, [params, router]);

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1 items-center justify-center gap-4">
				<ActivityIndicator size="large" />
				{status === 'processing' && (
					<>
						<Text className="text-lg">Completing sign in...</Text>
						<Text className="text-sm text-muted-foreground text-center px-4">
							Please wait while we finish setting up your account.
						</Text>
					</>
				)}
				{status === 'success' && (
					<>
						<Text className="text-lg text-green-600">Sign in successful!</Text>
						<Text className="text-sm text-muted-foreground text-center px-4">
							Redirecting to your dashboard...
						</Text>
					</>
				)}
				{status === 'error' && (
					<>
						<Text className="text-lg text-red-600">Authentication Error</Text>
						<Text className="text-sm text-muted-foreground text-center px-4">
							{errorMessage}
						</Text>
						<Text className="text-xs text-muted-foreground text-center px-4">
							Redirecting to sign in page...
						</Text>
					</>
				)}
			</View>
		</SafeAreaView>
	);
}
