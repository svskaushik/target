import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { useDisciplines } from "@/hooks/useTargetConfig";
import {
	useUserDisciplines,
	useUpdateUserDisciplines,
} from "@/hooks/useUserDisciplines";
import { ChevronLeft, Check, Target, Crosshair, Zap, Wind } from "lucide-react-native";

// Icon mapping for different disciplines
const disciplineIcons: Record<string, React.ComponentType<any>> = {
	rifle: Target,
	pistol: Crosshair,
	archery: Zap,
	"air gun": Wind,
	default: Target,
};

interface DisciplineCardProps {
	discipline: any;
	isSelected: boolean;
	onToggle: () => void;
	description?: string;
}

function DisciplineCard({ discipline, isSelected, onToggle, description }: DisciplineCardProps) {
	const IconComponent = disciplineIcons[discipline.name.toLowerCase()] || disciplineIcons.default;

	return (
		<Button
			variant="ghost"
			onPress={onToggle}
			className={`w-full p-0 h-auto ${isSelected ? "bg-primary/10 border-primary" : "bg-card border-border"} border-2 rounded-lg`}
		>
			<View className="p-4 w-full">
				<View className="flex-row items-center justify-between mb-2">
					<View className="flex-row items-center flex-1">
						<View className={`p-2 rounded-full mr-3 ${isSelected ? "bg-primary/20" : "bg-muted"}`}>
							<IconComponent 
								size={20} 
								className={isSelected ? "text-primary" : "text-muted-foreground"} 
							/>
						</View>
						<View className="flex-1">
							<H2 className={`text-lg font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
								{discipline.name}
							</H2>
							{description && (
								<Muted className="text-sm mt-1">{description}</Muted>
							)}
						</View>
					</View>
					{isSelected && (
						<View className="bg-primary p-1 rounded-full">
							<Check size={16} className="text-primary-foreground" />
						</View>
					)}
				</View>
			</View>
		</Button>
	);
}

export default function DisciplineSelectOnboarding() {
	const { data: allDisciplines = [], isLoading: loadingDisciplines } = useDisciplines();
	const { data: userDisciplines = [], isLoading: loadingUserDisciplines } = useUserDisciplines();
	const updateUserDisciplines = useUpdateUserDisciplines();
	const [selected, setSelected] = useState<string[]>([]);
	const [submitting, setSubmitting] = useState(false);

	// Discipline descriptions for better understanding
	const disciplineDescriptions: Record<string, string> = {
		"Rifle": "Long-range precision shooting with rifles",
		"Pistol": "Handgun accuracy and speed shooting",
		"Archery": "Traditional bow and arrow shooting",
		"Air Gun": "Indoor precision with air rifles/pistols",
		"Shotgun": "Clay pigeon and bird hunting sports",
		"Crossbow": "Modern crossbow target shooting",
	};

	useEffect(() => {
		if (userDisciplines && userDisciplines.length > 0) {
			setSelected(userDisciplines.map((d) => d.id));
		}
	}, [userDisciplines]);

	const handleToggleDiscipline = (id: string) => {
		setSelected((prev) =>
			prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
		);
	};

	const handleContinue = async () => {
		// Ensure at least one discipline is selected
		let finalSelection = selected;
		if (selected.length === 0 && allDisciplines.length > 0) {
			// Auto-select the first discipline if none selected
			finalSelection = [allDisciplines[0].id];
			setSelected(finalSelection);
		}

		if (finalSelection.length === 0) {
			Alert.alert(
				"No Disciplines Available",
				"No shooting disciplines are available. Please contact support.",
				[{ text: "OK" }]
			);
			return;
		}

		try {
			setSubmitting(true);
			console.log("Attempting to save disciplines:", finalSelection);
			
			await updateUserDisciplines.mutateAsync(finalSelection);
			
			console.log("Disciplines saved successfully, navigating to complete");
			router.replace("/onboarding/complete");
		} catch (e: any) {
			console.error("Failed to save disciplines:", e);
			
			let errorMessage = "We couldn&apos;t save your discipline preferences. Please try again.";
			
			if (e.message?.includes("User account not found")) {
				errorMessage = "Your account session has expired. Please sign out and sign in again.";
			} else if (e.message?.includes("Invalid discipline")) {
				errorMessage = "There was an issue with the selected disciplines. Please try selecting different ones.";
			} else if (e.message?.includes("At least one discipline")) {
				errorMessage = "Please select at least one shooting discipline to continue.";
			}
			
			Alert.alert("Setup Error", errorMessage, [
				{ 
					text: "Try Again", 
					onPress: () => {
						// Reset selection to allow user to try again
						setSelected([]);
					}
				},
				{
					text: "Sign Out",
					style: "destructive",
					onPress: () => {
						// Navigate to sign out - you might need to implement this
						router.replace("/welcome");
					}
				}
			]);
		} finally {
			setSubmitting(false);
		}
	};

	const goBack = () => {
		router.back();
	};

	if (loadingDisciplines || loadingUserDisciplines) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" />
					<Text className="mt-4 text-muted-foreground">Loading disciplines...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1 px-6 py-8">
				{/* Header */}
				<View className="flex-row items-center mb-8">
					<Button variant="ghost" size="sm" onPress={goBack} className="mr-4">
						<ChevronLeft size={20} />
						<Text className="ml-1">Back</Text>
					</Button>
					<View className="flex-1">
						<H1 className="text-2xl font-bold">Choose Your Disciplines</H1>
					</View>
				</View>

				<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
					{/* Explanation */}
					<View className="mb-8">
						<Muted className="text-lg leading-relaxed">
							Select the shooting disciplines you practice. This helps us show you relevant targets and features.
						</Muted>
						<View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
							<Text className="text-blue-800 text-sm font-medium">
								💡 You can change these selections anytime in Settings
							</Text>
						</View>
					</View>

					{/* Discipline Selection */}
					<View className="space-y-4 mb-8">
						{allDisciplines.map((discipline) => (
							<DisciplineCard
								key={discipline.id}
								discipline={discipline}
								isSelected={selected.includes(discipline.id)}
								onToggle={() => handleToggleDiscipline(discipline.id)}
								description={disciplineDescriptions[discipline.name]}
							/>
						))}
					</View>

					{/* Selection Summary */}
					{selected.length > 0 && (
						<View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
							<Text className="text-green-800 font-medium mb-2">
								Selected: {selected.length} discipline{selected.length !== 1 ? 's' : ''}
							</Text>
							<Text className="text-green-700 text-sm">
								{allDisciplines
									.filter(d => selected.includes(d.id))
									.map(d => d.name)
									.join(", ")}
							</Text>
						</View>
					)}
				</ScrollView>

				{/* Continue Button */}
				<View className="pt-6">
					<Button
						size="lg"
						onPress={handleContinue}
						disabled={submitting || updateUserDisciplines.status === "pending"}
						className="w-full"
					>
						{submitting || updateUserDisciplines.status === "pending" ? (
							<>
								<ActivityIndicator size="small" color="white" className="mr-2" />
								<Text className="text-lg font-semibold">Setting up...</Text>
							</>
						) : (
							<Text className="text-lg font-semibold">
								{selected.length === 0 ? "Continue with Default" : "Continue"}
							</Text>
						)}
					</Button>
					{selected.length === 0 && (
						<Muted className="text-center mt-2 text-sm">
							We&apos;ll set up Rifle as your default discipline
						</Muted>
					)}
				</View>
			</View>
		</SafeAreaView>
	);
}