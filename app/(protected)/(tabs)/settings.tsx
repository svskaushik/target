import { View, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";

export default function Settings() {
	const { signOut, session } = useAuth();
	const [signingOut, setSigningOut] = useState(false);

	const handleSignOut = async () => {
		try {
			setSigningOut(true);
			const result = await signOut();

			if (!result.success) {
				Alert.alert(
					"Sign Out Failed",
					result.error || "Failed to sign out. Please try again.",
					[{ text: "OK" }],
				);
			}
			// Success will be handled by the auth state change
		} catch (error: any) {
			console.error("Sign out error:", error);
			Alert.alert(
				"Error",
				"An unexpected error occurred during sign out. Please try again.",
				[{ text: "OK" }],
			);
		} finally {
			setSigningOut(false);
		}
	};

	return (
		<View className="flex-1 bg-background p-4">
			<View className="flex-1 justify-center items-center gap-y-6">
				<H1 className="text-center text-2xl">Settings</H1>

				{session && (
					<View className="items-center gap-y-2 mb-8">
						<Text className="text-lg font-medium">Signed in as:</Text>
						<Muted className="text-center">{session.user?.email}</Muted>
					</View>
				)}

				<View className="w-full max-w-sm gap-y-4">
					<Button
						className="w-full"
						size="default"
						variant="destructive"
						onPress={handleSignOut}
						disabled={signingOut}
					>
						{signingOut ? (
							<ActivityIndicator size="small" color="white" />
						) : (
							<Text>Sign Out</Text>
						)}
					</Button>
				</View>
			</View>
		</View>
	);
}
