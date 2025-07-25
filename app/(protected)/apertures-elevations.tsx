import React, { useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { H1, H2, H3, Muted } from "@/components/ui/typography";
import { TargetButton } from "@/components/ui/target-button";
import {
	useDistances,
	useCreateDistance,
	useDeleteDistance,
} from "@/hooks/useDistanceConfig";
import { ApertureElevationManager } from "@/components/forms/ApertureElevationManager";
import {
	Plus,
	Target,
	Trash2,
	Settings,
	ChevronRight,
} from "lucide-react-native";

export default function AperturesElevationsScreen() {
	const { data: distances = [], isLoading } = useDistances();
	const createDistance = useCreateDistance();
	const deleteDistance = useDeleteDistance();
	const [selectedDistanceId, setSelectedDistanceId] = useState<string>("");
	const [newDistanceName, setNewDistanceName] = useState("");
	const [showAddDistance, setShowAddDistance] = useState(false);

	const handleAddDistance = () => {
		if (!newDistanceName.trim()) {
			Alert.alert("Error", "Please enter a distance name");
			return;
		}
		createDistance.mutate(
			{ name: newDistanceName.trim() },
			{
				onSuccess: () => {
					setNewDistanceName("");
					setShowAddDistance(false);
				},
				onError: (error) => {
					Alert.alert("Error", "Failed to create distance. Please try again.");
				},
			},
		);
	};

	const handleDeleteDistance = (id: string, name: string) => {
		Alert.alert(
			"Delete Distance",
			`Are you sure you want to delete "${name}"? This will also delete all associated apertures and elevations.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => {
						deleteDistance.mutate(id, {
							onSuccess: () => {
								if (selectedDistanceId === id) setSelectedDistanceId("");
							},
							onError: () => {
								Alert.alert(
									"Error",
									"Failed to delete distance. Please try again.",
								);
							},
						});
					},
				},
			],
		);
	};

	const selectedDistance = distances.find((d) => d.id === selectedDistanceId);

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1 p-4">
				<View className="mb-6">
					<H1 className="mb-2">Apertures & Elevations</H1>
					<Muted>
						Manage your shooting distances and their corresponding aperture
						sizes and elevation settings for precise targeting.
					</Muted>
				</View>

				{/* Distance Management Section */}
				<View className="mb-8">
					<View className="flex-row items-center justify-between mb-4">
						<H2>Distances</H2>
						<Button
							variant="outline"
							size="sm"
							onPress={() => setShowAddDistance(!showAddDistance)}
							className="flex-row items-center"
						>
							<Plus size={16} className="mr-2" />
							<Text>Add Distance</Text>
						</Button>
					</View>

					{showAddDistance && (
						<View className="mb-4 p-4 bg-gray-50 rounded-lg">
							<Text className="mb-2 font-medium">Create New Distance</Text>
							<View className="flex-row gap-2">
								<Input
									placeholder="Enter distance name (e.g., 100m, 50 yards)"
									value={newDistanceName}
									onChangeText={setNewDistanceName}
									className="flex-1"
									autoCapitalize="none"
								/>
								<Button
									onPress={handleAddDistance}
									disabled={!newDistanceName.trim()}
								>
									<Text>Add</Text>
								</Button>
							</View>
						</View>
					)}

					{isLoading ? (
						<View className="p-4">
							<Text>Loading distances...</Text>
						</View>
					) : distances.length === 0 ? (
						<View className="p-6 bg-gray-50 rounded-lg items-center">
							<Target size={48} className="mb-4 text-gray-400" />
							<Text className="text-center text-gray-600 mb-2">
								No distances configured yet
							</Text>
							<Muted className="text-center">
								Add your first distance to start managing apertures and
								elevations
							</Muted>
						</View>
					) : (
						<View className="space-y-2">
							{distances.map((distance) => (
								<TargetButton
									key={distance.id}
									onPress={() => setSelectedDistanceId(distance.id)}
									className={`p-4 ${
										selectedDistanceId === distance.id
											? "bg-blue-50 border-blue-200"
											: "bg-white"
									}`}
								>
									<View className="flex-row items-center justify-between">
										<View className="flex-1">
											<Text className="font-medium">{distance.name}</Text>
											<Muted>
												{distance.is_premade
													? "Premade Distance"
													: "Custom Distance"}
											</Muted>
										</View>
										<View className="flex-row items-center">
											{!distance.is_premade && (
												<Button
													variant="ghost"
													size="sm"
													onPress={() =>
														handleDeleteDistance(distance.id, distance.name)
													}
													className="mr-2"
												>
													<Trash2 size={16} className="text-red-500" />
												</Button>
											)}
											<ChevronRight
												size={20}
												className={
													selectedDistanceId === distance.id
														? "text-blue-500"
														: "text-gray-400"
												}
											/>
										</View>
									</View>
								</TargetButton>
							))}
						</View>
					)}
				</View>

				{/* Aperture & Elevation Management Section */}
				{selectedDistanceId ? (
					<View>
						<H2 className="mb-4">Manage {selectedDistance?.name} Settings</H2>
						<ApertureElevationManager distanceId={selectedDistanceId} />
					</View>
				) : (
					<View className="p-6 bg-gray-50 rounded-lg items-center">
						<Settings size={48} className="mb-4 text-gray-400" />
						<Text className="text-center text-gray-600 mb-2">
							Select a distance to manage settings
						</Text>
						<Muted className="text-center">
							Choose a distance above to configure its aperture sizes and
							elevation values
						</Muted>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
