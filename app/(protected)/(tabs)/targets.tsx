import React, { useState } from "react";
import { View, ScrollView, RefreshControl, Modal } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { TargetButton } from "@/components/ui/target-button";
import { Input } from "@/components/ui/input";
import { TargetCardSkeleton } from "@/components/ui/loading-skeleton";
import {
	Plus,
	Search,
	Target as TargetIcon,
	Trash2,
} from "lucide-react-native";
import { useTargets, useDeleteTarget } from "@/hooks/useTargets";
import { useTargetTypes } from "@/hooks/useTargetConfig";

export default function TargetsScreen() {
	const [searchQuery, setSearchQuery] = useState("");
	const { data: targets, isLoading, refetch } = useTargets();
	const { data: targetTypes = [] } = useTargetTypes();
	const targetTypeMap = React.useMemo(
		() => Object.fromEntries(targetTypes.map((t) => [t.id, t.name])),
		[targetTypes],
	);
	const deleteTargetMutation = useDeleteTarget();

	const filteredTargets =
		targets?.filter(
			(target) =>
				target.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(targetTypeMap[target.target_type_id]?.toLowerCase() || "").includes(
					searchQuery.toLowerCase(),
				),
		) || [];

	const [deleteModalVisible, setDeleteModalVisible] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const handleDeleteTarget = (targetId: string, targetName: string) => {
		setPendingDelete({ id: targetId, name: targetName });
		setDeleteModalVisible(true);
	};

	const confirmDeleteTarget = async () => {
		if (!pendingDelete) return;
		setDeleteLoading(true);
		try {
			await deleteTargetMutation.mutateAsync(pendingDelete.id);
			setDeleteModalVisible(false);
			setPendingDelete(null);
			refetch();
		} catch (error: any) {
			// Optionally show error UI here
		} finally {
			setDeleteLoading(false);
		}
	};

	const cancelDeleteTarget = () => {
		setDeleteModalVisible(false);
		setPendingDelete(null);
	};

	return (
		<View className="flex-1 bg-gray-50">
			{/* Header */}
			<View className="bg-white px-4 py-3 border-b border-gray-200">
				<View className="flex-row justify-between items-center mb-3">
					<Text className="text-xl font-bold text-gray-900">Targets</Text>
					<TargetButton
						variant="primary"
						size="sm"
						onPress={() => router.push("/target/create")}
					>
						<View className="flex-row items-center">
							<Plus size={16} color="white" />
							<Text className="text-white font-semibold ml-1">New</Text>
						</View>
					</TargetButton>
				</View>

				{/* Search */}
				<View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
					<Search size={20} color="#6b7280" />
					<Input
						placeholder="Search targets..."
						value={searchQuery}
						onChangeText={setSearchQuery}
						className="flex-1 ml-2 bg-transparent border-0"
					/>
				</View>
			</View>

			{/* Delete Confirmation Modal */}
			<Modal
				visible={deleteModalVisible}
				transparent
				animationType="fade"
				onRequestClose={cancelDeleteTarget}
			>
				<View className="flex-1 justify-center items-center bg-black/40">
					<View className="bg-white p-6 rounded-lg w-80 max-w-full items-center">
						<Text className="text-lg font-bold text-gray-900 mb-2">
							Delete Target
						</Text>
						<Text className="text-gray-700 mb-4 text-center">
							Are you sure you want to delete
							{pendingDelete ? ` "${pendingDelete.name}"` : ""}? This will also
							delete all associated sessions and shots.
						</Text>
						<View className="flex-row space-x-3 mt-2">
							<TargetButton
								variant="secondary"
								onPress={cancelDeleteTarget}
								disabled={deleteLoading}
							>
								<Text className="text-gray-700 font-semibold">Cancel</Text>
							</TargetButton>
							<TargetButton
								variant="danger"
								onPress={confirmDeleteTarget}
								disabled={deleteLoading}
							>
								<Text className="text-white font-semibold">
									{deleteLoading ? "Deleting..." : "Delete"}
								</Text>
							</TargetButton>
						</View>
					</View>
				</View>
			</Modal>

			<ScrollView
				className="flex-1"
				refreshControl={
					<RefreshControl refreshing={isLoading} onRefresh={refetch} />
				}
			>
				<View className="p-4">
					{isLoading ? (
						<View className="space-y-3">
							{Array.from({ length: 3 }).map((_, index) => (
								<TargetCardSkeleton key={index} />
							))}
						</View>
					) : filteredTargets.length > 0 ? (
						<View className="space-y-3">
							{filteredTargets.map((target) => (
								<View
									key={target.id}
									className="bg-white p-4 rounded-lg border border-gray-200"
								>
									<View className="flex-row justify-between items-start">
										<View className="flex-1">
											<TargetButton
												variant="ghost"
												className="items-start justify-start p-0"
												onPress={() => router.push(`/target/${target.id}`)}
											>
												<Text className="font-semibold text-gray-900 text-lg">
													{target.name}
												</Text>
												<Text className="text-gray-600 text-sm mt-1">
													{target.distance}m •{" "}
													{targetTypeMap[target.target_type_id] || "Unknown"}
												</Text>
												<Text className="text-gray-400 text-xs mt-1">
													Created{" "}
													{new Date(target.created_at).toLocaleDateString()}
												</Text>
											</TargetButton>
										</View>
										<TargetButton
											variant="ghost"
											size="sm"
											onPress={() => handleDeleteTarget(target.id, target.name)}
										>
											<Trash2 size={16} color="#dc2626" />
										</TargetButton>
									</View>
								</View>
							))}
						</View>
					) : (
						<View className="bg-white p-8 rounded-lg border border-gray-200 items-center">
							<TargetIcon size={48} color="#9ca3af" />
							<Text className="text-gray-500 mt-2 text-center">
								{searchQuery ? "No targets found" : "No targets yet"}
							</Text>
							<Text className="text-gray-400 text-sm text-center mt-1 mb-4">
								{searchQuery
									? "Try adjusting your search"
									: "Create your first target to get started"}
							</Text>
							{!searchQuery && (
								<TargetButton
									variant="primary"
									onPress={() => router.push("/target/create")}
								>
									<View className="flex-row items-center">
										<Plus size={16} color="white" />
										<Text className="text-white font-semibold ml-2">
											Create Target
										</Text>
									</View>
								</TargetButton>
							)}
						</View>
					)}
				</View>
			</ScrollView>
		</View>
	);
}
