import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import {
	ChevronLeft,
	ChevronRight,
	Target,
	Calendar,
	BarChart3,
} from "lucide-react-native";

interface ConceptSlide {
	icon: React.ComponentType<any>;
	title: string;
	description: string;
	details: string[];
	example?: string;
}

const concepts: ConceptSlide[] = [
	{
		icon: Target,
		title: "Shooting Disciplines",
		description:
			"Different types of shooting sports, each with unique rules and equipment.",
		details: [
			"Rifle: Long-range precision shooting",
			"Pistol: Handgun accuracy and speed",
			"Archery: Traditional bow and arrow",
			"Air Gun: Indoor precision shooting",
		],
		example: "Choose disciplines that match your interests and equipment",
	},
	{
		icon: Target,
		title: "Targets",
		description: "Digital representations of your physical shooting targets.",
		details: [
			"Set distance and target type",
			"Choose from bullseye, silhouette, or custom",
			"Each target can have multiple sessions",
			"Reuse targets for consistent practice",
		],
		example: "Create a '25m Bullseye' target for regular practice",
	},
	{
		icon: Calendar,
		title: "Sessions",
		description: "Individual shooting practice or competition rounds.",
		details: [
			"Link to a specific target",
			"Record weather conditions",
			"Track date and notes",
			"Place shots on the target",
		],
		example: "Start a session to record today's practice shots",
	},
	{
		icon: BarChart3,
		title: "Shot Analysis",
		description: "Track and analyze your shooting performance over time.",
		details: [
			"See shot groupings on targets",
			"Track accuracy improvements",
			"Compare different sessions",
			"Identify patterns and trends",
		],
		example: "Review your progress and identify areas for improvement",
	},
];

export default function OnboardingConcepts() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const concept = concepts[currentSlide];

	const nextSlide = () => {
		if (currentSlide < concepts.length - 1) {
			setCurrentSlide(currentSlide + 1);
		} else {
			router.push("/onboarding/discipline-select");
		}
	};

	const prevSlide = () => {
		if (currentSlide > 0) {
			setCurrentSlide(currentSlide - 1);
		}
	};

	const skipToEnd = () => {
		router.push("/onboarding/discipline-select");
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1 px-6 py-8">
				{/* Header */}
				<View className="flex-row items-center justify-between mb-8">
					<Button
						variant="ghost"
						size="sm"
						onPress={prevSlide}
						disabled={currentSlide === 0}
						className="opacity-70"
					>
						<ChevronLeft size={20} />
						<Text className="ml-1">Back</Text>
					</Button>
					<View className="flex-row space-x-2">
						{concepts.map((_, index) => (
							<View
								key={index}
								className={`w-2 h-2 rounded-full ${
									index === currentSlide ? "bg-primary" : "bg-muted"
								}`}
							/>
						))}
					</View>
					<Button variant="ghost" size="sm" onPress={skipToEnd}>
						<Text>Skip</Text>
					</Button>
				</View>

				{/* Content */}
				<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
					<View className="items-center mb-8">
						<View className="bg-primary/10 p-6 rounded-full mb-6">
							<concept.icon size={48} className="text-primary" />
						</View>
						<H1 className="text-center text-2xl font-bold mb-4">
							{concept.title}
						</H1>
						<Muted className="text-center text-lg leading-relaxed max-w-sm">
							{concept.description}
						</Muted>
					</View>

					<View className="bg-card border border-border rounded-lg p-6 mb-6">
						<H2 className="text-lg font-semibold mb-4">Key Features:</H2>
						<View className="space-y-3">
							{concept.details.map((detail, index) => (
								<View key={index} className="flex-row items-start">
									<View className="w-2 h-2 bg-primary rounded-full mt-2 mr-3" />
									<Text className="flex-1 leading-relaxed">{detail}</Text>
								</View>
							))}
						</View>
					</View>

					{concept.example && (
						<View className="bg-muted/50 border border-border rounded-lg p-4">
							<Text className="text-sm font-medium text-muted-foreground mb-1">
								Example:
							</Text>
							<Text className="italic">{concept.example}</Text>
						</View>
					)}
				</ScrollView>

				{/* Navigation */}
				<View className="pt-6">
					<Button size="lg" onPress={nextSlide} className="w-full">
						<Text className="text-lg font-semibold">
							{currentSlide === concepts.length - 1 ? "Continue Setup" : "Next"}
						</Text>
						{currentSlide < concepts.length - 1 && (
							<ChevronRight size={20} className="ml-2" />
						)}
					</Button>
				</View>
			</View>
		</SafeAreaView>
	);
}
