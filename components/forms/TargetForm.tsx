import React from "react";
import { View, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { CreateTargetData } from "@/lib/types";
import { useDisciplines, useTargetTypes } from "@/hooks/useTargetConfig";

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
		},
		mode: "onChange",
	});

	const { data: disciplines = [], isLoading: loadingDisciplines } =
		useDisciplines();
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
					{errors.name && (
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
					{errors.distance && (
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
					{errors.discipline_id && (
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
					{errors.target_type_id && (
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
					{errors.image_url && (
						<Text className="text-red-500 text-sm mt-1">
							{errors.image_url.message}
						</Text>
					)}
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
