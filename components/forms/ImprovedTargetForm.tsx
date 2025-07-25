import React, { useState, useMemo } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { useDistances, useElevations } from "@/hooks/useDistanceConfig";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H2, H3, Muted } from "@/components/ui/typography";
// ...existing code...
import type { CreateTargetData } from "@/lib/types";
import {
	useFilteredDisciplines,
	useTargetTypes,
} from "@/hooks/useTargetConfig";
import { useSessions } from "@/hooks/useSessions";
import {
	Target,
	Calendar,
	Settings,
	// ...existing code...
} from "lucide-react-native";

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

interface ImprovedTargetFormProps {
	onSubmit: (data: CreateTargetData) => void;
	initialData?: Partial<CreateTargetData>;
	isLoading?: boolean;
	preselectedSessionId?: string;
	showSessionSelection?: boolean;
}

export function ImprovedTargetForm({
	onSubmit,
	initialData,
	isLoading = false,
	preselectedSessionId,
	showSessionSelection = true,
}: ImprovedTargetFormProps) {
	// State management
	const [usePresetElevation, setUsePresetElevation] = useState(true);
	const [selectedDistanceId, setSelectedDistanceId] = useState<string>("");

	// Data hooks
	const { data: distances = [], isLoading: loadingDistances } = useDistances();
	const { data: availableElevations = [] } = useElevations(selectedDistanceId);
	const { data: disciplines = [], isLoading: loadingDisciplines } =
		useFilteredDisciplines();
	const { data: targetTypes = [], isLoading: loadingTargetTypes } =
		useTargetTypes();
	const { data: sessions = [], isLoading: loadingSessions } = useSessions();

	// Memoized elevation options
	const elevationOptions = useMemo(() => {
		if (availableElevations.length === 0) {
			// Fallback to common elevation values
			const defaultElevations = [0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20];
			return defaultElevations.map((preset) => ({
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

	// Form setup
	const {
		control,
		handleSubmit,
		formState: { errors, isValid },
		watch,
	} = useForm<any>({
		resolver: zodResolver(targetSchema),
		defaultValues: {
			name: initialData?.name || "",
			distance: initialData?.distance || "",
			discipline_id: initialData?.discipline_id || "",
			target_type_id: initialData?.target_type_id || "",
			image_url: initialData?.image_url || "",
			date: initialData?.date || new Date().toISOString().split("T")[0],
			session_id: preselectedSessionId || initialData?.session_id || "",
			preset_elevation: initialData?.preset_elevation || "",
			windage: initialData?.windage || 0,
			auto_graphing: initialData?.auto_graphing || false,
			target_number: initialData?.target_number || 1,
		},
		mode: "onChange",
	});

	const watchedSessionId = watch("session_id");

	const handleFormSubmit = (data: any) => {
		// Transform the data to match CreateTargetData interface
		const transformedData: CreateTargetData = {
			...data,
			distance: Number(data.distance),
			preset_elevation: data.preset_elevation
				? Number(data.preset_elevation)
				: undefined,
			windage: data.windage ? Number(data.windage) : undefined,
			target_number: data.target_number
				? Number(data.target_number)
				: undefined,
		};
		onSubmit(transformedData);
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1 p-4">
				<View className="space-y-6">
					{/* Header */}
					<View className="mb-4">
						<H2 className="mb-2">Create New Target</H2>
						<Muted>
							Configure your target parameters for precise shooting tracking
						</Muted>
					</View>

					{/* Session Selection (if enabled) */}
					{showSessionSelection && (
						<View className="space-y-3">
							<View className="flex-row items-center">
								<Calendar size={20} className="mr-2 text-blue-600" />
								<H3>Session (Optional)</H3>
							</View>
							<Muted>
								Link this target to a shooting session for organized tracking
							</Muted>
							<Controller
								control={control}
								name="session_id"
								render={({ field: { onChange, value } }) => (
									<View className="space-y-2">
										<View className="border border-gray-300 rounded-lg">
											<select
												value={value || ""}
												onChange={(e) => onChange(e.target.value)}
												className="w-full p-3 rounded-lg bg-white"
												disabled={loadingSessions}
											>
												<option value="">No session (standalone target)</option>
												{sessions.map((session) => (
													<option key={session.id} value={session.id}>
														{session.name} -{" "}
														{new Date(session.date).toLocaleDateString()}
													</option>
												))}
											</select>
										</View>
										{watchedSessionId && (
											<View className="p-2 bg-blue-50 rounded">
												<Text className="text-sm text-blue-700">
													✓ Target will be automatically added to the selected
													session
												</Text>
											</View>
										)}
									</View>
								)}
							/>
						</View>
					)}

					{/* Basic Target Information */}
					<View className="space-y-4">
						<View className="flex-row items-center">
							<Target size={20} className="mr-2 text-green-600" />
							<H3>Target Information</H3>
						</View>

						{/* Target Name */}
						<View>
							<Text className="text-base font-medium mb-2">Target Name *</Text>
							<Controller
								control={control}
								name="name"
								render={({ field: { onChange, onBlur, value } }) => (
									<Input
										placeholder="Enter descriptive target name"
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										className={errors.name ? "border-red-500" : ""}
									/>
								)}
							/>
							{errors.name && (
								<Text className="text-red-500 text-sm mt-1">
									{errors.name.message as string}
								</Text>
							)}
						</View>

						{/* Distance */}
						<View>
							<Text className="text-base font-medium mb-2">Distance *</Text>
							<Controller
								control={control}
								name="distance"
								render={({ field: { onChange, value } }) => (
									<View className="space-y-2">
										<View className="border border-gray-300 rounded-lg">
											<select
												value={value || ""}
												onChange={(e) => {
													const selectedValue = Number(e.target.value);
													onChange(selectedValue);
													// Find the distance object and set its ID for elevation management
													const selectedDistance = distances.find(
														(d) => d.value === selectedValue,
													);
													if (selectedDistance) {
														setSelectedDistanceId(selectedDistance.id);
													}
												}}
												className="w-full p-3 rounded-lg bg-white"
												disabled={loadingDistances}
											>
												<option value="">Select shooting distance</option>
												{distances.map((distance) => (
													<option key={distance.id} value={distance.value}>
														{distance.name} ({distance.value}m)
														{distance.is_premade ? " - Standard" : " - Custom"}
													</option>
												))}
											</select>
										</View>
										{selectedDistanceId && availableElevations.length > 0 && (
											<View className="p-2 bg-green-50 rounded">
												<Text className="text-sm text-green-700">
													✓ {availableElevations.length} preset elevations
													available for this distance
												</Text>
											</View>
										)}
									</View>
								)}
							/>
							{errors.distance && (
								<Text className="text-red-500 text-sm mt-1">
									{errors.distance.message as string}
								</Text>
							)}
						</View>

						{/* Discipline */}
						<View>
							<Text className="text-base font-medium mb-2">Discipline *</Text>
							<Controller
								control={control}
								name="discipline_id"
								render={({ field: { onChange, value } }) => (
									<View className="border border-gray-300 rounded-lg">
										<select
											value={value || ""}
											onChange={(e) => onChange(e.target.value)}
											className="w-full p-3 rounded-lg bg-white"
											disabled={loadingDisciplines}
										>
											<option value="">Select shooting discipline</option>
											{disciplines.map((discipline) => (
												<option key={discipline.id} value={discipline.id}>
													{discipline.name}
												</option>
											))}
										</select>
									</View>
								)}
							/>
							{errors.discipline_id && (
								<Text className="text-red-500 text-sm mt-1">
									{errors.discipline_id.message as string}
								</Text>
							)}
						</View>

						{/* Target Type */}
						<View>
							<Text className="text-base font-medium mb-2">Target Type *</Text>
							<Controller
								control={control}
								name="target_type_id"
								render={({ field: { onChange, value } }) => (
									<View className="border border-gray-300 rounded-lg">
										<select
											value={value || ""}
											onChange={(e) => onChange(e.target.value)}
											className="w-full p-3 rounded-lg bg-white"
											disabled={loadingTargetTypes}
										>
											<option value="">Select target type</option>
											{targetTypes.map((targetType) => (
												<option key={targetType.id} value={targetType.id}>
													{targetType.name}
												</option>
											))}
										</select>
									</View>
								)}
							/>
							{errors.target_type_id && (
								<Text className="text-red-500 text-sm mt-1">
									{errors.target_type_id.message as string}
								</Text>
							)}
						</View>
					</View>

					{/* Advanced Settings */}
					<View className="space-y-4">
						<View className="flex-row items-center">
							<Settings size={20} className="mr-2 text-purple-600" />
							<H3>Advanced Settings</H3>
						</View>

						{/* Elevation */}
						<View>
							<Text className="text-base font-medium mb-2">
								Elevation (Optional)
							</Text>
							<View className="flex-row gap-2 mb-3">
								<Button
									variant={usePresetElevation ? "default" : "outline"}
									size="sm"
									onPress={() => setUsePresetElevation(true)}
									className="flex-1"
								>
									<Text>Preset</Text>
								</Button>
								<Button
									variant={!usePresetElevation ? "default" : "outline"}
									size="sm"
									onPress={() => setUsePresetElevation(false)}
									className="flex-1"
								>
									<Text>Manual</Text>
								</Button>
							</View>

							{usePresetElevation && selectedDistanceId && (
								<View className="mb-2 p-2 bg-blue-50 rounded">
									<Text className="text-sm text-blue-700">
										{availableElevations.length > 0
											? `Using ${availableElevations.length} preset elevations for selected distance`
											: "Using default elevation values (no custom elevations configured)"}
									</Text>
								</View>
							)}

							<Controller
								control={control}
								name="preset_elevation"
								render={({ field: { onChange, value } }) =>
									usePresetElevation ? (
										<View className="border border-gray-300 rounded-lg">
											<select
												value={value || ""}
												onChange={(e) => onChange(e.target.value)}
												className="w-full p-3 rounded-lg bg-white"
												disabled={elevationOptions.length === 0}
											>
												<option value="">Select preset elevation</option>
												{elevationOptions.map((option) => (
													<option key={option.value} value={option.value}>
														{option.label}
													</option>
												))}
											</select>
										</View>
									) : (
										<Input
											placeholder="Enter elevation manually (e.g., 7.5)"
											onChangeText={(text) => onChange(text)}
											value={value?.toString() || ""}
											keyboardType="decimal-pad"
										/>
									)
								}
							/>

							{usePresetElevation && !selectedDistanceId && (
								<Text className="text-sm text-gray-500 mt-1">
									Select a distance first to see available preset elevations
								</Text>
							)}
						</View>

						{/* Windage */}
						<View>
							<Text className="text-base font-medium mb-2">
								Windage (Optional)
							</Text>
							<Controller
								control={control}
								name="windage"
								render={({ field: { onChange, value } }) => (
									<Input
										placeholder="Enter windage value (e.g., 2.0)"
										onChangeText={(text) => onChange(text)}
										value={value?.toString() || ""}
										keyboardType="decimal-pad"
									/>
								)}
							/>
						</View>

						{/* Target Number */}
						<View>
							<Text className="text-base font-medium mb-2">Target Number</Text>
							<Controller
								control={control}
								name="target_number"
								render={({ field: { onChange, value } }) => (
									<Input
										placeholder="Target number (default: 1)"
										onChangeText={(text) => onChange(text)}
										value={value?.toString() || ""}
										keyboardType="number-pad"
									/>
								)}
							/>
						</View>

						{/* Auto Graphing */}
						<View className="flex-row items-center space-x-3">
							<Controller
								control={control}
								name="auto_graphing"
								render={({ field: { onChange, value } }) => (
									<>
										<input
											type="checkbox"
											checked={!!value}
											onChange={(e) => onChange(e.target.checked)}
											className="w-4 h-4"
										/>
										<Text className="flex-1">Enable Auto Graphing</Text>
									</>
								)}
							/>
						</View>

						{/* Date */}
						<View>
							<Text className="text-base font-medium mb-2">Date</Text>
							<Controller
								control={control}
								name="date"
								render={({ field: { onChange, value } }) => (
									<Input
										placeholder="YYYY-MM-DD"
										onChangeText={onChange}
										value={value || ""}
										keyboardType="default"
									/>
								)}
							/>
						</View>
					</View>

					{/* Submit Button */}
					<Button
						onPress={handleSubmit(handleFormSubmit)}
						disabled={!isValid || isLoading}
						className="mt-6 py-4"
					>
						<Text className="text-white font-semibold text-lg">
							{isLoading ? "Creating Target..." : "Create Target"}
						</Text>
					</Button>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
