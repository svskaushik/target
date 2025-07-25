import React, { useState, useMemo } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useDistances, useElevations } from "@/hooks/useDistanceConfig";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H3, Muted } from "@/components/ui/typography";
import { ApertureElevationManager } from "./ApertureElevationManager";
import type { CreateTargetData } from "@/lib/types";
import {
	useFilteredDisciplines,
	useTargetTypes,
} from "@/hooks/useTargetConfig";
import { ChevronDown, Settings } from "lucide-react-native";

type PickerItem = { label: string; value: string | number };
interface PickerProps {
	selectedValue: string | number;
	onValueChange: (value: string | number) => void;
	items: PickerItem[];
	enabled?: boolean;
}
const Picker: React.FC<PickerProps> = ({
	selectedValue,
	onValueChange,
	items,
	enabled = true,
}) => (
	<View
		style={{
			borderWidth: 1,
			borderColor: "#ccc",
			borderRadius: 6,
			backgroundColor: enabled ? "#fff" : "#f3f4f6",
		}}
	>
		<select
			value={selectedValue}
			onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
				onValueChange(e.target.value)
			}
			style={{
				width: "100%",
				padding: 8,
				borderRadius: 6,
				borderColor: "#ccc",
				backgroundColor: enabled ? "#fff" : "#f3f4f6",
			}}
			disabled={!enabled}
		>
			{items.map((item) => (
				<option key={item.value} value={item.value}>
					{item.label}
				</option>
			))}
		</select>
	</View>
);
// ...existing code...
// ...existing code...
const ELEVATION_PRESETS = [0, 5, 10, 15, 20];
const WINDAGE_PRESETS = [0, 2, 4, 6, 8];
// ...existing code...

const targetSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name must be less than 50 characters"),
	distance: z.number().min(1, "Distance must be greater than 0"),
	discipline_id: z.string().min(1, "Please select a discipline"),
	target_type_id: z.string().min(1, "Please select a target type"),
	image_url: z.string().url().optional().or(z.literal("")),
	date: z.string().optional(),
	session_id: z.string().optional(),
	preset_elevation: z.number().optional(),
	windage: z.number().optional(),
	auto_graphing: z.boolean().optional(),
	target_number: z
		.number()
		.min(1, "Target number must be at least 1")
		.optional(),
});

interface TargetFormProps {
	onSubmit: (data: CreateTargetData) => void;
	initialData?: Partial<CreateTargetData>;
	isLoading?: boolean;
}

export function TargetForm({
	onSubmit,
	initialData,
	isLoading = false,
}: TargetFormProps) {
	// State to toggle between preset/manual for elevation and windage
	const [usePresetElevation, setUsePresetElevation] = useState(true);
	const [usePresetWindage, setUsePresetWindage] = useState(true);
	const [showApertureManager, setShowApertureManager] = useState(false);
	const { data: distances = [], isLoading: loadingDistances } = useDistances();
	const [selectedDistanceId, setSelectedDistanceId] = useState<string>("");

	// Get elevations for the selected distance
	const { data: availableElevations = [] } = useElevations(selectedDistanceId);

	// Memoized elevation options
	const elevationOptions = useMemo(() => {
		if (availableElevations.length === 0) {
			// Fallback to hardcoded presets if no database elevations
			return ELEVATION_PRESETS.map((preset) => ({
				label: String(preset),
				value: String(preset),
			}));
		}
		return availableElevations
			.sort((a, b) => a.value - b.value)
			.map((elevation) => ({
				label: String(elevation.value),
				value: String(elevation.value),
			}));
	}, [availableElevations]);
	const {
		control,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<any>({
		resolver: zodResolver(targetSchema),
		defaultValues: {
			name: initialData?.name || "",
			distance_id: initialData?.distance ? String(initialData.distance) : "",
			discipline_id: initialData?.discipline_id || "",
			target_type_id: initialData?.target_type_id || "",
			image_url: initialData?.image_url || "",
			date: initialData?.date || "",
			session_id: initialData?.session_id || "",
			preset_elevation: initialData?.preset_elevation || 0,
			windage: initialData?.windage || 0,
			auto_graphing: initialData?.auto_graphing || false,
			target_number: initialData?.target_number || 1,
		},
		mode: "onChange",
	});

	const { data: disciplines = [], isLoading: loadingDisciplines } =
		useFilteredDisciplines();
	const { data: targetTypes = [], isLoading: loadingTargetTypes } =
		useTargetTypes();

	return (
		<ScrollView className="flex-1 p-4">
			<View className="space-y-4">
				{/* Target Name */}
				<View>
					<Text className="text-base font-semibold mb-2 text-gray-900">
						Target Name
					</Text>
					<Controller
						control={control}
						name="name"
						render={({ field: { onChange, onBlur, value } }) => (
							<Input
								placeholder="Enter target name"
								onBlur={onBlur}
								onChangeText={onChange}
								value={value}
								className={errors.name ? "border-red-500" : "border-gray-300"}
							/>
						)}
					/>
					{errors.name && typeof errors.name.message === "string" && (
						<Text className="text-red-500 text-sm mt-1">
							{errors.name.message}
						</Text>
					)}
				</View>

				{/* Distance (select from saved) */}
				<View>
					<Text className="text-base font-semibold mb-2 text-gray-900">
						Distance
					</Text>
					<Controller
						control={control}
						name="distance_id"
						render={({ field: { onChange, value } }) => (
							<View
								style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
							>
								<View style={{ flex: 1 }}>
									<Picker
										selectedValue={value}
										onValueChange={(val) => {
											onChange(val);
											setSelectedDistanceId(String(val));
										}}
										items={[
											{ label: "Select distance", value: "" },
											...distances.map((d) => ({ label: d.name, value: d.id })),
										]}
										enabled={!loadingDistances}
									/>
								</View>
								{selectedDistanceId && (
									<TouchableOpacity
										onPress={() => setShowApertureManager((v) => !v)}
										style={{
											padding: 6,
											backgroundColor: "#f3f4f6",
											borderRadius: 6,
										}}
									>
										<Text style={{ color: "#2563eb", fontWeight: "bold" }}>
											{showApertureManager ? "Hide" : "Edit"} Apertures/Elev.
										</Text>
									</TouchableOpacity>
								)}
							</View>
						)}
					/>
					{errors.distance_id &&
						typeof errors.distance_id.message === "string" && (
							<Text className="text-red-500 text-sm mt-1">
								{errors.distance_id.message}
							</Text>
						)}
					{selectedDistanceId && showApertureManager && (
						<View className="mt-2">
							<ApertureElevationManager distanceId={selectedDistanceId} />
						</View>
					)}
				</View>

				<View>
					<Text className="text-base font-semibold mb-2 text-gray-900">
						Discipline
					</Text>
					<Controller
						control={control}
						name="discipline_id"
						render={({ field: { onChange, value } }) => (
							<Picker
								selectedValue={value}
								onValueChange={onChange}
								items={[
									{ label: "Select discipline", value: "" },
									...disciplines.map((d) => ({ label: d.name, value: d.id })),
								]}
								enabled={!loadingDisciplines}
							/>
						)}
					/>
					{errors.discipline_id &&
						typeof errors.discipline_id.message === "string" && (
							<Text className="text-red-500 text-sm mt-1">
								{errors.discipline_id.message}
							</Text>
						)}
				</View>

				<View>
					<Text className="text-base font-semibold mb-2 text-gray-900">
						Target Type
					</Text>
					<Controller
						control={control}
						name="target_type_id"
						render={({ field: { onChange, value } }) => (
							<Picker
								selectedValue={value}
								onValueChange={onChange}
								items={[
									{ label: "Select target type", value: "" },
									...targetTypes.map((t) => ({ label: t.name, value: t.id })),
								]}
								enabled={!loadingTargetTypes}
							/>
						)}
					/>
					{errors.target_type_id &&
						typeof errors.target_type_id.message === "string" && (
							<Text className="text-red-500 text-sm mt-1">
								{errors.target_type_id.message}
							</Text>
						)}
				</View>

				<View>
					<Text className="text-base font-semibold mb-2 text-gray-900">
						Image URL (Optional)
					</Text>
					<Controller
						control={control}
						name="image_url"
						render={({ field: { onChange, onBlur, value } }) => (
							<Input
								placeholder="Enter image URL"
								onBlur={onBlur}
								onChangeText={onChange}
								value={value}
								className={
									errors.image_url ? "border-red-500" : "border-gray-300"
								}
							/>
						)}
					/>
					{errors.image_url && typeof errors.image_url.message === "string" && (
						<Text className="text-red-500 text-sm mt-1">
							{errors.image_url.message}
						</Text>
					)}
				</View>

				{/* Date Field */}
				<View>
					<Text className="text-base font-semibold mb-2 text-gray-900">
						Date (Optional)
					</Text>
					<Controller
						control={control}
						name="date"
						render={({ field: { onChange, value } }) => (
							<Input
								placeholder="YYYY-MM-DD"
								onChangeText={onChange}
								value={value}
								keyboardType="default"
							/>
						)}
					/>
				</View>

				{/* Session (Optional) */}
				<View>
					<Text className="text-base font-semibold mb-2 text-gray-900">
						Session (Optional)
					</Text>
					<Controller
						control={control}
						name="session_id"
						render={({ field: { onChange, value } }) => (
							<Input
								placeholder="Session ID (optional)"
								onChangeText={onChange}
								value={value}
								keyboardType="default"
							/>
						)}
					/>
				</View>

				{/* Preset Elevation with toggle */}
				<View>
					<Text className="text-base font-semibold mb-2 text-gray-900">
						Elevation (Optional)
					</Text>
					<View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
						<Button
							variant={usePresetElevation ? "default" : "secondary"}
							size="sm"
							onPress={() => setUsePresetElevation(true)}
						>
							Preset
						</Button>
						<Button
							variant={!usePresetElevation ? "default" : "secondary"}
							size="sm"
							onPress={() => setUsePresetElevation(false)}
						>
							Manual
						</Button>
					</View>

					{/* Show elevation info */}
					{usePresetElevation && selectedDistanceId && (
						<View className="mb-2 p-2 bg-green-50 rounded">
							<Text className="text-sm text-green-700">
								{availableElevations.length > 0
									? `Using ${availableElevations.length} preset elevations for selected distance`
									: "Using default elevation presets (no custom elevations configured)"}
							</Text>
						</View>
					)}

					<Controller
						control={control}
						name="preset_elevation"
						render={({ field: { onChange, value } }) =>
							usePresetElevation ? (
								<Picker
									selectedValue={value ?? ""}
									onValueChange={(val: string | number) =>
										onChange(Number(val))
									}
									items={[
										{ label: "Select preset elevation", value: "" },
										...elevationOptions,
									]}
									enabled={elevationOptions.length > 0}
								/>
							) : (
								<Input
									placeholder="Enter elevation manually"
									onChangeText={(text) => onChange(parseFloat(text) || 0)}
									value={value?.toString()}
									keyboardType="numeric"
								/>
							)
						}
					/>

					{/* Helpful text for elevation */}
					{usePresetElevation && !selectedDistanceId && (
						<Text className="text-sm text-gray-500 mt-1">
							Select a distance first to see available preset elevations
						</Text>
					)}
				</View>

				{/* Windage with toggle */}
				<View>
					<Text className="text-base font-semibold mb-2 text-gray-900">
						Windage (Optional)
					</Text>
					<View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
						<Button
							variant={usePresetWindage ? "default" : "secondary"}
							size="sm"
							onPress={() => setUsePresetWindage(true)}
						>
							Preset
						</Button>
						<Button
							variant={!usePresetWindage ? "default" : "secondary"}
							size="sm"
							onPress={() => setUsePresetWindage(false)}
						>
							Manual
						</Button>
					</View>
					<Controller
						control={control}
						name="windage"
						render={({ field: { onChange, value } }) =>
							usePresetWindage ? (
								<Picker
									selectedValue={value ?? ""}
									onValueChange={(val: string | number) =>
										onChange(Number(val))
									}
									items={[
										{ label: "Select preset", value: "" },
										...WINDAGE_PRESETS.map((preset) => ({
											label: String(preset),
											value: String(preset),
										})),
									]}
								/>
							) : (
								<Input
									placeholder="Enter windage manually"
									onChangeText={(text) => onChange(parseFloat(text) || 0)}
									value={value?.toString()}
									keyboardType="numeric"
								/>
							)
						}
					/>
				</View>

				{/* Auto Graphing */}
				<View className="flex-row items-center">
					<Controller
						control={control}
						name="auto_graphing"
						render={({ field: { onChange, value } }) => (
							<>
								<input
									type="checkbox"
									checked={!!value}
									onChange={(e) => onChange(e.target.checked)}
								/>
								<Text className="ml-2">Enable Auto Graphing</Text>
							</>
						)}
					/>
				</View>

				{/* Target Number */}
				<View>
					<Text className="text-base font-semibold mb-2 text-gray-900">
						Target Number (Optional)
					</Text>
					<Controller
						control={control}
						name="target_number"
						render={({ field: { onChange, value } }) => (
							<Input
								placeholder="Target Number"
								onChangeText={(text) => onChange(parseInt(text) || 1)}
								value={value?.toString()}
								keyboardType="numeric"
							/>
						)}
					/>
				</View>

				<Button
					onPress={handleSubmit(onSubmit)}
					disabled={!isValid || isLoading}
					className="mt-6"
				>
					<Text className="text-white font-semibold">
						{isLoading ? "Creating..." : "Create Target"}
					</Text>
				</Button>
			</View>
		</ScrollView>
	);
}
