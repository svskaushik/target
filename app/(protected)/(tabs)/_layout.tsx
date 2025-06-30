import React from "react";
import { Tabs } from "expo-router";
import { Home, Target, List, Settings } from 'lucide-react-native';

import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export default function TabsLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				tabBarActiveTintColor: '#2563eb',
				tabBarInactiveTintColor: '#6b7280',
				tabBarShowLabel: true,
			}}
		>
			<Tabs.Screen 
				name="index" 
				options={{ 
					title: "Home",
					tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
				}} 
			/>
			<Tabs.Screen 
				name="targets" 
				options={{ 
					title: "Targets",
					tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,
				}} 
			/>
			<Tabs.Screen 
				name="sessions" 
				options={{ 
					title: "Sessions",
					tabBarIcon: ({ color, size }) => <List color={color} size={size} />,
				}} 
			/>
			<Tabs.Screen 
				name="settings" 
				options={{ 
					title: "Settings",
					tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
				}} 
			/>
		</Tabs>
	);
}
