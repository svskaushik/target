import { Stack } from "expo-router";

export default function OnboardingLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				gestureEnabled: false, // Prevent swiping back during onboarding
				animation: "slide_from_right",
			}}
		>
			<Stack.Screen name="welcome" />
			<Stack.Screen name="concepts" />
			<Stack.Screen name="discipline-select" />
			<Stack.Screen name="complete" />
		</Stack>
	);
}
