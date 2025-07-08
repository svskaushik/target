import React, { useState } from "react";
import { View, Alert, ActivityIndicator, ScrollView } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { useDisciplines } from "@/hooks/useTargetConfig";
import {
	useUserDisciplines,
	useUpdateUserDisciplines,
} from "@/hooks/useUserDisciplines";

export default function Settings() {
	const { signOut, session } = useAuth();
	const [signingOut, setSigningOut] = useState(false);
	const { data: allDisciplines = [], isLoading: loadingDisciplines } =
		useDisciplines();
	const { data: userDisciplines = [], isLoading: loadingUserDisciplines } =
		useUserDisciplines();
	const updateUserDisciplines = useUpdateUserDisciplines();
	const [selected, setSelected] = useState<string[]>([]);

	// Debug: log discipline IDs for troubleshooting checkmarks
	React.useEffect(() => {
		if (allDisciplines && selected) {
			console.log(
				"All discipline IDs:",
				allDisciplines.map((d) => d.id),
			);
			console.log("Selected discipline IDs:", selected);
		}
	}, [allDisciplines, selected]);

	// Sync selected state with userDisciplines (defensively map to array of strings)
	React.useEffect(() => {
		if (userDisciplines) {
			// Defensive: map to array of strings in case hook returns objects
			const ids = userDisciplines
				.map((d: any) => (typeof d === "string" ? d : d?.discipline_id))
				.filter(Boolean);
			if (
				ids.length !== selected.length ||
				!ids.every((id, i) => id === selected[i])
			) {
				setSelected(ids);
			}
		}
	}, [userDisciplines]);

	const handleToggleDiscipline = (id: string) => {
		setSelected((prev) =>
			prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
		);
	};

	const handleSave = async () => {
		try {
			await updateUserDisciplines.mutateAsync(selected);
			Alert.alert("Disciplines updated");
		} catch (e: any) {
			Alert.alert("Error", e.message || "Failed to update disciplines");
		}
	};

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
		<ScrollView className="flex-1 bg-background p-4">
			<View className="flex-1 items-center gap-y-6">
				<H1 className="text-center text-2xl">Settings</H1>
				{session && (
					<View className="items-center gap-y-2 mb-8">
						<Text className="text-lg font-medium">Signed in as:</Text>
						<Muted className="text-center">{session.user?.email}</Muted>
					</View>
				)}
				<View className="w-full max-w-sm gap-y-4">
					<Text className="text-lg font-semibold mb-2">Your Disciplines</Text>
					{loadingDisciplines || loadingUserDisciplines ? (
						<ActivityIndicator size="small" />
					) : (
						allDisciplines.map((d) => (
							<View key={d.id} className="flex-row items-center mb-2">
								<Button
									variant={
										selected.includes(String(d.id)) ? "default" : "secondary"
									}
									onPress={() => handleToggleDiscipline(String(d.id))}
									size="sm"
									className="mr-2"
								>
									{selected.includes(String(d.id)) ? <Text>✓</Text> : null}
								</Button>
								{/* Ensure d.name is always rendered inside <Text> */}
								<Text>{d.name}</Text>
							</View>
						))
					)}
					<Button
						className="w-full mt-4"
						size="default"
						variant="default"
						onPress={handleSave}
						disabled={updateUserDisciplines.status === "pending"}
					>
						{updateUserDisciplines.status === "pending" ? (
							<ActivityIndicator size="small" color="white" />
						) : (
							<Text>Save Disciplines</Text>
						)}
					</Button>
				</View>
				<View className="w-full max-w-sm gap-y-4 mt-8">
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
		</ScrollView>
	);
}
