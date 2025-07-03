import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { View, Modal, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Text } from "@/components/ui/text";
import { TargetButton } from "@/components/ui/target-button";
import { TargetCanvas } from "@/components/target/TargetCanvas";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useSession } from "@/hooks/useSessions";
import {
	useShotPlacements,
	useCreateShotPlacement,
	useClearSessionShots,
} from "@/hooks/useShotPlacements";
import { useTargetTypes } from "@/hooks/useTargetConfig";
import { Save, RotateCcw, Eye } from "lucide-react-native";

function isMobile() {
	return Platform.OS === "ios" || Platform.OS === "android";
}

export default function ShootingSessionScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [shotCount, setShotCount] = useState(0);
	const [resetModalVisible, setResetModalVisible] = useState(false);
	const [resetLoading, setResetLoading] = useState(false);
	const [saveModalVisible, setSaveModalVisible] = useState(false);
	const [showPointsOnTarget, setShowPointsOnTarget] = useState(false);
	const [showScorecardModal, setShowScorecardModal] = useState(false);
	const [showSettingsModal, setShowSettingsModal] = useState(false);

	const { data: session, isLoading: sessionLoading } = useSession(id!);
	const { data: shots, isLoading: shotsLoading } = useShotPlacements(id!);
	const { data: targetTypes, isLoading: targetTypesLoading } = useTargetTypes();
	const createShotMutation = useCreateShotPlacement();
	const clearShotsMutation = useClearSessionShots();

	const handleShotPlaced = async (x: number, y: number) => {
		if (!session) return;

		if (
			typeof x !== "number" ||
			typeof y !== "number" ||
			isNaN(x) ||
			isNaN(y)
		) {
			console.error("[ShotPlacement] Invalid coordinates:", { x, y });
			// Optionally show error UI here
			return;
		}

		console.log("[ShotPlacement] Placing shot at:", { x, y });

		try {
			await createShotMutation.mutateAsync({
				session_id: session.id,
				x_coordinate: x,
				y_coordinate: y,
				shot_number: (shots?.length || 0) + 1,
			});
			setShotCount((prev) => prev + 1);
		} catch (error) {
			// Optionally show error UI here
		}
	};

	const handleSaveSession = () => {
		setSaveModalVisible(true);
	};

	const confirmSaveSession = () => {
		setSaveModalVisible(false);
		router.back();
	};

	const cancelSaveSession = () => {
		setSaveModalVisible(false);
	};

	const handleResetShots = () => {
		setResetModalVisible(true);
	};

	const confirmResetShots = async () => {
		if (!session) return;
		setResetLoading(true);
		try {
			await clearShotsMutation.mutateAsync(session.id);
			setShotCount(0);
			setResetModalVisible(false);
		} catch (error) {
			// Optionally show error UI here
		} finally {
			setResetLoading(false);
		}
	};

	const cancelResetShots = () => {
		setResetModalVisible(false);
	};

	const handleViewSession = () => {
		router.push(`/session/${id}` as any);
	};

	if (sessionLoading || shotsLoading || targetTypesLoading || !session) {
		return (
			<View className="flex-1 justify-center items-center bg-white">
				<Text className="text-gray-500">Loading session...</Text>
			</View>
		);
	}

	// Find the correct TargetType for this session's target
	const targetType = targetTypes?.find(
		(tt) => tt.id === session.target?.target_type_id,
	);
	const zoneDefinitions = targetType?.zone_definitions || [];

	return (
		<>
			{/* Save Session Modal */}
			<Modal
				visible={saveModalVisible}
				transparent
				animationType="fade"
				onRequestClose={cancelSaveSession}
			>
				<View className="flex-1 justify-center items-center bg-black/40">
					<View className="bg-white p-6 rounded-lg w-80 max-w-full items-center">
						<Text className="text-lg font-bold text-gray-900 mb-2">
							Session Complete
						</Text>
						<Text className="text-gray-700 mb-4 text-center">
							You&#39;ve recorded {shots?.length || 0} shots. Save this session?
						</Text>
						<View className="flex-row space-x-3 mt-2">
							<TargetButton variant="secondary" onPress={cancelSaveSession}>
								<Text className="text-gray-700 font-semibold">
									Continue Shooting
								</Text>
							</TargetButton>
							<TargetButton variant="primary" onPress={confirmSaveSession}>
								<Text className="text-white font-semibold">Save & Exit</Text>
							</TargetButton>
						</View>
					</View>
				</View>
			</Modal>

			{/* Reset Shots Modal */}
			<Modal
				visible={resetModalVisible}
				transparent
				animationType="fade"
				onRequestClose={cancelResetShots}
			>
				<View className="flex-1 justify-center items-center bg-black/40">
					<View className="bg-white p-6 rounded-lg w-80 max-w-full items-center">
						<Text className="text-lg font-bold text-gray-900 mb-2">
							Reset Shots
						</Text>
						<Text className="text-gray-700 mb-4 text-center">
							Are you sure you want to clear all shot placements?
						</Text>
						<View className="flex-row space-x-3 mt-2">
							<TargetButton
								variant="secondary"
								onPress={cancelResetShots}
								disabled={resetLoading}
							>
								<Text className="text-gray-700 font-semibold">Cancel</Text>
							</TargetButton>
							<TargetButton
								variant="danger"
								onPress={confirmResetShots}
								disabled={resetLoading}
							>
								<Text className="text-white font-semibold">
									{resetLoading ? "Resetting..." : "Reset"}
								</Text>
							</TargetButton>
						</View>
					</View>
				</View>
			</Modal>

			<View className="flex-1 bg-white">
				{/* Header with Settings Icon */}
				<View className="bg-white px-4 py-3 border-b border-gray-200 flex-row justify-between items-center">
					<View>
						<Text className="text-lg font-bold text-gray-900">
							{session.name}
						</Text>
						<Text className="text-gray-600">
							{session.target?.name} • {session.target?.distance}m
						</Text>
						<Text className="text-blue-600 font-medium">
							Shots: {shots?.length || 0}
						</Text>
					</View>
					<TargetButton
						variant="ghost"
						className="ml-2"
						onPress={() => setShowSettingsModal(true)}
					>
						<Text
							className="text-gray-700"
							style={{ fontSize: 26, fontWeight: "bold" }}
						>
							☰
						</Text>
					</TargetButton>
				</View>

				{/* Settings Modal */}
				<Modal
					visible={showSettingsModal}
					transparent
					animationType="fade"
					onRequestClose={() => setShowSettingsModal(false)}
				>
					<View className="flex-1 justify-center items-center bg-black/40">
						<View className="bg-white p-6 rounded-lg w-80 max-w-full items-center">
							<Text className="text-lg font-bold text-gray-900 mb-4">
								Session Settings
							</Text>
							<View className="flex-row items-center mb-2">
								<Switch
									checked={showPointsOnTarget}
									onCheckedChange={setShowPointsOnTarget}
									className="mr-2"
								/>
								<Text className="text-gray-700">
									Show shot points on target
								</Text>
							</View>
							<TargetButton
								variant="secondary"
								className="mt-4"
								onPress={() => setShowSettingsModal(false)}
							>
								<Text className="text-blue-700 font-semibold">Close</Text>
							</TargetButton>
						</View>
					</View>
				</Modal>

				{/* Target Canvas */}
				<View className="flex-1 justify-center items-center">
					<View
						style={{
							width: "120%",
							aspectRatio: 1,
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<TargetCanvas
							targetImageUrl={session.target?.image_url}
							shots={shots || []}
							onShotPlaced={handleShotPlaced}
							readonly={false}
							showPoints={showPointsOnTarget}
							zoneDefinitions={zoneDefinitions}
						/>
					</View>
				</View>
				{/* Compact Score Summary */}
				<View className="px-4 pb-2 flex-row justify-between items-center">
					<View>
						<Text className="text-base font-semibold text-gray-900 mb-1">
							Last Shot
						</Text>
						{shots && shots.length > 0 ? (
							(() => {
								const shot = shots[shots.length - 1];
								const width = 320;
								const height = 320;
								const cx = (shot.x_coordinate / 100) * width;
								const cy = (shot.y_coordinate / 100) * height;
								let score = 0;
								for (const zone of zoneDefinitions) {
									if (zone.shape === "circle") {
										const centerX = width / 2;
										const centerY = height / 2;
										const dx = cx - centerX;
										const dy = cy - centerY;
										const distance = Math.sqrt(dx * dx + dy * dy);
										const r = (width / 2) * (zone.params.radiusRatio ?? 1);
										if (distance <= r) {
											score = Math.max(score, zone.score_value);
										}
									}
								}
								return (
									<Text className="text-blue-700 font-semibold">
										#{shots.length}: {score} pts
									</Text>
								);
							})()
						) : (
							<Text className="text-gray-400 italic">No shots yet.</Text>
						)}
					</View>
					<View>
						<Text className="text-base font-semibold text-gray-900 mb-1">
							Total
						</Text>
						<Text className="text-green-700 font-bold">
							{shots && shots.length > 0
								? shots.reduce((sum, shot) => {
										const width = 320;
										const height = 320;
										const cx = (shot.x_coordinate / 100) * width;
										const cy = (shot.y_coordinate / 100) * height;
										let score = 0;
										for (const zone of zoneDefinitions) {
											if (zone.shape === "circle") {
												const centerX = width / 2;
												const centerY = height / 2;
												const dx = cx - centerX;
												const dy = cy - centerY;
												const distance = Math.sqrt(dx * dx + dy * dy);
												const r = (width / 2) * (zone.params.radiusRatio ?? 1);
												if (distance <= r) {
													score = Math.max(score, zone.score_value);
												}
											}
										}
										return sum + score;
									}, 0)
								: 0}{" "}
							pts
						</Text>
					</View>
					<TargetButton
						variant="secondary"
						className="ml-2"
						onPress={() => setShowScorecardModal(true)}
					>
						<Text className="text-blue-700 font-semibold">Expand</Text>
					</TargetButton>
				</View>

				{/* Scorecard Modal */}
				<Modal
					visible={showScorecardModal}
					transparent
					animationType="slide"
					onRequestClose={() => setShowScorecardModal(false)}
				>
					<View className="flex-1 justify-end bg-black/40">
						<View className="bg-white rounded-t-2xl p-4 max-h-[70%]">
							<Text className="text-lg font-bold text-gray-900 mb-2">
								Scorecard
							</Text>
							<View className="bg-gray-50 rounded-lg p-2">
								{(shots || []).length === 0 ? (
									<Text className="text-gray-400 italic">No shots yet.</Text>
								) : (
									<>
										{(shots || []).map((shot, idx) => {
											const width = 320;
											const height = 320;
											const cx = (shot.x_coordinate / 100) * width;
											const cy = (shot.y_coordinate / 100) * height;
											let score = 0;
											for (const zone of zoneDefinitions) {
												if (zone.shape === "circle") {
													const centerX = width / 2;
													const centerY = height / 2;
													const dx = cx - centerX;
													const dy = cy - centerY;
													const distance = Math.sqrt(dx * dx + dy * dy);
													const r =
														(width / 2) * (zone.params.radiusRatio ?? 1);
													if (distance <= r) {
														score = Math.max(score, zone.score_value);
													}
												}
											}
											return (
												<View
													key={shot.id}
													className="flex-row justify-between items-center py-1 px-2 border-b border-gray-200 last:border-b-0"
												>
													<Text className="text-gray-700 font-medium">
														#{idx + 1}
													</Text>
													<Text className="text-blue-700 font-semibold">
														{score} pts
													</Text>
												</View>
											);
										})}
										{/* Running total */}
										<View className="flex-row justify-between items-center pt-2 mt-2 border-t border-gray-300">
											<Text className="text-gray-900 font-bold">Total</Text>
											<Text className="text-green-700 font-bold">
												{shots && shots.length > 0
													? shots.reduce((sum, shot) => {
															const width = 320;
															const height = 320;
															const cx = (shot.x_coordinate / 100) * width;
															const cy = (shot.y_coordinate / 100) * height;
															let score = 0;
															for (const zone of zoneDefinitions) {
																if (zone.shape === "circle") {
																	const centerX = width / 2;
																	const centerY = height / 2;
																	const dx = cx - centerX;
																	const dy = cy - centerY;
																	const distance = Math.sqrt(dx * dx + dy * dy);
																	const r =
																		(width / 2) *
																		(zone.params.radiusRatio ?? 1);
																	if (distance <= r) {
																		score = Math.max(score, zone.score_value);
																	}
																}
															}
															return sum + score;
														}, 0)
													: 0}{" "}
												pts
											</Text>
										</View>
									</>
								)}
							</View>
							<TargetButton
								variant="secondary"
								className="mt-4"
								onPress={() => setShowScorecardModal(false)}
							>
								<Text className="text-blue-700 font-semibold">Close</Text>
							</TargetButton>
						</View>
					</View>
				</Modal>

				{/* Controls */}
				<View className="p-4 bg-white border-t border-gray-200">
					<View className="flex-row space-x-3 mb-3">
						<TargetButton
							variant="ghost"
							className="flex-1"
							onPress={handleViewSession}
						>
							<View className="flex-row items-center justify-center">
								<Eye size={18} color="#374151" />
								<Text className="text-gray-700 font-semibold ml-2">View</Text>
							</View>
						</TargetButton>

						<TargetButton
							variant="secondary"
							className="flex-1"
							onPress={handleResetShots}
						>
							<View className="flex-row items-center justify-center">
								<RotateCcw size={18} color="#374151" />
								<Text className="text-gray-700 font-semibold ml-2">Reset</Text>
							</View>
						</TargetButton>
					</View>

					{/* <TargetButton
						variant="primary"
						className="w-full"
						onPress={handleSaveSession}
					>
						<View className="flex-row items-center justify-center">
							<Save size={18} color="white" />
							<Text className="text-white font-semibold ml-2">
								Save Session
							</Text>
						</View>
					</TargetButton> */}
				</View>

				{/* Quick navigation to home */}
				{/* {!isMobile() && (
  <FloatingActionButton icon="home" position="bottom-left" />
)} */}
			</View>
		</>
	);
}
