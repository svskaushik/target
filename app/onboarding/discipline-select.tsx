import React, { useState, useEffect } from "react";
import { View, Alert, ActivityIndicator, ScrollView } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useDisciplines } from "@/hooks/useTargetConfig";
import {
	useUserDisciplines,
	useUpdateUserDisciplines,
} from "@/hooks/useUserDisciplines";
import { useRouter } from "expo-router";

export default function DisciplineSelectOnboarding() {
	const router = useRouter();
	const { data: allDisciplines = [], isLoading: loadingDisciplines } =
		useDisciplines();
	const { data: userDisciplines = [], isLoading: loadingUserDisciplines } =
		useUserDisciplines();
	const updateUserDisciplines = useUpdateUserDisciplines();
	const [selected, setSelected] = useState<string[]>([]);
	const [submitting, setSubmitting] = useState(false);

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
		if (selected.length === 0 && allDisciplines.length > 0) {
			// Assign default (first discipline)
			setSelected([allDisciplines[0].id]);
			try {
				setSubmitting(true);
				await updateUserDisciplines.mutateAsync([allDisciplines[0].id]);
				router.replace("/welcome");
			} catch (e: any) {
				Alert.alert("Error", e.message || "Failed to save discipline");
			} finally {
				setSubmitting(false);
			}
			return;
		}
		try {
			setSubmitting(true);
			await updateUserDisciplines.mutateAsync(selected);
			router.replace("/welcome");
		} catch (e: any) {
			Alert.alert("Error", e.message || "Failed to save disciplines");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<ScrollView className="flex-1 bg-background p-4">
			<View className="flex-1 items-center gap-y-6">
				<H1 className="text-center text-2xl">Select Your Disciplines</H1>
				<Muted className="mb-4 text-center">
					Choose one or more shooting disciplines to get started. You can change
					these later in Settings.
				</Muted>
				<View className="w-full max-w-sm gap-y-4">
					{loadingDisciplines || loadingUserDisciplines ? (
						<ActivityIndicator size="small" />
					) : (
						allDisciplines.map((d) => (
							<View key={d.id} className="flex-row items-center mb-2">
								<Button
									variant={selected.includes(d.id) ? "default" : "secondary"}
									onPress={() => handleToggleDiscipline(d.id)}
									size="sm"
									className="mr-2"
								>
									{selected.includes(d.id) ? <Text>✓</Text> : null}
								</Button>
								<Text>{d.name}</Text>
							</View>
						))
					)}
					<Button
						className="w-full mt-4"
						size="default"
						variant="default"
						onPress={handleContinue}
						disabled={submitting || updateUserDisciplines.status === "pending"}
					>
						{submitting || updateUserDisciplines.status === "pending" ? (
							<ActivityIndicator size="small" color="white" />
						) : (
							<Text>Continue</Text>
						)}
					</Button>
				</View>
			</View>
		</ScrollView>
	);
}
