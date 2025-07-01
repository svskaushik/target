import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/context/supabase-provider";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

export default function ProtectedLayout() {
	const { initialized, session } = useAuth();
	const { colorScheme } = useColorScheme();

	if (!initialized) {
		return null;
	}

	if (!session) {
		return <Redirect href="/welcome" />;
	}

	return (
		<Stack
			screenOptions={{
				headerShown: true,
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
				headerTitleStyle: {
					fontWeight: '600',
				},
			}}
		>
			{/* Main tabs - no header shown as tabs have their own navigation */}
			<Stack.Screen 
				name="(tabs)" 
				options={{ 
					headerShown: false 
				}} 
			/>
			
			{/* Target screens */}
			<Stack.Screen 
				name="target/create" 
				options={{ 
					title: "Create Target",
					presentation: "card",
				}} 
			/>
			<Stack.Screen 
				name="target/[id]" 
				options={{ 
					title: "Target Details",
					presentation: "card",
				}} 
			/>
			<Stack.Screen 
				name="target/edit/[id]" 
				options={{ 
					title: "Edit Target",
					presentation: "modal",
				}} 
			/>
			
			{/* Session screens */}
			<Stack.Screen 
				name="session/create" 
				options={{ 
					title: "Create Session",
					presentation: "card",
				}} 
			/>
			<Stack.Screen 
				name="session/[id]" 
				options={{ 
					title: "Session Details",
					presentation: "card",
				}} 
			/>
			<Stack.Screen 
				name="session/edit/[id]" 
				options={{ 
					title: "Edit Session",
					presentation: "modal",
				}} 
			/>
			<Stack.Screen 
				name="session/shoot/[id]" 
				options={{ 
					title: "Shooting Session",
					presentation: "card",
				}} 
			/>
			
			{/* Modal screen */}
			<Stack.Screen 
				name="modal" 
				options={{ 
					presentation: "modal",
					title: "Modal",
				}} 
			/>
		</Stack>
	);
}
