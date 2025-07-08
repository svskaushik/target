import React, { useState } from "react";
import {
	Alert,
	View,
	Modal,
	Platform,
	Vibration,
	ScrollView,
} from "react-native";
import { Switch } from "@/components/ui/switch";
import { useLocalSearchParams, router } from "expo-router";
import { Text } from "@/components/ui/text";
import { TargetButton } from "@/components/ui/target-button";
import { TargetCanvas } from "@/components/target/TargetCanvas";
import { useSession } from "@/hooks/useSessions";
import {
	useShotPlacements,
	useCreateShotPlacement,
	useClearSessionShots,
	useUpdateShotPlacement,
	useDeleteShotPlacement,
} from "@/hooks/useShotPlacements";
import type { ShotPlacement } from "@/lib/types";
import { useTargetTypes } from "@/hooks/useTargetConfig";
import { RotateCcw, Eye } from "lucide-react-native";

const SHOT_STATUS_OPTIONS = [
	{ value: "good", label: "Good", icon: "✔️" },
	{ value: "bad", label: "Bad", icon: "❌" },
	{ value: "pulled_left", label: "Pulled Left", icon: "⬅️" },
	{ value: "pulled_right", label: "Pulled Right", icon: "➡️" },
	{ value: "unknown", label: "Unknown", icon: "❓" },
];

export default function ShootingSessionScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [resetModalVisible, setResetModalVisible] = useState(false);
	const [resetLoading, setResetLoading] = useState(false);
	const [saveModalVisible, setSaveModalVisible] = useState(false);
	const [showPointsOnTarget, setShowPointsOnTarget] = useState(false);
	const [showScorecardModal, setShowScorecardModal] = useState(false);
	const [showSettingsModal, setShowSettingsModal] = useState(false);
	const [windage, setWindage] = useState(0);
	const [elevation, setElevation] = useState(0);
	const [showWindageNumpad, setShowWindageNumpad] = useState(false);
	const [showElevationNumpad, setShowElevationNumpad] = useState(false);
	const [pendingWindage, setPendingWindage] = useState(0);
	const [pendingElevation, setPendingElevation] = useState(0);
	const [editShot, setEditShot] = useState<ShotPlacement | null>(null);
	const [showEditShotModal, setShowEditShotModal] = useState(false);
	const [editWindage, setEditWindage] = useState(0);
	const [editElevation, setEditElevation] = useState(0);
	const [editStatus, setEditStatus] = useState<ShotPlacement["status"]>("good");
	const [showEditWarning, setShowEditWarning] = useState(false);
	const [removeLoading, setRemoveLoading] = useState(false);
	const [zoom, setZoom] = useState(1);

	// Undo/Redo history stack for shots
	const [history, setHistory] = useState<ShotPlacement[][]>([]);
	const [future, setFuture] = useState<ShotPlacement[][]>([]);

	const { data: session, isLoading: sessionLoading } = useSession(id!);
	const {
		data: shots,
		isLoading: shotsLoading,
		refetch: refetchShots,
	} = useShotPlacements(id!);
	const { data: targetTypes, isLoading: targetTypesLoading } = useTargetTypes();
	const createShotMutation = useCreateShotPlacement();
	const clearShotsMutation = useClearSessionShots();
	const updateShotMutation = useUpdateShotPlacement();
	const deleteShotMutation = useDeleteShotPlacement();

	const handleShotPlaced = async (x: number, y: number) => {
		if (!session) return;
		if (
			typeof x !== "number" ||
			typeof y !== "number" ||
			isNaN(x) ||
			isNaN(y)
		) {
			Alert.alert("Invalid coordinates", "Please tap within the target area.");
			return;
		}
		try {
			// Save current shots to history for undo
			setHistory((prev) => [...prev, shots ? [...shots] : []]);
			setFuture([]);
			// Optimistic UI: update immediately
			if (Platform.OS !== "web") Vibration.vibrate(30);
			await createShotMutation.mutateAsync({
				session_id: session.id,
				x_coordinate: x,
				y_coordinate: y,
				shot_number: (shots?.length || 0) + 1,
				windage,
				elevation,
				status: "good",
			});
			refetchShots();
			Alert.alert("Shot placed", "Your shot was recorded.");
		} catch {
			Alert.alert("Error", "Failed to place shot. Please try again.");
		}
	};

	const handleEditShot = (shot: ShotPlacement) => {
		setEditShot(shot);
		setEditWindage(shot.windage ?? 0);
		setEditElevation(shot.elevation ?? 0);
		setEditStatus(shot.status ?? "good");
		setShowEditWarning(true);
	};

	const confirmEditWarning = () => {
		setShowEditWarning(false);
		setShowEditShotModal(true);
	};

	const cancelEditWarning = () => {
		setShowEditWarning(false);
		setEditShot(null);
	};

	const handleEditShotSave = async () => {
		if (!editShot) return;
		try {
			await updateShotMutation.mutateAsync({
				id: editShot.id,
				updates: {
					windage: editWindage,
					elevation: editElevation,
					status: editStatus,
				},
			});
			Alert.alert("Shot updated", "The shot was updated successfully.");
			setShowEditShotModal(false);
			setEditShot(null);
		} catch {
			Alert.alert("Error", "Failed to update shot. Please try again.");
		}
	};

	const handleRemoveShot = async (shot: ShotPlacement) => {
		setRemoveLoading(true);
		try {
			// Save current shots to history for undo
			setHistory((prev) => [...prev, shots ? [...shots] : []]);
			setFuture([]);
			if (Platform.OS !== "web") Vibration.vibrate(30);
			await deleteShotMutation.mutateAsync(shot.id);
			refetchShots();
			Alert.alert("Shot removed", "The shot was removed.");
			setEditShot(null);
			setShowEditShotModal(false);
		} catch {
			Alert.alert("Error", "Failed to remove shot. Please try again.");
		} finally {
			setRemoveLoading(false);
		}
	};

	// Undo/Redo handlers
	const handleUndo = async () => {
		if (history.length === 0) return;
		const prevShots = history[history.length - 1];
		setHistory((h) => h.slice(0, h.length - 1));
		setFuture((f) => [shots ? [...shots] : [], ...f]);
		// Remove all current shots, then re-add prevShots
		if (shots && shots.length > 0) {
			for (const shot of shots) {
				await deleteShotMutation.mutateAsync(shot.id);
			}
		}
		for (const shot of prevShots) {
			// Re-create each shot (could be optimized)
			await createShotMutation.mutateAsync({
				session_id: shot.session_id,
				x_coordinate: shot.x_coordinate,
				y_coordinate: shot.y_coordinate,
				shot_number: shot.shot_number,
				windage: shot.windage,
				elevation: shot.elevation,
				status: shot.status,
			});
		}
		refetchShots();
		if (Platform.OS !== "web") Vibration.vibrate(50);
	};

	const handleRedo = async () => {
		if (future.length === 0) return;
		const nextShots = future[0];
		setFuture((f) => f.slice(1));
		setHistory((h) => [...h, shots ? [...shots] : []]);
		// Remove all current shots, then re-add nextShots
		if (shots && shots.length > 0) {
			for (const shot of shots) {
				await deleteShotMutation.mutateAsync(shot.id);
			}
		}
		for (const shot of nextShots) {
			await createShotMutation.mutateAsync({
				session_id: shot.session_id,
				x_coordinate: shot.x_coordinate,
				y_coordinate: shot.y_coordinate,
				shot_number: shot.shot_number,
				windage: shot.windage,
				elevation: shot.elevation,
				status: shot.status,
			});
		}
		refetchShots();
		if (Platform.OS !== "web") Vibration.vibrate(50);
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
			Alert.alert("Shots reset", "All shots have been cleared.");
			setResetModalVisible(false);
		} catch {
			Alert.alert("Error", "Failed to reset shots. Please try again.");
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

	const targetType = targetTypes?.find(
		(tt) => tt.id === session.target?.target_type_id,
	);
	const zoneDefinitions = targetType?.zone_definitions || [];

	return (
		<>
			{/* Edit Shot Warning Modal */}
			<Modal
				visible={showEditWarning}
				transparent
				animationType="fade"
				onRequestClose={cancelEditWarning}
			>
				<View className="flex-1 justify-center items-center bg-black/40">
					<View className="bg-white p-6 rounded-lg w-80 max-w-full items-center">
						<Text className="text-lg font-bold text-gray-900 mb-2">
							Edit Previous Shot
						</Text>
						<Text className="text-gray-700 mb-4 text-center">
							Editing a previous shot may affect your session statistics. Are
							you sure you want to continue?
						</Text>
						<View className="flex-row space-x-3 mt-2">
							<TargetButton variant="secondary" onPress={cancelEditWarning}>
								<Text className="text-gray-700 font-semibold">Cancel</Text>
							</TargetButton>
							<TargetButton variant="danger" onPress={confirmEditWarning}>
								<Text className="text-white font-semibold">Edit</Text>
							</TargetButton>
						</View>
					</View>
				</View>
			</Modal>

			{/* Edit Shot Modal */}
			<Modal
				visible={showEditShotModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowEditShotModal(false)}
			>
				<View className="flex-1 justify-center items-center bg-black/40">
					<View className="bg-white p-6 rounded-lg w-80 max-w-full items-center">
						<Text className="text-lg font-bold text-gray-900 mb-2">
							Edit Shot
						</Text>
						<Text className="text-gray-700 mb-4 text-center">
							Adjust windage, elevation, or status for this shot.
						</Text>
						<View className="mb-2 w-full">
							<Text className="font-semibold mb-1">Windage</Text>
							<View className="flex-row items-center justify-center">
								<TargetButton
									variant="secondary"
									onPress={() => setEditWindage((w) => w - 1)}
								>
									<Text>-</Text>
								</TargetButton>
								<Text className="mx-3 text-xl">
									{(editWindage / 4).toFixed(2)}
								</Text>
								<TargetButton
									variant="secondary"
									onPress={() => setEditWindage((w) => w + 1)}
								>
									<Text>+</Text>
								</TargetButton>
							</View>
						</View>
						<View className="mb-2 w-full">
							<Text className="font-semibold mb-1">Elevation</Text>
							<View className="flex-row items-center justify-center">
								<TargetButton
									variant="secondary"
									onPress={() => setEditElevation((e) => e - 1)}
								>
									<Text>-</Text>
								</TargetButton>
								<Text className="mx-3 text-xl">
									{(editElevation / 4).toFixed(2)}
								</Text>
								<TargetButton
									variant="secondary"
									onPress={() => setEditElevation((e) => e + 1)}
								>
									<Text>+</Text>
								</TargetButton>
							</View>
						</View>
						<View className="mb-2 w-full">
							<Text className="font-semibold mb-1">Status</Text>
							<View className="flex-row flex-wrap justify-center">
								{SHOT_STATUS_OPTIONS.map((opt) => {
									const isLastShot =
										editShot &&
										shots &&
										shots.length > 0 &&
										editShot.id === shots[shots.length - 1].id;
									return (
										<TargetButton
											key={opt.value}
											variant={
												editStatus === opt.value ? "primary" : "secondary"
											}
											onPress={() => {
												if (isLastShot)
													setEditStatus(opt.value as ShotPlacement["status"]);
											}}
											disabled={!isLastShot}
											className="m-1"
										>
											<Text>
												{opt.icon} {opt.label}
											</Text>
										</TargetButton>
									);
								})}
							</View>
							{editShot &&
								shots &&
								shots.length > 0 &&
								editShot.id !== shots[shots.length - 1].id && (
									<Text className="text-xs text-gray-500 text-center mt-1">
										Status can only be changed for the most recent shot.
									</Text>
								)}
						</View>
						<View className="flex-row space-x-3 mt-4">
							<TargetButton
								variant="secondary"
								onPress={() => setShowEditShotModal(false)}
							>
								<Text className="text-gray-700 font-semibold">Cancel</Text>
							</TargetButton>
							<TargetButton variant="primary" onPress={handleEditShotSave}>
								<Text className="text-white font-semibold">Save</Text>
							</TargetButton>
							<TargetButton
								variant="danger"
								onPress={() => {
									if (editShot) handleRemoveShot(editShot);
								}}
								disabled={removeLoading}
							>
								<Text className="text-white font-semibold">
									{removeLoading ? "Removing..." : "Remove"}
								</Text>
							</TargetButton>
						</View>
					</View>
				</View>
			</Modal>

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

				{/* Target Canvas with Zoom Controls at Top and Scrollable Canvas */}
				<View
					className="flex-1 bg-blue-50 pt-2"
					style={{ position: "relative" }}
				>
					{/* Zoom Controls at the Top */}
					<View
						className="flex-row space-x-2 mb-3 z-10 bg-white/80 rounded-lg px-3 py-2 shadow"
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							alignSelf: "center",
							justifyContent: "center",
						}}
						accessibilityRole="adjustable"
						accessibilityLabel="Zoom controls for target"
						accessible
					>
						<TargetButton
							variant="secondary"
							onPress={() => setZoom((z) => Math.max(0.5, z - 0.1))}
							accessibilityLabel="Zoom out"
							accessibilityHint="Decreases the size of the target"
							testID="zoom-out-btn"
						>
							<Text style={{ fontSize: 20 }} accessibilityLabel="Zoom out">
								-
							</Text>
						</TargetButton>
						<Text
							className="mx-2 font-semibold text-base"
							accessibilityLabel={`Current zoom: ${(zoom * 100).toFixed(0)} percent`}
						>
							{(zoom * 100).toFixed(0)}%
						</Text>
						<TargetButton
							variant="secondary"
							onPress={() => setZoom((z) => Math.min(3, z + 0.1))}
							accessibilityLabel="Zoom in"
							accessibilityHint="Increases the size of the target"
							testID="zoom-in-btn"
						>
							<Text style={{ fontSize: 20 }} accessibilityLabel="Zoom in">
								+
							</Text>
						</TargetButton>
					</View>
					{/* Scrollable Target Canvas */}
					<View
						style={{
							flex: 1,
							width: "100%",
							justifyContent: "center",
							alignItems: "center",
							paddingTop: 56,
						}}
					>
						<ScrollView
							horizontal
							contentContainerStyle={{
								flexGrow: 1,
								justifyContent: "center",
								alignItems: "center",
							}}
							style={{ width: "100%", height: "100%" }}
						>
							<ScrollView
								contentContainerStyle={{
									justifyContent: "center",
									alignItems: "center",
								}}
								style={{ width: "100%", height: "100%" }}
							>
								<View
									style={{
										width: 320 * zoom,
										height: 320 * zoom,
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
										width={320 * zoom}
										height={320 * zoom}
									/>
								</View>
							</ScrollView>
						</ScrollView>
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
									<View className="flex-row items-center">
										<Text className="text-blue-700 font-semibold">
											{score} pts
										</Text>
										<Text className="text-xs text-gray-500 ml-2">
											W:{(shot.windage ?? 0) / 4} E:{(shot.elevation ?? 0) / 4}
										</Text>
										<Text className="text-xs ml-2">
											{SHOT_STATUS_OPTIONS.find(
												(opt) => opt.value === shot.status,
											)?.icon || ""}
										</Text>
									</View>
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
										{(shots || []).map((shot: ShotPlacement, idx: number) => {
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
													<Text
														className="text-gray-700 font-medium"
														onPress={() => handleEditShot(shot)}
													>
														#{idx + 1}
													</Text>
													<Text className="text-blue-700 font-semibold">
														{score} pts
													</Text>
													<Text className="text-xs text-gray-500 ml-2">
														W:{(shot.windage ?? 0) / 4} E:
														{(shot.elevation ?? 0) / 4}
													</Text>
													<Text className="text-xs ml-2">
														{SHOT_STATUS_OPTIONS.find(
															(opt) => opt.value === shot.status,
														)?.icon || ""}
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

				{/* Windage/Elevation Controls */}
				<View className="flex-row justify-between items-center mb-3">
					<View className="items-center flex-1">
						<Text className="font-semibold mb-1">Windage</Text>
						<View className="flex-row items-center">
							<TargetButton
								variant="secondary"
								onPress={() => setWindage((w) => w - 1)}
							>
								<Text className="text-lg">◀</Text>
							</TargetButton>
							<TargetButton
								variant="ghost"
								onPress={() => setShowWindageNumpad(true)}
							>
								<Text className="text-xl mx-2">{(windage / 4).toFixed(2)}</Text>
							</TargetButton>
							<TargetButton
								variant="secondary"
								onPress={() => setWindage((w) => w + 1)}
							>
								<Text className="text-lg">▶</Text>
							</TargetButton>
						</View>
					</View>
					<View className="items-center flex-1">
						<Text className="font-semibold mb-1">Elevation</Text>
						<View className="flex-row items-center">
							<TargetButton
								variant="secondary"
								onPress={() => setElevation((e) => e - 1)}
							>
								<Text className="text-lg">▼</Text>
							</TargetButton>
							<TargetButton
								variant="ghost"
								onPress={() => setShowElevationNumpad(true)}
							>
								<Text className="text-xl mx-2">
									{(elevation / 4).toFixed(2)}
								</Text>
							</TargetButton>
							<TargetButton
								variant="secondary"
								onPress={() => setElevation((e) => e + 1)}
							>
								<Text className="text-lg">▲</Text>
							</TargetButton>
						</View>
					</View>
				</View>

				{/* Numpad Modals for Windage/Elevation */}
				<Modal
					visible={showWindageNumpad}
					transparent
					animationType="fade"
					onRequestClose={() => setShowWindageNumpad(false)}
				>
					<View className="flex-1 justify-center items-center bg-black/40">
						<View className="bg-white p-6 rounded-lg w-72 max-w-full items-center">
							<Text className="text-lg font-bold mb-2">
								Set Windage (1/4 units)
							</Text>
							<View className="flex-row mb-4">
								<TargetButton
									variant="secondary"
									onPress={() => setPendingWindage((w) => w - 1)}
								>
									<Text>-</Text>
								</TargetButton>
								<Text className="text-2xl mx-4">
									{(pendingWindage / 4).toFixed(2)}
								</Text>
								<TargetButton
									variant="secondary"
									onPress={() => setPendingWindage((w) => w + 1)}
								>
									<Text>+</Text>
								</TargetButton>
							</View>
							<View className="flex-row space-x-3">
								<TargetButton
									variant="secondary"
									onPress={() => setShowWindageNumpad(false)}
								>
									<Text>Cancel</Text>
								</TargetButton>
								<TargetButton
									variant="primary"
									onPress={() => {
										setWindage(pendingWindage);
										setShowWindageNumpad(false);
									}}
								>
									<Text>Set</Text>
								</TargetButton>
							</View>
						</View>
					</View>
				</Modal>
				<Modal
					visible={showElevationNumpad}
					transparent
					animationType="fade"
					onRequestClose={() => setShowElevationNumpad(false)}
				>
					<View className="flex-1 justify-center items-center bg-black/40">
						<View className="bg-white p-6 rounded-lg w-72 max-w-full items-center">
							<Text className="text-lg font-bold mb-2">
								Set Elevation (1/4 units)
							</Text>
							<View className="flex-row mb-4">
								<TargetButton
									variant="secondary"
									onPress={() => setPendingElevation((e) => e - 1)}
								>
									<Text>-</Text>
								</TargetButton>
								<Text className="text-2xl mx-4">
									{(pendingElevation / 4).toFixed(2)}
								</Text>
								<TargetButton
									variant="secondary"
									onPress={() => setPendingElevation((e) => e + 1)}
								>
									<Text>+</Text>
								</TargetButton>
							</View>
							<View className="flex-row space-x-3">
								<TargetButton
									variant="secondary"
									onPress={() => setShowElevationNumpad(false)}
								>
									<Text>Cancel</Text>
								</TargetButton>
								<TargetButton
									variant="primary"
									onPress={() => {
										setElevation(pendingElevation);
										setShowElevationNumpad(false);
									}}
								>
									<Text>Set</Text>
								</TargetButton>
							</View>
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
						<TargetButton
							variant="danger"
							className="flex-1"
							onPress={() => {
								if (shots && shots.length > 0)
									handleRemoveShot(shots[shots.length - 1]);
							}}
							disabled={!shots || shots.length === 0 || removeLoading}
						>
							<View className="flex-row items-center justify-center">
								<Text className="text-white font-semibold ml-2">
									Remove Last
								</Text>
							</View>
						</TargetButton>
						<TargetButton
							variant="secondary"
							className="flex-1"
							onPress={handleUndo}
							disabled={history.length === 0}
						>
							<Text className="text-gray-700 font-semibold ml-2">Undo</Text>
						</TargetButton>
						<TargetButton
							variant="secondary"
							className="flex-1"
							onPress={handleRedo}
							disabled={future.length === 0}
						>
							<Text className="text-gray-700 font-semibold ml-2">Redo</Text>
						</TargetButton>
					</View>
				</View>
			</View>
		</>
	);
}
