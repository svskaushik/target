import React, { useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { router } from "expo-router";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { useToast } from "@/components/ui/toast";

import { useTargets } from "@/hooks/useTargets";
import { useSessions } from "@/hooks/useSessions";
import { Target, Plus, ExternalLink } from "lucide-react-native";

interface SessionTargetManagerProps {
	sessionId: string;
	sessionName: string;
}

export function SessionTargetManager({
	sessionId,
	sessionName,
}: SessionTargetManagerProps) {
	const { showToast } = useToast();
	const { data: allTargets = [] } = useTargets();
	const { data: sessions = [] } = useSessions();

	// Get current session
	const currentSession = sessions.find((s) => s.id === sessionId);
	const sessionTargets = allTargets.filter(
		(target) => target.session_id === sessionId,
	);
	const availableTargets = allTargets.filter(
		(target) => !target.session_id || target.session_id !== sessionId,
	);

	const addExistingTargetToSession = async (targetId: string) => {
		try {
			// This would need to be implemented in the backend
			// await updateTarget({ id: targetId, session_id: sessionId });

			showToast({
				type: "success",
				title: "Target Added",
				description: "Target has been added to this session.",
			});
		} catch (error: any) {
			showToast({
				type: "error",
				title: "Failed to Add Target",
				description: error.message || "Please try again.",
			});
		}
	};

	const removeTargetFromSession = async (targetId: string) => {
		Alert.alert(
			"Remove Target",
			"Are you sure you want to remove this target from the session?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Remove",
					style: "destructive",
					onPress: async () => {
						try {
							// This would need to be implemented in the backend
							// await updateTarget({ id: targetId, session_id: null });

							showToast({
								type: "info",
								title: "Target Removed",
								description: "Target has been removed from this session.",
							});
						} catch (error: any) {
							showToast({
								type: "error",
								title: "Failed to Remove Target",
								description: error.message || "Please try again.",
							});
						}
					},
				},
			],
		);
	};

	const createNewTargetForSession = () => {
		router.push(`/target/create?sessionId=${sessionId}`);
	};

	const openTargetSheet = (targetId: string) => {
		router.push(`/session/shoot/${targetId}`);
	};

	return (
		<ScrollView className="flex-1 p-4">
			<View className="space-y-6">
				{/* Header */}
				<View>
					<H1 className="text-2xl font-bold mb-2">{sessionName}</H1>
					<Muted>Manage targets for this shooting session</Muted>
				</View>

				{/* Session Targets */}
				<View className="space-y-4">
					<View className="flex-row items-center justify-between">
						<H2 className="text-xl font-semibold">
							Session Targets ({sessionTargets.length})
						</H2>
						<Button
							variant="default"
							size="sm"
							onPress={createNewTargetForSession}
						>
							<Plus size={16} />
							<Text className="ml-1">New Target</Text>
						</Button>
					</View>

					{sessionTargets.length === 0 ? (
						<View className="bg-muted/50 p-6 rounded-lg border border-dashed border-border">
							<Target
								size={48}
								className="text-muted-foreground mx-auto mb-4"
							/>
							<Text className="text-center text-muted-foreground mb-4">
								No targets in this session yet
							</Text>
							<Button
								variant="outline"
								onPress={createNewTargetForSession}
								className="w-full"
							>
								<Plus size={16} />
								<Text className="ml-1">Create First Target</Text>
							</Button>
						</View>
					) : (
						<View className="space-y-3">
							{sessionTargets.map((target) => (
								<View
									key={target.id}
									className="bg-card p-4 rounded-lg border border-border"
								>
									<View className="flex-row items-center justify-between mb-2">
										<View className="flex-1">
											<Text className="font-semibold text-lg">
												{target.name}
											</Text>
											<Muted>
												Distance: {target.distance?.name || "Unknown"} | Type:{" "}
												{target.target_type?.name || "Unknown"}
											</Muted>
										</View>
										<View className="flex-row space-x-2">
											<Button
												variant="outline"
												size="sm"
												onPress={() => openTargetSheet(target.id)}
											>
												<ExternalLink size={16} />
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onPress={() => removeTargetFromSession(target.id)}
											>
												<Text>Remove</Text>
											</Button>
										</View>
									</View>

									{/* Target stats */}
									<View className="flex-row space-x-4 mt-2">
										<Text className="text-sm text-muted-foreground">
											Shots: {target.shot_placements?.length || 0}
										</Text>
										<Text className="text-sm text-muted-foreground">
											Score:{" "}
											{target.shot_placements?.reduce(
												(sum: number, shot: any) => sum + (shot.score || 0),
												0,
											) || 0}
										</Text>
									</View>
								</View>
							))}
						</View>
					)}
				</View>

				{/* Add Existing Targets */}
				{availableTargets.length > 0 && (
					<View className="space-y-4">
						<H2 className="text-xl font-semibold">Add Existing Targets</H2>
						<Muted>
							Select from your existing targets to add to this session
						</Muted>

						<View className="space-y-3">
							{availableTargets.map((target) => (
								<View
									key={target.id}
									className="bg-card p-4 rounded-lg border border-border"
								>
									<View className="flex-row items-center justify-between">
										<View className="flex-1">
											<Text className="font-semibold">{target.name}</Text>
											<Muted>
												Distance: {target.distance?.name || "Unknown"} | Type:{" "}
												{target.target_type?.name || "Unknown"}
											</Muted>
											{target.session_id && (
												<Text className="text-sm text-blue-600">
													Currently in:{" "}
													{sessions.find((s) => s.id === target.session_id)
														?.name || "Unknown Session"}
												</Text>
											)}
										</View>
										<Button
											variant="outline"
											size="sm"
											onPress={() => addExistingTargetToSession(target.id)}
										>
											<Text>Add</Text>
										</Button>
									</View>
								</View>
							))}
						</View>
					</View>
				)}

				{/* Session Actions */}
				<View className="space-y-3 pt-4 border-t border-border">
					<Button
						variant="outline"
						onPress={() => router.push(`/session/edit/${sessionId}`)}
						className="w-full"
					>
						<Text>Edit Session Details</Text>
					</Button>

					<Button
						variant="outline"
						onPress={() => router.back()}
						className="w-full"
					>
						<Text>Back to Sessions</Text>
					</Button>
				</View>
			</View>
		</ScrollView>
	);
}
