import React from "react";
import { View } from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
	width?: number | string;
	height?: number;
	className?: string;
}

export function Skeleton({
	width = "100%",
	height = 20,
	className,
}: SkeletonProps) {
	const opacity = useSharedValue(0.3);

	React.useEffect(() => {
		opacity.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
	}, []);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	return (
		<Animated.View
			style={[
				{
					width: width as any,
					height: height as any,
					backgroundColor: "#e5e7eb",
					borderRadius: 8,
				},
				animatedStyle,
			]}
			className={className}
		/>
	);
}

export function SessionCardSkeleton() {
	return (
		<View className="bg-white p-4 rounded-lg border border-gray-200">
			<Skeleton height={20} className="mb-2" />
			<Skeleton height={16} width="60%" />
		</View>
	);
}

export function TargetCardSkeleton() {
	return (
		<View className="bg-white p-4 rounded-lg border border-gray-200">
			<Skeleton height={20} className="mb-2" />
			<Skeleton height={16} width="40%" />
		</View>
	);
}

export function TargetCanvasSkeleton() {
	return (
		<View className="bg-gray-100 border-2 border-gray-300 rounded-lg items-center justify-center">
			<Skeleton width={300} height={300} />
		</View>
	);
}
