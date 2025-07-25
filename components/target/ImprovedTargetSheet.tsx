import React, { useState, useRef } from "react";
import { View, ScrollView, Alert, Modal, TextInput } from "react-native";
import {
	PanGestureHandler,
	PinchGestureHandler,
	State,
} from "react-native-gesture-handler";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	useAnimatedGestureHandler,
} from "react-native-reanimated";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { useToast } from "@/components/ui/toast";

import {
	Target,
	Minus,
	Plus,
	RotateCcw,
	Check,
	X,
	ArrowLeft,
	ArrowRight,
	HelpCircle,
	ZoomIn,
	ZoomOut,
} from "lucide-react-native";

interface Shot {
	id: string;
	x: number;
	y: number;
	score: number;
	elevation: number;
	windage: number;
	timestamp: Date;
	call?: "good" | "bad" | "pulled_left" | "pulled_right" | "unknown";
}

interface ImprovedTargetSheetProps {
	targetId: string;
	targetName: string;
	targetType: any;
	initialElevation?: number;
	initialWindage?: number;
}

export function ImprovedTargetSheet({
	targetId,
	targetName,
	targetType,
	initialElevation = 0,
	initialWindage = 0,
}: ImprovedTargetSheetProps) {
	const { showToast } = useToast();

	// State management
	const [shots, setShots] = useState<Shot[]>([]);
	const [currentElevation, setCurrentElevation] = useState(initialElevation);
	const [currentWindage, setCurrentWindage] = useState(initialWindage);
	const [showElevationInput, setShowElevationInput] = useState(false);
	const [showWindageInput, setShowWindageInput] = useState(false);
	const [elevationInputValue, setElevationInputValue] = useState(
		currentElevation.toString(),
	);
	const [windageInputValue, setWindageInputValue] = useState(
		currentWindage.toString(),
	);
	const [canCallShot, setCanCallShot] = useState(false);
	const [lastShotId, setLastShotId] = useState<string | null>(null);

	// Zoom and pan state
	const scale = useSharedValue(1);
	const translateX = useSharedValue(0);
	const translateY = useSharedValue(0);

	// Gesture handlers
	const pinchHandler = useAnimatedGestureHandler({
		onActive: (event) => {
			scale.value = Math.max(0.5, Math.min(3, event.scale));
		},
	});

	const panHandler = useAnimatedGestureHandler({
		onActive: (event) => {
			translateX.value = event.translationX;
			translateY.value = event.translationY;
		},
	});

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ scale: scale.value },
				{ translateX: translateX.value },
				{ translateY: translateY.value },
			],
		};
	});

	// Calculate score based on shot position
	const calculateScore = (x: number, y: number): number => {
		const centerX = 0.5;
		const centerY = 0.5;
		const distance = Math.sqrt(
			Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
		);

		// Simple scoring based on distance from center
		if (distance <= 0.05) return 10;
		if (distance <= 0.1) return 9;
		if (distance <= 0.15) return 8;
		if (distance <= 0.2) return 7;
		if (distance <= 0.25) return 6;
		if (distance <= 0.3) return 5;
		if (distance <= 0.35) return 4;
		if (distance <= 0.4) return 3;
		if (distance <= 0.45) return 2;
		if (distance <= 0.5) return 1;
		return 0;
	};

	// Handle shot placement
	const handleShotPlacement = (x: number, y: number) => {
		const score = calculateScore(x, y);
		const shotId = Date.now().toString();

		const newShot: Shot = {
			id: shotId,
			x,
			y,
			score,
			elevation: currentElevation,
			windage: currentWindage,
			timestamp: new Date(),
		};

		setShots((prev) => [...prev, newShot]);
		setCanCallShot(true);
		setLastShotId(shotId);

		showToast({
			type: "success",
			title: "Shot Placed",
			description: `Score: ${score} points`,
		});
	};

	// Remove last shot
	const removeLastShot = () => {
		if (shots.length === 0) return;

		Alert.alert(
			"Remove Last Shot",
			"Are you sure you want to remove the most recent shot?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Remove",
					style: "destructive",
					onPress: () => {
						setShots((prev) => prev.slice(0, -1));
						setCanCallShot(false);
						setLastShotId(null);
						showToast({
							type: "info",
							title: "Shot Removed",
							description: "Last shot has been removed from the target.",
						});
					},
				},
			],
		);
	};

	// Adjust elevation
	const adjustElevation = (increment: number) => {
		const newElevation = currentElevation + increment;
		setCurrentElevation(newElevation);
		showToast({
			type: "info",
			title: "Elevation Adjusted",
			description: `New elevation: ${newElevation}`,
		});
	};

	// Adjust windage
	const adjustWindage = (increment: number) => {
		const newWindage = currentWindage + increment;
		setCurrentWindage(newWindage);
		showToast({
			type: "info",
			title: "Windage Adjusted",
			description: `New windage: ${newWindage}`,
		});
	};

	// Set elevation from input
	const setElevationFromInput = () => {
		const value = parseFloat(elevationInputValue);
		if (!isNaN(value)) {
			setCurrentElevation(value);
			setShowElevationInput(false);
			showToast({
				type: "success",
				title: "Elevation Set",
				description: `Elevation set to ${value}`,
			});
		}
	};

	// Set windage from input
	const setWindageFromInput = () => {
		const value = parseFloat(windageInputValue);
		if (!isNaN(value)) {
			setCurrentWindage(value);
			setShowWindageInput(false);
			showToast({
				type: "success",
				title: "Windage Set",
				description: `Windage set to ${value}`,
			});
		}
	};

	// Call shot
	const callShot = (call: Shot["call"]) => {
		if (!canCallShot || !lastShotId) return;

		setShots((prev) =>
			prev.map((shot) => (shot.id === lastShotId ? { ...shot, call } : shot)),
		);
		setCanCallShot(false);
		setLastShotId(null);

		showToast({
			type: "info",
			title: "Shot Called",
			description: `Shot marked as ${call?.replace("_", " ")}`,
		});
	};

	// Calculate total score
	const totalScore = shots.reduce((sum, shot) => sum + shot.score, 0);

	// Zoom controls
	const zoomIn = () => {
		scale.value = Math.min(3, scale.value * 1.2);
	};

	const zoomOut = () => {
		scale.value = Math.max(0.5, scale.value / 1.2);
	};

	const resetZoom = () => {
		scale.value = 1;
		translateX.value = 0;
		translateY.value = 0;
	};

	return (
		<ScrollView className="flex-1 bg-background">
			{/* Header */}
			<View className="p-4 bg-card border-b border-border">
				<H1 className="text-xl font-bold">{targetName}</H1>
				<Muted>
					Shots: {shots.length} | Total Score: {totalScore}
				</Muted>
			</View>

			{/* Controls */}
			<View className="p-4 space-y-4">
				{/* Windage and Elevation Controls */}
				<View className="flex-row space-x-4">
					{/* Windage */}
					<View className="flex-1 bg-card p-4 rounded-lg border border-border">
						<H2 className="text-lg font-semibold mb-2">
							Windage: {currentWindage}
						</H2>
						<View className="flex-row space-x-2">
							<Button
								variant="outline"
								size="sm"
								onPress={() => adjustWindage(-0.25)}
							>
								<ArrowLeft size={16} />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onPress={() => adjustWindage(-1)}
							>
								<Text>-1</Text>
							</Button>
							<Button
								variant="outline"
								size="sm"
								onPress={() => {
									setWindageInputValue(currentWindage.toString());
									setShowWindageInput(true);
								}}
							>
								<Text>{currentWindage}</Text>
							</Button>
							<Button
								variant="outline"
								size="sm"
								onPress={() => adjustWindage(1)}
							>
								<Text>+1</Text>
							</Button>
							<Button
								variant="outline"
								size="sm"
								onPress={() => adjustWindage(0.25)}
							>
								<ArrowRight size={16} />
							</Button>
						</View>
					</View>

					{/* Elevation */}
					<View className="flex-1 bg-card p-4 rounded-lg border border-border">
						<H2 className="text-lg font-semibold mb-2">
							Elevation: {currentElevation}
						</H2>
						<View className="flex-row space-x-2">
							<Button
								variant="outline"
								size="sm"
								onPress={() => adjustElevation(-0.25)}
							>
								<Minus size={16} />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onPress={() => adjustElevation(-1)}
							>
								<Text>-1</Text>
							</Button>
							<Button
								variant="outline"
								size="sm"
								onPress={() => {
									setElevationInputValue(currentElevation.toString());
									setShowElevationInput(true);
								}}
							>
								<Text>{currentElevation}</Text>
							</Button>
							<Button
								variant="outline"
								size="sm"
								onPress={() => adjustElevation(1)}
							>
								<Text>+1</Text>
							</Button>
							<Button
								variant="outline"
								size="sm"
								onPress={() => adjustElevation(0.25)}
							>
								<Plus size={16} />
							</Button>
						</View>
					</View>
				</View>

				{/* Zoom Controls */}
				<View className="flex-row space-x-2">
					<Button variant="outline" size="sm" onPress={zoomOut}>
						<ZoomOut size={16} />
					</Button>
					<Button variant="outline" size="sm" onPress={resetZoom}>
						<Text>Reset</Text>
					</Button>
					<Button variant="outline" size="sm" onPress={zoomIn}>
						<ZoomIn size={16} />
					</Button>
				</View>

				{/* Shot Controls */}
				<View className="flex-row space-x-2">
					<Button
						variant="destructive"
						size="sm"
						onPress={removeLastShot}
						disabled={shots.length === 0}
					>
						<RotateCcw size={16} />
						<Text className="ml-1">Remove Last Shot</Text>
					</Button>
				</View>

				{/* Shot Call Buttons */}
				{canCallShot && (
					<View className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
						<Text className="font-semibold mb-2">Call your shot:</Text>
						<View className="flex-row space-x-2">
							<Button
								size="sm"
								variant="outline"
								onPress={() => callShot("good")}
							>
								<Check size={16} className="text-green-600" />
							</Button>
							<Button
								size="sm"
								variant="outline"
								onPress={() => callShot("bad")}
							>
								<X size={16} className="text-red-600" />
							</Button>
							<Button
								size="sm"
								variant="outline"
								onPress={() => callShot("pulled_left")}
							>
								<ArrowLeft size={16} className="text-blue-600" />
							</Button>
							<Button
								size="sm"
								variant="outline"
								onPress={() => callShot("pulled_right")}
							>
								<ArrowRight size={16} className="text-blue-600" />
							</Button>
							<Button
								size="sm"
								variant="outline"
								onPress={() => callShot("unknown")}
							>
								<HelpCircle size={16} className="text-gray-600" />
							</Button>
						</View>
					</View>
				)}
			</View>

			{/* Target Canvas */}
			<View className="flex-1 p-4">
				<PinchGestureHandler onGestureEvent={pinchHandler}>
					<Animated.View>
						<PanGestureHandler onGestureEvent={panHandler}>
							<Animated.View style={animatedStyle}>
								<View
									className="w-80 h-80 bg-white border-2 border-gray-300 rounded-full mx-auto relative"
									onTouchEnd={(event) => {
										const { locationX, locationY } = event.nativeEvent;
										const x = locationX / 320; // Normalize to 0-1
										const y = locationY / 320; // Normalize to 0-1
										handleShotPlacement(x, y);
									}}
								>
									{/* Target rings */}
									{[0.1, 0.2, 0.3, 0.4, 0.5].map((radius, index) => (
										<View
											key={index}
											className="absolute border border-gray-400 rounded-full"
											style={{
												width: `${radius * 200}%`,
												height: `${radius * 200}%`,
												left: `${50 - radius * 100}%`,
												top: `${50 - radius * 100}%`,
											}}
										/>
									))}

									{/* Center dot */}
									<View className="absolute w-2 h-2 bg-black rounded-full left-1/2 top-1/2 transform -translate-x-1 -translate-y-1" />

									{/* Shot markers */}
									{shots.map((shot, index) => (
										<View
											key={shot.id}
											className="absolute w-3 h-3 bg-red-500 rounded-full border border-white"
											style={{
												left: `${shot.x * 100}%`,
												top: `${shot.y * 100}%`,
												transform: [{ translateX: -6 }, { translateY: -6 }],
											}}
										>
											<Text className="absolute -top-6 -left-2 text-xs font-bold text-red-600">
												{index + 1}
											</Text>
										</View>
									))}
								</View>
							</Animated.View>
						</PanGestureHandler>
					</Animated.View>
				</PinchGestureHandler>
			</View>

			{/* Score Sheet */}
			<View className="p-4 bg-card border-t border-border">
				<H2 className="text-lg font-semibold mb-4">Score Sheet</H2>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<View className="flex-row space-x-2">
						{shots.map((shot, index) => (
							<View
								key={shot.id}
								className="bg-white p-2 rounded border border-border min-w-16"
							>
								<Text className="text-center font-bold">{index + 1}</Text>
								<Text className="text-center text-lg font-bold">
									{shot.score}
								</Text>
								{shot.call && (
									<Text className="text-center text-xs text-gray-500">
										{shot.call.replace("_", " ")}
									</Text>
								)}
							</View>
						))}
					</View>
				</ScrollView>
				<View className="mt-4 p-4 bg-primary/10 rounded-lg">
					<Text className="text-center text-xl font-bold">
						Total Score: {totalScore}
					</Text>
				</View>
			</View>

			{/* Elevation Input Modal */}
			<Modal visible={showElevationInput} transparent animationType="slide">
				<View className="flex-1 justify-center items-center bg-black/50">
					<View className="bg-white p-6 rounded-lg w-80">
						<H2 className="text-lg font-semibold mb-4">Set Elevation</H2>
						<TextInput
							value={elevationInputValue}
							onChangeText={setElevationInputValue}
							keyboardType="numeric"
							className="border border-gray-300 p-3 rounded mb-4"
							placeholder="Enter elevation value"
						/>
						<View className="flex-row space-x-2">
							<Button
								variant="outline"
								onPress={() => setShowElevationInput(false)}
								className="flex-1"
							>
								<Text>Cancel</Text>
							</Button>
							<Button onPress={setElevationFromInput} className="flex-1">
								<Text>Set</Text>
							</Button>
						</View>
					</View>
				</View>
			</Modal>

			{/* Windage Input Modal */}
			<Modal visible={showWindageInput} transparent animationType="slide">
				<View className="flex-1 justify-center items-center bg-black/50">
					<View className="bg-white p-6 rounded-lg w-80">
						<H2 className="text-lg font-semibold mb-4">Set Windage</H2>
						<TextInput
							value={windageInputValue}
							onChangeText={setWindageInputValue}
							keyboardType="numeric"
							className="border border-gray-300 p-3 rounded mb-4"
							placeholder="Enter windage value"
						/>
						<View className="flex-row space-x-2">
							<Button
								variant="outline"
								onPress={() => setShowWindageInput(false)}
								className="flex-1"
							>
								<Text>Cancel</Text>
							</Button>
							<Button onPress={setWindageFromInput} className="flex-1">
								<Text>Set</Text>
							</Button>
						</View>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
}
