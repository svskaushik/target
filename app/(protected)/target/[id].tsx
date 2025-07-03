import React from "react";
import { View, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Text } from "@/components/ui/text";
import { TargetButton } from "@/components/ui/target-button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useTarget, useDeleteTarget } from "@/hooks/useTargets";
import { useTargetTypes } from "@/hooks/useTargetConfig";
import { useSessions } from "@/hooks/useSessions";
import {
	Edit3,
	Trash2,
	Plus,
	Target as TargetIcon,
	Home,
} from "lucide-react-native";

export default function TargetDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: target, isLoading: targetLoading } = useTarget(id!);
	const { data: targetTypes = [] } = useTargetTypes();
	const targetTypeMap = React.useMemo(
		() => Object.fromEntries(targetTypes.map((t) => [t.id, t.name])),
		[targetTypes],
	);
	const { data: sessions } = useSessions();
	const deleteTargetMutation = useDeleteTarget();

	// Filter sessions for this target
	const targetSessions =
		sessions?.filter((session) => session.target_id === id) || [];

	const handleDeleteTarget = () => {
		if (!target) return;

		Alert.alert(
			"Delete Target",
			`Are you sure you want to delete "${target.name}"? This will also delete all associated sessions and shots.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await deleteTargetMutation.mutateAsync(target.id);
							Alert.alert("Success", "Target deleted successfully!", [
								{ text: "OK", onPress: () => router.back() },
							]);
						} catch (error) {
							Alert.alert(
								"Error",
								"Failed to delete target. Please try again.",
							);
						}
					},
				},
			],
		);
	};

	if (targetLoading || !target) {
		return (
			<View className="flex-1 justify-center items-center bg-white">
				<Text className="text-gray-500">Loading target...</Text>
			</View>
		);
	}

	return (
		<ScrollView className="flex-1 bg-gray-50">
			{/* Breadcrumb Navigation */}
			<Breadcrumb
				items={[
					{ label: "Home", href: "/" },
					{ label: "Targets", href: "/targets" },
					{ label: target.name },
				]}
			/>

			{/* Header */}
			<View className="bg-white p-4 border-b border-gray-200">
				<View className="flex-row justify-between items-start">
					<View className="flex-1">
						<Text className="text-2xl font-bold text-gray-900 mb-2">
							{target.name}
						</Text>
						<View className="flex-row items-center space-x-4">
							<Text className="text-gray-600">
								Distance: {target.distance}m
							</Text>
							<Text className="text-gray-600">
								Type: {targetTypeMap[target.target_type_id] || "Unknown"}
							</Text>
						</View>
						<Text className="text-gray-400 text-sm mt-2">
							Created {new Date(target.created_at).toLocaleDateString()}
						</Text>
					</View>
					<View className="flex-row space-x-2">
						<TargetButton
							variant="secondary"
							size="sm"
							onPress={() => router.push(`/target/edit/${target.id}` as any)}
						>
							<Edit3 size={16} color="#374151" />
						</TargetButton>
						<TargetButton
							variant="danger"
							size="sm"
							onPress={handleDeleteTarget}
						>
							<Trash2 size={16} color="white" />
						</TargetButton>
					</View>
				</View>
			</View>

			{/* Target Image */}
			{target.image_url && (
				<View className="bg-white p-4 border-b border-gray-200">
					<Text className="text-lg font-semibold text-gray-900 mb-2">
						Target Image
					</Text>
					{/* We'll implement image display later */}
					<View className="bg-gray-100 h-48 rounded-lg items-center justify-center">
						<TargetIcon size={48} color="#9ca3af" />
						<Text className="text-gray-500 mt-2">Image Preview</Text>
					</View>
				</View>
			)}

			{/* Sessions */}
			<View className="p-4">
				<View className="flex-row justify-between items-center mb-4">
					<Text className="text-lg font-semibold text-gray-900">
						Sessions ({targetSessions.length})
					</Text>
					<TargetButton
						variant="primary"
						size="sm"
						onPress={() =>
							router.push(`/session/create?targetId=${target.id}` as any)
						}
					>
						<View className="flex-row items-center">
							<Plus size={16} color="white" />
							<Text className="text-white font-semibold ml-1">New Session</Text>
						</View>
					</TargetButton>
				</View>

				{targetSessions.length > 0 ? (
					<View className="space-y-3">
						{targetSessions.map((session) => (
							<View
								key={session.id}
								className="bg-white p-4 rounded-lg border border-gray-200"
							>
								<TargetButton
									variant="ghost"
									className="items-start justify-start p-0"
									onPress={() => router.push(`/session/${session.id}` as any)}
								>
									<Text className="font-semibold text-gray-900 text-lg">
										{session.name}
									</Text>
									<Text className="text-gray-600 text-sm mt-1">
										{new Date(session.date).toLocaleDateString()}
									</Text>
									{session.notes && (
										<Text
											className="text-gray-500 text-sm mt-1"
											numberOfLines={2}
										>
											{session.notes}
										</Text>
									)}
								</TargetButton>
							</View>
						))}
					</View>
				) : (
					<View className="bg-white p-8 rounded-lg border border-gray-200 items-center">
						<Text className="text-gray-500 mt-2 text-center">
							No sessions yet
						</Text>
						<Text className="text-gray-400 text-sm text-center mt-1 mb-4">
							Create your first session with this target
						</Text>
						<TargetButton
							variant="primary"
							onPress={() =>
								router.push(`/session/create?targetId=${target.id}` as any)
							}
						>
							<View className="flex-row items-center">
								<Plus size={16} color="white" />
								<Text className="text-white font-semibold ml-2">
									Create Session
								</Text>
							</View>
						</TargetButton>
					</View>
				)}
			</View>

			{/* Quick Navigation */}
			<View className="p-4">
				<TouchableOpacity
					onPress={() => router.push("/")}
					className="bg-white p-4 rounded-lg shadow-md flex-row items-center justify-center"
				>
					<Home size={20} color="#4B5563" />
					<Text className="text-gray-900 font-semibold ml-2">Back to Home</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}
