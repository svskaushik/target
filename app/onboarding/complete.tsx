import React, { useEffect } from "react";
import { View, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import {
	CheckCircle,
	Target,
	Calendar,
	BarChart3,
	Settings,
} from "lucide-react-native";

interface QuickActionProps {
	icon: React.ComponentType<any>;
	title: string;
	description: string;
	action: () => void;
	variant?: "primary" | "secondary";
}

function QuickAction({
	icon: Icon,
	title,
	description,
	action,
	variant = "secondary",
}: QuickActionProps) {
	return (
		<Button
			variant="ghost"
			onPress={action}
			className={`w-full p-0 h-auto ${variant === "primary" ? "bg-primary/10 border-primary" : "bg-card border-border"} border rounded-lg`}
		>
			<View className="p-4 w-full">
				<View className="flex-row items-center">
					<View
						className={`p-3 rounded-full mr-4 ${variant === "primary" ? "bg-primary/20" : "bg-muted"}`}
					>
						<Icon
							size={24}
							className={
								variant === "primary" ? "text-primary" : "text-muted-foreground"
							}
						/>
					</View>
					<View className="flex-1">
						<H2 className="text-lg font-semibold mb-1">{title}</H2>
						<Muted className="text-sm">{description}</Muted>
					</View>
				</View>
			</View>
		</Button>
	);
}

export default function OnboardingComplete() {
	// Auto-hide splash screen when this component mounts
	useEffect(() => {
		// Small delay to ensure smooth transition
		const timer = setTimeout(() => {
			// The auth provider will handle navigation to main app
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	const quickActions = [
		{
			icon: Target,
			title: "Create Your First Target",
			description: "Set up a target for your shooting practice",
			action: () => {
				router.replace("/(protected)/target/create");
			},
			variant: "primary" as const,
		},
		{
			icon: Calendar,
			title: "Browse Existing Targets",
			description: "See what targets are available to use",
			action: () => {
				router.replace("/(protected)/(tabs)/targets");
			},
		},
		{
			icon: BarChart3,
			title: "Explore the Dashboard",
			description: "Get familiar with the main interface",
			action: () => {
				router.replace("/(protected)/(tabs)");
			},
		},
		{
			icon: Settings,
			title: "Adjust Settings",
			description: "Customize your preferences and disciplines",
			action: () => {
				router.replace("/(protected)/(tabs)/settings");
			},
		},
	];

	const goToMainApp = () => {
		router.replace("/(protected)/(tabs)");
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1 px-6 py-8">
				{/* Success Header */}
				<View className="items-center mb-8">
					<View className="bg-green-100 p-6 rounded-full mb-6">
						<CheckCircle size={48} className="text-green-600" />
					</View>
					<H1 className="text-center text-3xl font-bold mb-4">
						You&apos;re All Set!
					</H1>
					<Muted className="text-center text-lg leading-relaxed max-w-sm">
						Welcome to Target Sheet. Your account is ready and you can start
						tracking your shooting progress.
					</Muted>
				</View>

				{/* Quick Actions */}
				<View className="mb-8">
					<H2 className="text-xl font-semibold mb-4">
						What would you like to do first?
					</H2>
					<View className="space-y-4">
						{quickActions.map((action, index) => (
							<QuickAction
								key={index}
								icon={action.icon}
								title={action.title}
								description={action.description}
								action={action.action}
								variant={action.variant}
							/>
						))}
					</View>
				</View>

				{/* Tips */}
				<View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
					<H2 className="text-blue-800 font-semibold mb-2">💡 Quick Tips</H2>
					<View className="space-y-2">
						<Text className="text-blue-700 text-sm">
							• Start by creating a target that matches your equipment and
							distance
						</Text>
						<Text className="text-blue-700 text-sm">
							• Use sessions to group related shooting practice
						</Text>
						<Text className="text-blue-700 text-sm">
							• Tap on targets to place shots and track your accuracy
						</Text>
						<Text className="text-blue-700 text-sm">
							• Check your progress in the dashboard regularly
						</Text>
					</View>
				</View>
			</ScrollView>

			{/* Main Action */}
			<View className="px-6 pb-8">
				<Button size="lg" onPress={goToMainApp} className="w-full">
					<Text className="text-lg font-semibold">Enter Target Sheet</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
