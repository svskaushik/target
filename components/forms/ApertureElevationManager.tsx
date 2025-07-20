import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Button,
	FlatList,
	TouchableOpacity,
} from "react-native";
import {
	useApertures,
	useElevations,
	useCreateAperture,
	useCreateElevation,
	useDeleteAperture,
	useDeleteElevation,
} from "@/hooks/useDistanceConfig";

interface ApertureElevationManagerProps {
	distanceId: string;
}

export function ApertureElevationManager({
	distanceId,
}: ApertureElevationManagerProps) {
	// State for new aperture/elevation values
	const [apertureValue, setApertureValue] = useState("");
	const [elevationValue, setElevationValue] = useState("");

	// Fetch existing apertures/elevations
	const { data: apertures = [] } = useApertures(distanceId);
	const { data: elevations = [] } = useElevations(distanceId);

	// Mutations
	const createAperture = useCreateAperture();
	const createElevation = useCreateElevation();
	const deleteAperture = useDeleteAperture();
	const deleteElevation = useDeleteElevation();

	// Handlers
	const handleAddAperture = () => {
		if (!apertureValue) return;
		createAperture.mutate({
			value: parseFloat(apertureValue),
			distance_id: distanceId,
		});
		setApertureValue("");
	};
	const handleAddElevation = () => {
		if (!elevationValue) return;
		createElevation.mutate({
			value: parseFloat(elevationValue),
			distance_id: distanceId,
		});
		setElevationValue("");
	};
	const handleDeleteAperture = (id: string) => {
		deleteAperture.mutate(id);
	};
	const handleDeleteElevation = (id: string) => {
		deleteElevation.mutate(id);
	};

	return (
		<View style={{ marginVertical: 16 }}>
			<Text style={{ fontWeight: "bold", fontSize: 16 }}>Apertures</Text>
			<FlatList
				data={apertures}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							marginVertical: 4,
						}}
					>
						<Text style={{ flex: 1 }}>{item.value}</Text>
						<TouchableOpacity onPress={() => handleDeleteAperture(item.id)}>
							<Text style={{ color: "red" }}>Delete</Text>
						</TouchableOpacity>
					</View>
				)}
				ListEmptyComponent={<Text>No apertures found.</Text>}
			/>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					marginVertical: 8,
				}}
			>
				<TextInput
					placeholder="Add aperture size"
					value={apertureValue}
					onChangeText={setApertureValue}
					keyboardType="numeric"
					style={{
						borderWidth: 1,
						borderColor: "#ccc",
						flex: 1,
						marginRight: 8,
						padding: 4,
					}}
				/>
				<Button title="Add" onPress={handleAddAperture} />
			</View>

			<Text style={{ fontWeight: "bold", fontSize: 16, marginTop: 16 }}>
				Elevations
			</Text>
			<FlatList
				data={elevations}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							marginVertical: 4,
						}}
					>
						<Text style={{ flex: 1 }}>{item.value}</Text>
						<TouchableOpacity onPress={() => handleDeleteElevation(item.id)}>
							<Text style={{ color: "red" }}>Delete</Text>
						</TouchableOpacity>
					</View>
				)}
				ListEmptyComponent={<Text>No elevations found.</Text>}
			/>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					marginVertical: 8,
				}}
			>
				<TextInput
					placeholder="Add elevation value"
					value={elevationValue}
					onChangeText={setElevationValue}
					keyboardType="numeric"
					style={{
						borderWidth: 1,
						borderColor: "#ccc",
						flex: 1,
						marginRight: 8,
						padding: 4,
					}}
				/>
				<Button title="Add" onPress={handleAddElevation} />
			</View>
		</View>
	);
}
