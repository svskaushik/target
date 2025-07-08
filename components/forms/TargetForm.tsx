import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { CreateTargetData } from "@/lib/types";
import {
	useFilteredDisciplines,
	useTargetTypes,
} from "@/hooks/useTargetConfig";
// Example preset values for elevation and windage
const ELEVATION_PRESETS = [0, 5, 10, 15, 20];
const WINDAGE_PRESETS = [0, 2, 4, 6, 8];

const targetSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name must be less than 50 characters"),
	distance: z
		.number()
		.min(1, "Distance must be positive")
		.max(1000, "Distance must be reasonable"),
	discipline_id: z.string().min(1, "Please select a discipline"),
	target_type_id: z.string().min(1, "Please select a target type"),
	image_url: z.string().url().optional().or(z.literal("")),
	date: z.string().optional(),
	session_id: z.string().optional(),
	preset_elevation: z.number().optional(),
	windage: z.number().optional(),
	auto_graphing: z.boolean().optional(),
	target_number: z.number().optional(),
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
	const {
		control,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<any>({
		resolver: zodResolver(targetSchema),
		defaultValues: {
			name: initialData?.name || "",
			distance: initialData?.distance || 0,
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

				<View>
					<Text className="text-base font-semibold mb-2 text-gray-900">
						Distance (meters)
					</Text>
					<Controller
						control={control}
						name="distance"
						render={({ field: { onChange, onBlur, value } }) => (
							<Input
								placeholder="Enter distance"
								onBlur={onBlur}
								onChangeText={(text) => onChange(parseFloat(text) || 0)}
								value={value?.toString()}
								keyboardType="numeric"
								className={
									errors.distance ? "border-red-500" : "border-gray-300"
								}
							/>
						)}
					/>
					{errors.distance && typeof errors.distance.message === "string" && (
						<Text className="text-red-500 text-sm mt-1">
							{errors.distance.message}
						</Text>
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
							<View className="flex-row space-x-2">
								<select
									value={value}
									onChange={(e) => onChange(e.target.value)}
									className="border rounded px-2 py-1 flex-1"
									disabled={loadingDisciplines}
								>
									<option value="">Select discipline</option>
									{disciplines.map((d) => (
										<option key={d.id} value={d.id}>
											{d.name}
										</option>
									))}
								</select>
							</View>
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
							<View className="flex-row space-x-2">
								<select
									value={value}
									onChange={(e) => onChange(e.target.value)}
									className="border rounded px-2 py-1 flex-1"
									disabled={loadingTargetTypes}
								>
									<option value="">Select target type</option>
									{targetTypes.map((t) => (
										<option key={t.id} value={t.id}>
											{t.name}
										</option>
									))}
								</select>
							</View>
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
					<View className="flex-row items-center mb-2 space-x-4">
						<label className="flex-row items-center">
							<input
								type="radio"
								checked={usePresetElevation}
								onChange={() => setUsePresetElevation(true)}
							/>
							<Text className="ml-1">Preset</Text>
						</label>
						<label className="flex-row items-center">
							<input
								type="radio"
								checked={!usePresetElevation}
								onChange={() => setUsePresetElevation(false)}
							/>
							<Text className="ml-1">Manual</Text>
						</label>
					</View>
					<Controller
						control={control}
						name="preset_elevation"
						render={({ field: { onChange, value } }) =>
							usePresetElevation ? (
								<select
									value={value ?? ""}
									onChange={(e) => onChange(Number(e.target.value))}
									className="border rounded px-2 py-1"
								>
									<option value="">Select preset</option>
									{ELEVATION_PRESETS.map((preset) => (
										<option key={preset} value={preset}>
											{preset}
										</option>
									))}
								</select>
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
				</View>

				{/* Windage with toggle */}
				<View>
					<Text className="text-base font-semibold mb-2 text-gray-900">
						Windage (Optional)
					</Text>
					<View className="flex-row items-center mb-2 space-x-4">
						<label className="flex-row items-center">
							<input
								type="radio"
								checked={usePresetWindage}
								onChange={() => setUsePresetWindage(true)}
							/>
							<Text className="ml-1">Preset</Text>
						</label>
						<label className="flex-row items-center">
							<input
								type="radio"
								checked={!usePresetWindage}
								onChange={() => setUsePresetWindage(false)}
							/>
							<Text className="ml-1">Manual</Text>
						</label>
					</View>
					<Controller
						control={control}
						name="windage"
						render={({ field: { onChange, value } }) =>
							usePresetWindage ? (
								<select
									value={value ?? ""}
									onChange={(e) => onChange(Number(e.target.value))}
									className="border rounded px-2 py-1"
								>
									<option value="">Select preset</option>
									{WINDAGE_PRESETS.map((preset) => (
										<option key={preset} value={preset}>
											{preset}
										</option>
									))}
								</select>
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
