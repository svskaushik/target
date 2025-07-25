import React from "react";
import { View, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Image } from "@/components/image";
import { useColorScheme } from "@/lib/useColorScheme";
import { Target, TrendingUp, Users, Award } from "lucide-react-native";

export default function OnboardingWelcome() {
	const { colorScheme } = useColorScheme();
	const appIcon =
		colorScheme === "dark"
			? require("@/assets/icon.png")
			: require("@/assets/icon-dark.png");

	const features = [
		{
			icon: Target,
			title: "Track Your Shots",
			description: "Record every shot with precision on digital targets",
		},
		{
			icon: TrendingUp,
			title: "Analyze Progress",
			description: "See your improvement over time with detailed statistics",
		},
		{
			icon: Users,
			title: "Multiple Disciplines",
			description: "Support for rifle, pistol, archery, and more",
		},
		{
			icon: Award,
			title: "Achieve Goals",
			description: "Set targets and track your shooting achievements",
		},
	];

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1 px-6 py-8">
				<View className="items-center mb-8">
					<Image
						source={appIcon}
						className="w-24 h-24 rounded-xl shadow-lg mb-4"
					/>
					<H1 className="text-center text-3xl font-bold mb-2">
						Welcome to Target Sheet
					</H1>
					<Muted className="text-center text-lg max-w-sm leading-relaxed">
						Your digital shooting companion for tracking progress and improving
						accuracy
					</Muted>
				</View>

				<View className="space-y-6 mb-8">
					{features.map((feature, index) => (
						<View key={index} className="flex-row items-start space-x-4">
							<View className="bg-primary/10 p-3 rounded-full">
								<feature.icon size={24} className="text-primary" />
							</View>
							<View className="flex-1">
								<H2 className="text-lg font-semibold mb-1">{feature.title}</H2>
								<Text className="text-muted-foreground leading-relaxed">
									{feature.description}
								</Text>
							</View>
						</View>
					))}
				</View>

				<View className="space-y-4">
					<Button
						size="lg"
						onPress={() => router.push("/onboarding/concepts")}
						className="w-full"
					>
						<Text className="text-lg font-semibold">Get Started</Text>
					</Button>
					<Button
						variant="ghost"
						onPress={() => router.push("/onboarding/discipline-select")}
						className="w-full"
					>
						<Text>Skip Introduction</Text>
					</Button>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
