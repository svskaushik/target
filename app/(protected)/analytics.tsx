import React from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { H1, H2, Muted } from "@/components/ui/typography";
import {
	BarChart3,
	TrendingUp,
	Target,
	Calendar,
	Trophy,
	Activity,
	ArrowLeft,
	Zap,
} from "lucide-react-native";
import { useSessions } from "@/hooks/useSessions";
import { useTargets } from "@/hooks/useTargets";
import { useTotalShots } from "@/hooks/useShotPlacements";
import {
	useAnalytics,
	usePerformanceTrend,
	useRecentSessions,
} from "@/hooks/useAnalytics";

interface StatCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: React.ReactNode;
	trend?: {
		value: string;
		isPositive: boolean;
	};
}

function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
	return (
		<View className="bg-card p-4 rounded-lg border border-border">
			<View className="flex-row items-center justify-between mb-2">
				<View className="flex-row items-center gap-2">
					{icon}
					<Text className="text-sm text-muted-foreground">{title}</Text>
				</View>
				{trend && (
					<View
						className={`flex-row items-center gap-1 ${
							trend.isPositive ? "text-green-600" : "text-red-600"
						}`}
					>
						<TrendingUp
							size={12}
							className={trend.isPositive ? "text-green-600" : "text-red-600"}
						/>
						<Text
							className={`text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
						>
							{trend.value}
						</Text>
					</View>
				)}
			</View>
			<Text className="text-2xl font-bold mb-1">{value}</Text>
			{subtitle && (
				<Text className="text-xs text-muted-foreground">{subtitle}</Text>
			)}
		</View>
	);
}

interface PerformanceChartProps {
	data: Array<{ date: string; score: number; maxScore: number }>;
}

function PerformanceChart({ data }: PerformanceChartProps) {
	const screenWidth = Dimensions.get("window").width;
	const chartWidth = screenWidth - 32; // Account for padding

	if (data.length === 0) {
		return (
			<View className="bg-card p-6 rounded-lg border border-border">
				<H2 className="mb-4">Performance Trend</H2>
				<View className="items-center justify-center py-8">
					<BarChart3 size={48} className="text-muted-foreground mb-4" />
					<Text className="text-muted-foreground text-center">
						No session data available yet.{"\n"}
						Complete some shooting sessions to see your progress!
					</Text>
				</View>
			</View>
		);
	}

	return (
		<View className="bg-card p-4 rounded-lg border border-border">
			<H2 className="mb-4">Performance Trend</H2>
			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				<View
					className="flex-row items-end gap-2"
					style={{ width: Math.max(chartWidth, data.length * 40) }}
				>
					{data.map((item, index) => {
						const percentage = (item.score / item.maxScore) * 100;
						const barHeight = Math.max(percentage * 1.5, 10); // Min height of 10

						return (
							<View key={index} className="items-center gap-2">
								<View
									className="bg-primary rounded-t"
									style={{
										width: 24,
										height: barHeight,
										minHeight: 10,
									}}
								/>
								<Text className="text-xs text-muted-foreground transform -rotate-45 w-8">
									{item.date}
								</Text>
							</View>
						);
					})}
				</View>
			</ScrollView>
		</View>
	);
}

export default function Analytics() {
	const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
	const { data: performanceTrend = [], isLoading: trendLoading } =
		usePerformanceTrend(30);
	const { data: recentSessions = [], isLoading: sessionsLoading } =
		useRecentSessions(5);

	// Fallback to basic data if analytics hook fails
	const { data: sessions = [] } = useSessions();
	const { data: targets = [] } = useTargets();
	const { data: totalShots = 0 } = useTotalShots();

	// Use analytics data if available, otherwise calculate basic metrics
	const totalSessions = analytics?.totalSessions ?? sessions.length;
	const totalTargets = analytics?.totalTargets ?? targets.length;
	const averageScore = analytics?.averageScore?.toFixed(1) ?? "0";
	const bestScore = analytics?.bestScore ?? 0;
	const accuracyRate = analytics?.accuracyRate?.toFixed(1) ?? "0";
	const hasImprovement = analytics?.improvementTrend
		? analytics.improvementTrend > 0
		: false;

	return (
		<ScrollView className="flex-1 bg-background">
			<View className="p-4">
				{/* Header */}
				<View className="flex-row items-center gap-3 mb-6">
					<Button
						variant="ghost"
						size="sm"
						onPress={() => router.back()}
						className="p-2"
					>
						<ArrowLeft size={20} className="text-foreground" />
					</Button>
					<H1>Analytics & Performance</H1>
				</View>

				{/* Overview Stats */}
				<View className="mb-6">
					<H2 className="mb-4">Overview</H2>
					<View className="grid grid-cols-2 gap-3 mb-4">
						<StatCard
							title="Total Sessions"
							value={totalSessions}
							subtitle="Shooting sessions completed"
							icon={<Calendar size={16} className="text-primary" />}
							trend={
								totalSessions > 0
									? { value: "+1 this week", isPositive: true }
									: undefined
							}
						/>
						<StatCard
							title="Total Targets"
							value={totalTargets}
							subtitle="Targets created"
							icon={<Target size={16} className="text-primary" />}
						/>
					</View>
					<View className="grid grid-cols-2 gap-3">
						<StatCard
							title="Total Shots"
							value={totalShots}
							subtitle="Shots fired"
							icon={<Zap size={16} className="text-primary" />}
						/>
						<StatCard
							title="Best Score"
							value={bestScore}
							subtitle="Personal best"
							icon={<Trophy size={16} className="text-primary" />}
							trend={
								hasImprovement
									? { value: "Improving!", isPositive: true }
									: undefined
							}
						/>
					</View>
				</View>

				{/* Performance Metrics */}
				<View className="mb-6">
					<H2 className="mb-4">Performance Metrics</H2>
					<View className="bg-card p-4 rounded-lg border border-border mb-4">
						<View className="flex-row items-center justify-between mb-3">
							<Text className="font-medium">Average Score</Text>
							<Activity size={16} className="text-primary" />
						</View>
						<Text className="text-3xl font-bold mb-1">{averageScore}</Text>
						<Text className="text-sm text-muted-foreground">
							Across {totalTargets} targets
						</Text>
					</View>

					<View className="bg-card p-4 rounded-lg border border-border">
						<View className="flex-row items-center justify-between mb-3">
							<Text className="font-medium">Accuracy Rate</Text>
							<Target size={16} className="text-primary" />
						</View>
						<Text className="text-3xl font-bold mb-1">{accuracyRate}%</Text>
						<Text className="text-sm text-muted-foreground">
							Based on average performance
						</Text>
					</View>
				</View>

				{/* Performance Chart */}
				<PerformanceChart data={performanceTrend} />

				{/* Recent Activity */}
				<View className="mt-6">
					<H2 className="mb-4">Recent Activity</H2>
					{recentSessions.length === 0 ? (
						<View className="bg-card p-6 rounded-lg border border-border">
							<View className="items-center justify-center">
								<Activity size={48} className="text-muted-foreground mb-4" />
								<Text className="text-muted-foreground text-center mb-4">
									No sessions recorded yet.{"\n"}
									Start shooting to track your progress!
								</Text>
								<Button
									variant="outline"
									onPress={() => router.push("/(protected)/(tabs)/sessions")}
								>
									<Text>Create First Session</Text>
								</Button>
							</View>
						</View>
					) : (
						<View className="space-y-3">
							{recentSessions.map((session) => (
								<View
									key={session.id}
									className="bg-card p-4 rounded-lg border border-border"
								>
									<View className="flex-row items-center justify-between">
										<View>
											<Text className="font-medium">{session.name}</Text>
											<Text className="text-sm text-muted-foreground">
												{new Date(session.date).toLocaleDateString()}
											</Text>
										</View>
										<View className="items-end">
											<Text className="font-bold">{session.total_score}</Text>
											<Text className="text-xs text-muted-foreground">
												{session.target_count} targets • {session.shot_count}{" "}
												shots
											</Text>
										</View>
									</View>
								</View>
							))}
						</View>
					)}
				</View>

				{/* Action Buttons */}
				<View className="mt-8 space-y-3">
					<Button
						variant="outline"
						onPress={() => router.push("/(protected)/(tabs)/sessions")}
						className="w-full"
					>
						<Text>View All Sessions</Text>
					</Button>
					<Button
						variant="outline"
						onPress={() => router.push("/(protected)/(tabs)/targets")}
						className="w-full"
					>
						<Text>View All Targets</Text>
					</Button>
				</View>
			</View>
		</ScrollView>
	);
}
