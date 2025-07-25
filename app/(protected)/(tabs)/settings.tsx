import React, { useState } from "react";
import {
	View,
	Alert,
	ActivityIndicator,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ApertureElevationManager } from "@/components/forms/ApertureElevationManager";
import {
	useDistances,
	useCreateDistance,
	useDeleteDistance,
} from "@/hooks/useDistanceConfig";
import { H1, H2, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { useDisciplines } from "@/hooks/useTargetConfig";
import {
	useUserDisciplines,
	useUpdateUserDisciplines,
} from "@/hooks/useUserDisciplines";
import {
	User,
	Target,
	Settings as SettingsIcon,
	ChevronDown,
	ChevronRight,
	BarChart3,
	Trophy,
	Activity,
} from "lucide-react-native";

interface SettingsSectionProps {
	title: string;
	icon: React.ReactNode;
	children: React.ReactNode;
	defaultExpanded?: boolean;
}

function SettingsSection({
	title,
	icon,
	children,
	defaultExpanded = false,
}: SettingsSectionProps) {
	const [expanded, setExpanded] = useState(defaultExpanded);

	return (
		<View className="mb-4 bg-card rounded-lg border border-border overflow-hidden">
			<TouchableOpacity
				onPress={() => setExpanded(!expanded)}
				className="flex-row items-center justify-between p-4 bg-card"
				activeOpacity={0.7}
			>
				<View className="flex-row items-center gap-3">
					{icon}
					<Text className="text-lg font-semibold text-foreground">{title}</Text>
				</View>
				{expanded ? (
					<ChevronDown size={20} className="text-muted-foreground" />
				) : (
					<ChevronRight size={20} className="text-muted-foreground" />
				)}
			</TouchableOpacity>
			{expanded && (
				<View className="p-4 pt-0 border-t border-border">{children}</View>
			)}
		</View>
	);
}

export default function Settings() {
	// Elevation/Aperture management state
	const { data: distances = [], isLoading: loadingDistances } = useDistances();
	const createDistance = useCreateDistance();
	const deleteDistance = useDeleteDistance();
	const [selectedDistanceId, setSelectedDistanceId] = useState<string>("");
	const [newDistanceName, setNewDistanceName] = useState("");
	const [showApertureManager, setShowApertureManager] = useState(false);

	const handleAddDistance = () => {
		if (!newDistanceName) return;
		createDistance.mutate({ name: newDistanceName });
		setNewDistanceName("");
	};
	const handleDeleteDistance = (id: string) => {
		deleteDistance.mutate(id);
		if (selectedDistanceId === id) setSelectedDistanceId("");
	};
	const { signOut, session } = useAuth();
	const [signingOut, setSigningOut] = useState(false);
	const { data: allDisciplines = [], isLoading: loadingDisciplines } =
		useDisciplines();
	const { data: userDisciplines = [], isLoading: loadingUserDisciplines } =
		useUserDisciplines();
	const updateUserDisciplines = useUpdateUserDisciplines();
	const [selected, setSelected] = useState<string[]>([]);

	// Initialize selected disciplines
	React.useEffect(() => {
		if (userDisciplines.length > 0) {
			setSelected(userDisciplines.map((d) => d.discipline_id));
		}
	}, [userDisciplines]);

	const handleSignOut = async () => {
		try {
			setSigningOut(true);
			const result = await signOut();
			if (!result.success) {
				Alert.alert(
					"Sign Out Failed",
					result.error || "Failed to sign out. Please try again.",
					[{ text: "OK" }],
				);
			}
			// Success will be handled by the auth state change
		} catch (error: any) {
			console.error("Sign out error:", error);
			Alert.alert(
				"Error",
				"An unexpected error occurred during sign out. Please try again.",
				[{ text: "OK" }],
			);
		} finally {
			setSigningOut(false);
		}
	};

	const handleDisciplineToggle = (disciplineId: string) => {
		setSelected((prev) =>
			prev.includes(disciplineId)
				? prev.filter((id) => id !== disciplineId)
				: [...prev, disciplineId],
		);
	};

	const handleSaveDisciplines = () => {
		updateUserDisciplines.mutate(selected);
	};


	return (
		<ScrollView className="flex-1 bg-background">
			<View className="p-4">
				<H1 className="mb-6">Settings</H1>

				{/* Account Section */}
				<SettingsSection
					title="Account & Profile"
					icon={<User size={24} className="text-primary" />}
					defaultExpanded={true}
				>
					<View className="space-y-4">
						<View>
							<Text className="text-sm text-muted-foreground mb-1">
								Signed in as:
							</Text>
							<Text className="text-base font-medium">
								{session?.user?.email}
							</Text>
						</View>
						<Button
							variant="destructive"
							onPress={handleSignOut}
							disabled={signingOut}
							className="mt-4"
						>
							{signingOut ? (
								<ActivityIndicator size="small" color="white" />
							) : (
								<Text>Sign Out</Text>
							)}
						</Button>
					</View>
				</SettingsSection>

				{/* Disciplines Section */}
				<SettingsSection
					title="Shooting Disciplines"
					icon={<Target size={24} className="text-primary" />}
				>
					<View className="space-y-4">
						<Muted>Select the shooting disciplines you practice</Muted>
						{loadingDisciplines || loadingUserDisciplines ? (
							<ActivityIndicator size="small" />
						) : (
							<View className="space-y-2">
								{allDisciplines.map((discipline) => (
									<TouchableOpacity
										key={discipline.id}
										onPress={() => handleDisciplineToggle(discipline.id)}
										className="flex-row items-center justify-between p-3 bg-muted/50 rounded-lg"
										activeOpacity={0.7}
									>
										<Text className="text-base">{discipline.name}</Text>
										<View
											className={`w-6 h-6 rounded border-2 ${
												selected.includes(discipline.id)
													? "bg-primary border-primary"
													: "border-muted-foreground"
											} items-center justify-center`}
										>
											{selected.includes(discipline.id) && (
												<Text className="text-primary-foreground text-xs">
													✓
												</Text>
											)}
										</View>
									</TouchableOpacity>
								))}
								<Button
									onPress={handleSaveDisciplines}
									disabled={updateUserDisciplines.isPending}
									className="mt-4"
								>
									{updateUserDisciplines.isPending ? (
										<ActivityIndicator size="small" color="white" />
									) : (
										<Text>Save Disciplines</Text>
									)}
								</Button>
							</View>
						)}
					</View>
				</SettingsSection>

				{/* Equipment Settings Section */}
				<SettingsSection
					title="Equipment Settings"
					icon={<SettingsIcon size={24} className="text-primary" />}
				>
					<View className="space-y-4">
						<Muted>
							Manage distances, apertures, and elevations for your equipment
						</Muted>

						{/* Quick Equipment Overview */}
						<View className="bg-muted/30 p-3 rounded-lg">
							<Text className="font-medium mb-2">Current Setup</Text>
							<Text className="text-sm text-muted-foreground">
								{distances.length} distances configured
							</Text>
						</View>

						<Button
							variant="outline"
							onPress={() => router.push("/(protected)/apertures-elevations")}
							className="w-full"
						>
							<Text>Manage Equipment Settings</Text>
						</Button>
					</View>
				</SettingsSection>

				{/* Analytics & Performance Section */}
				<SettingsSection
					title="Analytics & Performance"
					icon={<BarChart3 size={24} className="text-primary" />}
				>
					<View className="space-y-4">
						<Muted>Track your shooting progress and performance metrics</Muted>

						{/* Performance Overview Cards */}
						<View className="flex-row space-x-2">
							<View className="flex-1 bg-muted/30 p-3 rounded-lg">
								<Activity size={16} className="text-primary mb-1" />
								<Text className="text-xs text-muted-foreground">
									Total Sessions
								</Text>
								<Text className="text-lg font-bold">0</Text>
							</View>
							<View className="flex-1 bg-muted/30 p-3 rounded-lg">
								<Trophy size={16} className="text-primary mb-1" />
								<Text className="text-xs text-muted-foreground">
									Best Score
								</Text>
								<Text className="text-lg font-bold">-</Text>
							</View>
						</View>

						<Button
							variant="outline"
							onPress={() => router.push("/(protected)/analytics")}
							className="w-full"
						>
							<Text>View Detailed Analytics</Text>
						</Button>
					</View>
				</SettingsSection>

				{/* App Preferences Section */}
				<SettingsSection
					title="App Preferences"
					icon={<SettingsIcon size={24} className="text-muted-foreground" />}
				>
					<View className="space-y-4">
						<Muted>Customize your app experience</Muted>

						<View className="space-y-3">
							<View className="flex-row items-center justify-between">
								<Text>Dark Mode</Text>
								<Text className="text-muted-foreground">System</Text>
							</View>
							<View className="flex-row items-center justify-between">
								<Text>Notifications</Text>
								<Text className="text-muted-foreground">Enabled</Text>
							</View>
							<View className="flex-row items-center justify-between">
								<Text>Auto-save Targets</Text>
								<Text className="text-muted-foreground">On</Text>
							</View>
						</View>
					</View>
				</SettingsSection>
			</View>
		</ScrollView>
	);
}
