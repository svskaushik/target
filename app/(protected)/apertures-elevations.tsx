import React, { useState } from "react";
import {
	View,
	Text,
	ScrollView,
	Button,
	TextInput,
	TouchableOpacity,
} from "react-native";
import {
	useDistances,
	useCreateDistance,
	useDeleteDistance,
} from "@/hooks/useDistanceConfig";
import { ApertureElevationManager } from "@/components/forms/ApertureElevationManager";

export default function AperturesElevationsScreen() {
	const { data: distances = [], isLoading } = useDistances();
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

	return (
		<ScrollView style={{ flex: 1, padding: 16 }}>
			<Text style={{ fontWeight: "bold", fontSize: 20, marginBottom: 12 }}>
				Manage Distances, Apertures & Elevations
			</Text>
			<Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
				Distances
			</Text>
			{distances.map((d) => (
				<View
					key={d.id}
					style={{
						flexDirection: "row",
						alignItems: "center",
						marginBottom: 6,
					}}
				>
					<TouchableOpacity
						onPress={() => setSelectedDistanceId(d.id)}
						style={{ flex: 1 }}
					>
						<Text
							style={{
								fontWeight: selectedDistanceId === d.id ? "bold" : "normal",
							}}
						>
							{d.name} {d.is_premade ? "(Premade)" : "(Custom)"}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => handleDeleteDistance(d.id)}>
						<Text style={{ color: "red", marginLeft: 8 }}>Delete</Text>
					</TouchableOpacity>
				</View>
			))}
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					marginVertical: 12,
				}}
			>
				<TextInput
					placeholder="New distance name"
					value={newDistanceName}
					onChangeText={setNewDistanceName}
					style={{
						borderWidth: 1,
						borderColor: "#ccc",
						flex: 1,
						marginRight: 8,
						padding: 4,
					}}
				/>
				<Button title="Add" onPress={handleAddDistance} />
			</View>
			{selectedDistanceId ? (
				<ApertureElevationManager distanceId={selectedDistanceId} />
			) : (
				<Text style={{ marginTop: 16 }}>
					Select a distance to manage its apertures and elevations.
				</Text>
			)}
		</ScrollView>
	);
}
