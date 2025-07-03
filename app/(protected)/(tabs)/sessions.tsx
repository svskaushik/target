import React, { useState } from "react";
import { View, ScrollView, RefreshControl, Modal } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { TargetButton } from "@/components/ui/target-button";
import { Input } from "@/components/ui/input";
import { SessionCardSkeleton } from "@/components/ui/loading-skeleton";
import { Plus, Search, Calendar, Trash2 } from "lucide-react-native";
import { useSessions, useDeleteSession } from "@/hooks/useSessions";
import { useTargetTypes } from "@/hooks/useTargetConfig";

export default function SessionsScreen() {
	const [searchQuery, setSearchQuery] = useState("");
	const { data: sessions, isLoading, refetch } = useSessions();
	const { data: targetTypes = [] } = useTargetTypes();
	const targetTypeMap = React.useMemo(
		() => Object.fromEntries(targetTypes.map((t) => [t.id, t.name])),
		[targetTypes],
	);
	const deleteSessionMutation = useDeleteSession();

	const filteredSessions =
		sessions?.filter(
			(session) =>
				session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				session.target?.name.toLowerCase().includes(searchQuery.toLowerCase()),
		) || [];

	const [deleteModalVisible, setDeleteModalVisible] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const handleDeleteSession = (sessionId: string, sessionName: string) => {
		console.log("[Delete] Button pressed for session:", sessionId, sessionName);
		setPendingDelete({ id: sessionId, name: sessionName });
		setDeleteModalVisible(true);
	};

	const confirmDeleteSession = async () => {
		if (!pendingDelete) return;
		setDeleteLoading(true);
		console.log("[Delete] Confirmed for session:", pendingDelete.id);
		try {
			await deleteSessionMutation.mutateAsync(pendingDelete.id);
			console.log("[Delete] Mutation completed for session:", pendingDelete.id);
			setDeleteModalVisible(false);
			setPendingDelete(null);
			refetch();
		} catch (error: any) {
			console.error("[Delete] Error:", error);
			// Optionally show error UI here
		} finally {
			setDeleteLoading(false);
		}
	};

	const cancelDeleteSession = () => {
		setDeleteModalVisible(false);
		setPendingDelete(null);
	};

	return (
		<View className="flex-1 bg-gray-50">
			{/* Header */}
			<View className="bg-white px-4 py-3 border-b border-gray-200">
				<View className="flex-row justify-between items-center mb-3">
					<Text className="text-xl font-bold text-gray-900">Sessions</Text>
					<TargetButton
						variant="primary"
						size="sm"
						onPress={() => router.push("/session/create" as any)}
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
						placeholder="Search sessions..."
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
				onRequestClose={cancelDeleteSession}
			>
				<View className="flex-1 justify-center items-center bg-black/40">
					<View className="bg-white p-6 rounded-lg w-80 max-w-full items-center">
						<Text className="text-lg font-bold text-gray-900 mb-2">
							Delete Session
						</Text>
						<Text className="text-gray-700 mb-4 text-center">
							Are you sure you want to delete
							{pendingDelete ? ` "${pendingDelete.name}"` : ""}? This will also
							delete all associated shots.
						</Text>
						<View className="flex-row space-x-3 mt-2">
							<TargetButton
								variant="secondary"
								onPress={cancelDeleteSession}
								disabled={deleteLoading}
							>
								<Text className="text-gray-700 font-semibold">Cancel</Text>
							</TargetButton>
							<TargetButton
								variant="danger"
								onPress={confirmDeleteSession}
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
								<SessionCardSkeleton key={index} />
							))}
						</View>
					) : filteredSessions.length > 0 ? (
						<View className="space-y-3">
							{filteredSessions.map((session) => (
								<View
									key={session.id}
									className="bg-white p-4 rounded-lg border border-gray-200"
								>
									<View className="flex-row justify-between items-start">
										<View className="flex-1">
											<TargetButton
												variant="ghost"
												className="items-start justify-start p-0"
												onPress={() =>
													router.push(`/session/${session.id}` as any)
												}
											>
												<Text className="font-semibold text-gray-900 text-lg">
													{session.name}
												</Text>
												<Text className="text-gray-600 text-sm mt-1">
													{new Date(session.date).toLocaleDateString()} •{" "}
													{session.target?.name}
												</Text>
												<Text className="text-gray-500 text-sm">
													{session.target?.distance}m •{" "}
													{targetTypeMap[session.target?.target_type_id] ||
														"Unknown"}
												</Text>
												{session.notes && (
													<Text
														className="text-gray-500 text-sm mt-1"
														numberOfLines={2}
													>
														{session.notes}
													</Text>
												)}
												<Text className="text-gray-400 text-xs mt-1">
													Created{" "}
													{new Date(session.created_at).toLocaleDateString()}
												</Text>
											</TargetButton>
										</View>
										<TargetButton
											variant="ghost"
											size="sm"
											onPress={() =>
												handleDeleteSession(session.id, session.name)
											}
										>
											<Trash2 size={16} color="#dc2626" />
										</TargetButton>
									</View>
								</View>
							))}
						</View>
					) : (
						<View className="bg-white p-8 rounded-lg border border-gray-200 items-center">
							<Calendar size={48} color="#9ca3af" />
							<Text className="text-gray-500 mt-2 text-center">
								{searchQuery ? "No sessions found" : "No sessions yet"}
							</Text>
							<Text className="text-gray-400 text-sm text-center mt-1 mb-4">
								{searchQuery
									? "Try adjusting your search"
									: "Create your first session to get started"}
							</Text>
							{!searchQuery && (
								<TargetButton
									variant="primary"
									onPress={() => router.push("/session/create" as any)}
								>
									<View className="flex-row items-center">
										<Plus size={16} color="white" />
										<Text className="text-white font-semibold ml-2">
											Create Session
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
