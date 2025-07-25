import React, { useState } from "react";
import { View, Alert, ActivityIndicator, ScrollView } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ApertureElevationManager } from "@/components/forms/ApertureElevationManager";
import {
	useDistances,
	useCreateDistance,
	useDeleteDistance,
} from "@/hooks/useDistanceConfig";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { useDisciplines } from "@/hooks/useTargetConfig";
import {
	useUserDisciplines,
	useUpdateUserDisciplines,
} from "@/hooks/useUserDisciplines";

export default function Settings() {
	// Elevation/Aperture management state
	const { data: distances = [], isLoading: loadingDistances } = useDistances();
	const createDistance = useCreateDistance();
	const deleteDistance = useDeleteDistance();
	const [selectedDistanceId, setSelectedDistanceId] = useState<string>("");
	const [newDistanceName, setNewDistanceName] = useState("");

	const handleAddDistance = () => {
		if (!newDistanceName) return;
		createDistance.mutate({ name: newDistanceName });
		setNewDistanceName("");
	};
	const handleDeleteDistance = (id: string) => {
		deleteDistance.mutate(id);
		if (selectedDistanceId === id) setSelectedDistanceId("");
	};
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
	}, [userDisciplines, selected]);

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
				<ScrollView className="flex-1 bg-background p-4">
					<View className="flex-1 items-center w-full max-w-2xl mx-auto gap-y-8">
						<H1 className="text-center text-2xl mb-2">Settings</H1>
						{session && (
							<View className="bg-white rounded-lg shadow p-6 w-full flex items-center mb-2 border border-gray-200">
								<Text className="text-lg font-medium mb-1">Signed in as:</Text>
								<Muted className="text-center">{session.user?.email}</Muted>
							</View>
						)}

						{/* Disciplines Section */}
						<View className="bg-white rounded-lg shadow p-6 w-full border border-gray-200 mb-2">
							<Text className="text-lg font-semibold mb-4">
								Your Disciplines
							</Text>
							{loadingDisciplines || loadingUserDisciplines ? (
								<ActivityIndicator size="small" />
							) : (
								allDisciplines.map((d) => (
									<View key={d.id} className="flex-row items-center mb-2">
										<Button
											variant={
												selected.includes(String(d.id))
													? "default"
													: "secondary"
											}
											onPress={() => handleToggleDiscipline(String(d.id))}
											size="sm"
											className="mr-2"
										>
											{selected.includes(String(d.id)) ? <Text>✓</Text> : null}
										</Button>
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

						{/* Manage Distances, Apertures & Elevations Section */}
						<View className="bg-white rounded-lg shadow p-6 w-full border border-gray-200 mb-2">
							<Text className="text-lg font-semibold mb-4">
								Manage Distances, Apertures & Elevations
							</Text>
							<Text className="text-base font-medium mb-2">Distances</Text>
							{loadingDistances ? (
								<ActivityIndicator size="small" />
							) : (
								<View className="space-y-2">
									{distances.map((d) => (
										<View key={d.id} className="flex-row items-center mb-1">
											<Button
												variant={
													selectedDistanceId === d.id ? "default" : "secondary"
												}
												onPress={() => setSelectedDistanceId(d.id)}
												size="sm"
												className="mr-2"
											>
												<Text>
													{d.name} {d.is_premade ? "(Premade)" : "(Custom)"}
												</Text>
											</Button>
											<Button
												variant="destructive"
												onPress={() => handleDeleteDistance(d.id)}
												size="sm"
											>
												<Text>Delete</Text>
											</Button>
										</View>
									))}
								</View>
							)}
							<View className="flex-row items-center mt-2 mb-4">
								<input
									type="text"
									placeholder="New distance name"
									value={newDistanceName}
									onChange={(e) => setNewDistanceName(e.target.value)}
									className="border rounded px-2 py-1 flex-1 mr-2"
								/>
								<Button onPress={handleAddDistance} size="sm">
									<Text>Add</Text>
								</Button>
							</View>
							{selectedDistanceId ? (
								<ApertureElevationManager distanceId={selectedDistanceId} />
							) : (
								<Text className="text-gray-500 mt-2">
									Select a distance to manage its apertures and elevations.
								</Text>
							)}
						</View>

						{/* Apertures & Elevations Management */}
						<View className="bg-white rounded-lg shadow p-6 w-full border border-gray-200 mt-2">
							<H1 className="text-xl font-bold mb-4">Apertures & Elevations</H1>
							<Muted className="mb-4">
								Manage your aperture and elevation settings for different
								distances.
							</Muted>
							<Button
								className="w-full"
								size="default"
								variant="outline"
								onPress={() => router.push("/apertures-elevations")}
							>
								<Text>Open Apertures & Elevations Manager</Text>
							</Button>
						</View>

						{/* Sign Out Section */}
						<View className="bg-white rounded-lg shadow p-6 w-full border border-gray-200 mt-2">
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
			</View>
		</ScrollView>
	);
}
