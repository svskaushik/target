import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { Image } from "@/components/image";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";

export default function WelcomeScreen() {
	const router = useRouter();
	const { colorScheme } = useColorScheme();
	const appIcon =
		colorScheme === "dark"
			? require("@/assets/icon.png")
			: require("@/assets/icon-dark.png");

	return (
		<SafeAreaView className="flex flex-1 bg-background p-4">
			<View className="flex flex-1 items-center justify-center gap-y-6 web:m-4">
				<Image source={appIcon} className="w-20 h-20 rounded-xl shadow-lg" />
				<View className="items-center gap-y-3">
					<H1 className="text-center text-3xl font-bold">Target Sheet</H1>
					<Muted className="text-center text-lg max-w-sm leading-relaxed">
						Track your shooting progress with precision. Record sessions,
						analyze shots, and improve your accuracy.
					</Muted>
				</View>
			</View>
			<View className="flex flex-col gap-y-4 web:m-4">
				<Button
					size="default"
					variant="default"
					onPress={() => {
						router.push("/sign-up");
					}}
					className="py-4"
				>
					<Text className="text-lg font-semibold">Get Started</Text>
				</Button>
				<Button
					size="default"
					variant="secondary"
					onPress={() => {
						router.push("/sign-in");
					}}
					className="py-4"
				>
					<Text className="text-lg">Sign In</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
