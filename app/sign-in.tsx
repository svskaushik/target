import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as z from "zod";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";

const formSchema = z.object({
	email: z.string().email("Please enter a valid email address."),
	password: z
		.string()
		.min(8, "Please enter at least 8 characters.")
		.max(64, "Please enter fewer than 64 characters."),
});

export default function SignIn() {
	const { signIn, signInWithGoogle, loading } = useAuth();
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			const result = await signIn(data.email, data.password);

			if (result.success) {
				form.reset();
				// Don't manually navigate - let AuthProvider handle it via session state change
			} else {
				Alert.alert(
					"Sign In Failed",
					result.error || "Invalid email or password. Please try again.",
					[{ text: "OK" }],
				);
			}
		} catch (error: any) {
			console.error("Sign in error:", error);
			Alert.alert("Error", "An unexpected error occurred. Please try again.", [
				{ text: "OK" },
			]);
		}
	}

	async function handleGoogleSignIn() {
		try {
			const result = await signInWithGoogle();

			if (!result.success) {
				Alert.alert(
					"Google Sign In Failed",
					result.error || "Failed to sign in with Google. Please try again.",
					[{ text: "OK" }],
				);
			}
			// Success will be handled by the auth state change
		} catch (error: any) {
			console.error("Google sign in error:", error);
			Alert.alert(
				"Error",
				"An unexpected error occurred with Google sign in. Please try again.",
				[{ text: "OK" }],
			);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-4 web:m-4">
				<View className="mb-6">
					<H1 className="self-start mb-2">Welcome Back</H1>
					<Muted>Sign in to your Target Sheet account</Muted>
				</View>
				<Form {...form}>
					<View className="gap-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormInput
									label="Email"
									placeholder="Enter your email"
									autoCapitalize="none"
									autoComplete="email"
									autoCorrect={false}
									keyboardType="email-address"
									{...field}
								/>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormInput
									label="Password"
									placeholder="Enter your password"
									autoCapitalize="none"
									autoCorrect={false}
									secureTextEntry
									{...field}
								/>
							)}
						/>
					</View>
				</Form>
			</View>
			<View className="gap-3 web:m-4">
				<Button
					size="default"
					variant="default"
					onPress={form.handleSubmit(onSubmit)}
					disabled={form.formState.isSubmitting || loading}
					className="mb-3"
				>
					{form.formState.isSubmitting || loading ? (
						<ActivityIndicator size="small" color="white" />
					) : (
						<Text>Sign In</Text>
					)}
				</Button>

				<View className="flex-row items-center my-4">
					<View className="flex-1 h-px bg-border" />
					<Text className="mx-4 text-muted-foreground">or</Text>
					<View className="flex-1 h-px bg-border" />
				</View>

				<Button
					size="default"
					variant="outline"
					onPress={handleGoogleSignIn}
					disabled={form.formState.isSubmitting || loading}
					className="mb-3"
				>
					{loading ? (
						<ActivityIndicator size="small" />
					) : (
						<Text>Continue with Google</Text>
					)}
				</Button>

				<Button
					size="default"
					variant="secondary"
					onPress={() => router.push("/sign-up")}
					disabled={form.formState.isSubmitting || loading}
				>
					<Text>Don't have an account? Sign Up</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
