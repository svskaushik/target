import React from "react";
import { View, Alert } from "react-native";
import { router } from "expo-router";
import { TargetForm } from "@/components/forms/TargetForm";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useCreateTarget } from "@/hooks/useTargets";
import type { CreateTargetData } from "@/lib/types";

export default function CreateTargetScreen() {
	const createTargetMutation = useCreateTarget();

	const handleSubmit = async (data: CreateTargetData) => {
		try {
			const newTarget = await createTargetMutation.mutateAsync(data);
			router.replace(`/target/${newTarget.id}`);
		} catch (error) {
			Alert.alert("Error", "Failed to create target. Please try again.");
		}
	};

	return (
		<View className="flex-1 bg-white">
			<TargetForm
				onSubmit={handleSubmit}
				isLoading={createTargetMutation.isPending}
			/>

			{/* Quick navigation to home */}
			<FloatingActionButton icon="home" position="bottom-right" />
		</View>
	);
}
