import React, { useState } from "react";
import { View, Alert, ScrollView } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { H3, Muted } from "@/components/ui/typography";
import { TargetButton } from "@/components/ui/target-button";
import {
	useApertures,
	useElevations,
	useCreateAperture,
	useCreateElevation,
	useDeleteAperture,
	useDeleteElevation,
} from "@/hooks/useDistanceConfig";
import {
	Plus,
	Trash2,
	Eye,
	TrendingUp,
	Target,
	Settings,
} from "lucide-react-native";

interface ApertureElevationManagerProps {
	distanceId: string;
}

export function ApertureElevationManager({
	distanceId,
}: ApertureElevationManagerProps) {
	// State for new aperture/elevation values
	const [apertureValue, setApertureValue] = useState("");
	const [elevationValue, setElevationValue] = useState("");
	const [showAddAperture, setShowAddAperture] = useState(false);
	const [showAddElevation, setShowAddElevation] = useState(false);

	// Fetch existing apertures/elevations
	const { data: apertures = [], isLoading: aperturesLoading } =
		useApertures(distanceId);
	const { data: elevations = [], isLoading: elevationsLoading } =
		useElevations(distanceId);

	// Mutations
	const createAperture = useCreateAperture();
	const createElevation = useCreateElevation();
	const deleteAperture = useDeleteAperture();
	const deleteElevation = useDeleteElevation();

	// Handlers
	const handleAddAperture = () => {
		const value = parseFloat(apertureValue);
		if (!apertureValue.trim() || isNaN(value)) {
			Alert.alert("Error", "Please enter a valid aperture size");
			return;
		}
		createAperture.mutate(
			{
				value: value,
				distance_id: distanceId,
			},
			{
				onSuccess: () => {
					setApertureValue("");
					setShowAddAperture(false);
				},
				onError: () => {
					Alert.alert("Error", "Failed to add aperture. Please try again.");
				},
			},
		);
	};

	const handleAddElevation = () => {
		const value = parseFloat(elevationValue);
		if (!elevationValue.trim() || isNaN(value)) {
			Alert.alert("Error", "Please enter a valid elevation value");
			return;
		}
		createElevation.mutate(
			{
				value: value,
				distance_id: distanceId,
			},
			{
				onSuccess: () => {
					setElevationValue("");
					setShowAddElevation(false);
				},
				onError: () => {
					Alert.alert("Error", "Failed to add elevation. Please try again.");
				},
			},
		);
	};

	const handleDeleteAperture = (id: string, value: number) => {
		Alert.alert(
			"Delete Aperture",
			`Are you sure you want to delete aperture size ${value}?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => {
						deleteAperture.mutate(id, {
							onError: () => {
								Alert.alert(
									"Error",
									"Failed to delete aperture. Please try again.",
								);
							},
						});
					},
				},
			],
		);
	};

	const handleDeleteElevation = (id: string, value: number) => {
		Alert.alert(
			"Delete Elevation",
			`Are you sure you want to delete elevation ${value}?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => {
						deleteElevation.mutate(id, {
							onError: () => {
								Alert.alert(
									"Error",
									"Failed to delete elevation. Please try again.",
								);
							},
						});
					},
				},
			],
		);
	};

	return (
		<ScrollView className="space-y-6">
			{/* Apertures Section */}
			<View className="space-y-4">
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<Eye size={20} className="mr-2 text-blue-600" />
						<H3>Aperture Sizes</H3>
					</View>
					<Button
						variant="outline"
						size="sm"
						onPress={() => setShowAddAperture(!showAddAperture)}
						className="flex-row items-center"
					>
						<Plus size={16} className="mr-1" />
						<Text>Add</Text>
					</Button>
				</View>

				<Muted>
					Configure aperture sizes for this distance. These will be available
					when creating targets.
				</Muted>

				{showAddAperture && (
					<View className="p-4 bg-blue-50 rounded-lg">
						<Text className="mb-2 font-medium">Add Aperture Size</Text>
						<View className="flex-row gap-2">
							<Input
								placeholder="Enter aperture size (e.g., 6.0)"
								value={apertureValue}
								onChangeText={setApertureValue}
								keyboardType="decimal-pad"
								className="flex-1"
							/>
							<Button
								onPress={handleAddAperture}
								disabled={!apertureValue.trim()}
							>
								<Text>Add</Text>
							</Button>
						</View>
					</View>
				)}

				{aperturesLoading ? (
					<View className="p-4">
						<Text>Loading apertures...</Text>
					</View>
				) : apertures.length === 0 ? (
					<View className="p-4 bg-gray-50 rounded-lg items-center">
						<Eye size={32} className="mb-2 text-gray-400" />
						<Text className="text-center text-gray-600">
							No apertures configured
						</Text>
						<Muted className="text-center">
							Add aperture sizes for this distance
						</Muted>
					</View>
				) : (
					<View className="space-y-2">
						{apertures
							.sort((a, b) => a.value - b.value)
							.map((aperture) => (
								<TargetButton
									key={aperture.id}
									className="p-3 bg-white border border-gray-200"
								>
									<View className="flex-row items-center justify-between">
										<Text className="font-medium">{aperture.value}</Text>
										<Button
											variant="ghost"
											size="sm"
											onPress={() =>
												handleDeleteAperture(aperture.id, aperture.value)
											}
										>
											<Trash2 size={16} className="text-red-500" />
										</Button>
									</View>
								</TargetButton>
							))}
					</View>
				)}
			</View>

			{/* Elevations Section */}
			<View className="space-y-4">
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<TrendingUp size={20} className="mr-2 text-green-600" />
						<H3>Elevation Values</H3>
					</View>
					<Button
						variant="outline"
						size="sm"
						onPress={() => setShowAddElevation(!showAddElevation)}
						className="flex-row items-center"
					>
						<Plus size={16} className="mr-1" />
						<Text>Add</Text>
					</Button>
				</View>

				<Muted>
					Configure elevation values for this distance. These will be available
					as presets when creating targets.
				</Muted>

				{showAddElevation && (
					<View className="p-4 bg-green-50 rounded-lg">
						<Text className="mb-2 font-medium">Add Elevation Value</Text>
						<View className="flex-row gap-2">
							<Input
								placeholder="Enter elevation (e.g., 2.5)"
								value={elevationValue}
								onChangeText={setElevationValue}
								keyboardType="decimal-pad"
								className="flex-1"
							/>
							<Button
								onPress={handleAddElevation}
								disabled={!elevationValue.trim()}
							>
								<Text>Add</Text>
							</Button>
						</View>
					</View>
				)}

				{elevationsLoading ? (
					<View className="p-4">
						<Text>Loading elevations...</Text>
					</View>
				) : elevations.length === 0 ? (
					<View className="p-4 bg-gray-50 rounded-lg items-center">
						<TrendingUp size={32} className="mb-2 text-gray-400" />
						<Text className="text-center text-gray-600">
							No elevations configured
						</Text>
						<Muted className="text-center">
							Add elevation values for this distance
						</Muted>
					</View>
				) : (
					<View className="space-y-2">
						{elevations
							.sort((a, b) => a.value - b.value)
							.map((elevation) => (
								<TargetButton
									key={elevation.id}
									className="p-3 bg-white border border-gray-200"
								>
									<View className="flex-row items-center justify-between">
										<Text className="font-medium">{elevation.value}</Text>
										<Button
											variant="ghost"
											size="sm"
											onPress={() =>
												handleDeleteElevation(elevation.id, elevation.value)
											}
										>
											<Trash2 size={16} className="text-red-500" />
										</Button>
									</View>
								</TargetButton>
							))}
					</View>
				)}
			</View>
		</ScrollView>
	);
}
