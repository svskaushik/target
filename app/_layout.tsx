import "../global.css";

import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "@/context/supabase-provider";
import { ToastProvider } from "@/components/ui/toast";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { queryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function AppLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<ErrorBoundary>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<QueryClientProvider client={queryClient}>
					<ToastProvider>
						<AuthProvider>
							<Stack
								screenOptions={{ headerShown: false, gestureEnabled: false }}
							>
								<Stack.Screen name="(protected)" />
								<Stack.Screen name="welcome" />
								<Stack.Screen
									name="onboarding"
									options={{ headerShown: false }}
								/>
								<Stack.Screen
									name="auth/callback"
									options={{ headerShown: false }}
								/>
								<Stack.Screen
									name="sign-up"
									options={{
										presentation: "modal",
										headerShown: true,
										headerTitle: "Sign Up",
										headerStyle: {
											backgroundColor:
												colorScheme === "dark"
													? colors.dark.background
													: colors.light.background,
										},
										headerTintColor:
											colorScheme === "dark"
												? colors.dark.foreground
												: colors.light.foreground,
										gestureEnabled: true,
									}}
								/>
								<Stack.Screen
									name="sign-in"
									options={{
										presentation: "modal",
										headerShown: true,
										headerTitle: "Sign In",
										headerStyle: {
											backgroundColor:
												colorScheme === "dark"
													? colors.dark.background
													: colors.light.background,
										},
										headerTintColor:
											colorScheme === "dark"
												? colors.dark.foreground
												: colors.light.foreground,
										gestureEnabled: true,
									}}
								/>
							</Stack>
						</AuthProvider>
					</ToastProvider>
				</QueryClientProvider>
			</GestureHandlerRootView>
		</ErrorBoundary>
	);
}
