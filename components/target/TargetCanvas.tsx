// TargetCanvas.tsx
import React, { useCallback } from "react";
import { Dimensions, Pressable, Platform } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import type { ShotPlacement, TargetZone } from "@/lib/types";

interface TargetCanvasProps {
	targetImageUrl?: string;
	shots: ShotPlacement[];
	onShotPlaced?: (x: number, y: number) => void;
	readonly?: boolean;
	width?: number;
	height?: number;
	showPoints?: boolean;
	zoneDefinitions: TargetZone[];
}

const { width: screenWidth } = Dimensions.get("window");

export function TargetCanvas({
	targetImageUrl,
	shots,
	onShotPlaced,
	readonly = false,
	width = screenWidth - 32,
	height = screenWidth - 32,
	showPoints = false,
	zoneDefinitions,
}: TargetCanvasProps) {
	// Native handler
	const handleCanvasPress = useCallback(
		(event: any) => {
			if (readonly || !onShotPlaced) return;
			const { locationX, locationY } = event.nativeEvent;
			const normalizedX = (locationX / width) * 100;
			const normalizedY = (locationY / height) * 100;
			onShotPlaced(normalizedX, normalizedY);
		},
		[readonly, onShotPlaced, width, height],
	);

	// Web handler
	const handleCanvasClick = useCallback(
		(event: any) => {
			if (readonly || !onShotPlaced) return;
			const rect = event.currentTarget.getBoundingClientRect();
			const offsetX = event.clientX - rect.left;
			const offsetY = event.clientY - rect.top;
			const normalizedX = (offsetX / width) * 100;
			const normalizedY = (offsetY / height) * 100;
			onShotPlaced(normalizedX, normalizedY);
		},
		[readonly, onShotPlaced, width, height],
	);

	// Defensive: fallback if zoneDefinitions is empty or invalid
	const isValidZones =
		Array.isArray(zoneDefinitions) &&
		zoneDefinitions.length > 0 &&
		zoneDefinitions.every(
			(z) =>
				z &&
				z.shape === "circle" &&
				z.params &&
				typeof z.params.radiusRatio === "number",
		);

	// Render target zones dynamically (circles only for now)
	const renderZones = () => {
		// Sort by radiusRatio descending (largest first)
		const sortedZones = [...zoneDefinitions]
			.filter(
				(zone) =>
					zone.shape === "circle" &&
					zone.params &&
					typeof zone.params.radiusRatio === "number",
			)
			.sort((a, b) => b.params.radiusRatio - a.params.radiusRatio);

		const fillColors = ["#fff", "#e5e7eb"]; // alternate white and light gray

		return (
			<>
				{sortedZones.map((zone, idx) => {
					const radiusRatio = zone.params.radiusRatio;
					// Alternate fill color for each ring
					const fill = fillColors[idx % fillColors.length];
					const stroke = "#222"; // dark stroke for visibility
					const strokeWidth = 2;
					return (
						<Circle
							key={zone.label}
							cx={width / 2}
							cy={height / 2}
							r={(width / 2) * radiusRatio}
							fill={fill}
							stroke={stroke}
							strokeWidth={strokeWidth}
						/>
					);
				})}
				{/* Crosshairs */}
				<Line
					x1={width / 2}
					y1={0}
					x2={width / 2}
					y2={height}
					stroke="#9ca3af"
					strokeWidth="1"
					strokeDasharray="5,5"
				/>
				<Line
					x1={0}
					y1={height / 2}
					x2={width}
					y2={height / 2}
					stroke="#9ca3af"
					strokeWidth="1"
					strokeDasharray="5,5"
				/>
			</>
		);
	};

	// Scoring: find the highest scoring zone the shot falls into
	function getShotScore(cx: number, cy: number): number {
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
			// Polygon/rectangle support can be added here
		}
		return score;
	}

	if (!isValidZones) {
		// Fallback UI for invalid or missing zones
		if (Platform.OS === "web") {
			return (
				<div
					style={{
						width,
						height,
						background: "#fef2f2",
						border: "2px solid #fca5a5",
						borderRadius: 12,
						overflow: "hidden",
						position: "relative",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "#b91c1c",
						fontWeight: "bold",
						fontSize: 16,
					}}
					aria-label="Target configuration error"
				>
					Invalid or missing target zones
				</div>
			);
		}
		return (
			<Pressable
				style={{
					width,
					height,
					backgroundColor: "#fef2f2",
					borderColor: "#fca5a5",
					borderWidth: 2,
					borderRadius: 12,
					alignItems: "center",
					justifyContent: "center",
				}}
				accessible={true}
				accessibilityRole="alert"
				accessibilityLabel="Target configuration error"
			>
				<SvgText
					x={width / 2}
					y={height / 2}
					fontSize="16"
					fontWeight="bold"
					fill="#b91c1c"
					textAnchor="middle"
					alignmentBaseline="middle"
				>
					Invalid or missing target zones
				</SvgText>
			</Pressable>
		);
	}

	if (Platform.OS === "web") {
		return (
			<div
				style={{
					width,
					height,
					background: "white",
					border: "2px solid #d1d5db",
					borderRadius: 12,
					overflow: "hidden",
					position: "relative",
					cursor: readonly ? "default" : "pointer",
				}}
				onClick={handleCanvasClick}
				aria-label={`Target canvas with ${shots.length} shots recorded`}
				role="button"
				tabIndex={0}
			>
				<Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
					{renderZones()}
					{shots.map((shot, index) => {
						const cx = (shot.x_coordinate / 100) * width;
						const cy = (shot.y_coordinate / 100) * height;
						const score = getShotScore(cx, cy);
						return (
							<React.Fragment key={shot.id}>
								<Circle
									cx={cx}
									cy={cy}
									r="8"
									fill="#dc2626"
									stroke="#ffffff"
									strokeWidth="2"
								/>
								<SvgText
									x={cx}
									y={cy + 3}
									fontSize="10"
									fontWeight="bold"
									fill="#fff"
									textAnchor="middle"
									alignmentBaseline="middle"
								>
									{index + 1}
								</SvgText>
								{showPoints && (
									<SvgText
										x={cx}
										y={cy + 18}
										fontSize="9"
										fontWeight="bold"
										fill="#374151"
										textAnchor="middle"
										alignmentBaseline="middle"
									>
										{score}
									</SvgText>
								)}
							</React.Fragment>
						);
					})}
				</Svg>
			</div>
		);
	}

	return (
		<Pressable
			style={{ width, height }}
			className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden"
			onPress={handleCanvasPress}
			accessible={true}
			accessibilityRole="button"
			accessibilityLabel={`Target canvas with ${shots.length} shots recorded`}
			accessibilityHint={
				readonly
					? "View target with shots"
					: "Tap to place a shot on the target"
			}
		>
			<Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
				{renderZones()}
				{shots.map((shot, index) => {
					const cx = (shot.x_coordinate / 100) * width;
					const cy = (shot.y_coordinate / 100) * height;
					const score = getShotScore(cx, cy);
					return (
						<React.Fragment key={shot.id}>
							<Circle
								cx={cx}
								cy={cy}
								r="8"
								fill="#dc2626"
								stroke="#ffffff"
								strokeWidth="2"
							/>
							<SvgText
								x={cx}
								y={cy + 3}
								fontSize="10"
								fontWeight="bold"
								fill="#fff"
								textAnchor="middle"
								alignmentBaseline="middle"
							>
								{index + 1}
							</SvgText>
							{showPoints && (
								<SvgText
									x={cx}
									y={cy + 18}
									fontSize="9"
									fontWeight="bold"
									fill="#374151"
									textAnchor="middle"
									alignmentBaseline="middle"
								>
									{score}
								</SvgText>
							)}
						</React.Fragment>
					);
				})}
			</Svg>
		</Pressable>
	);
}
