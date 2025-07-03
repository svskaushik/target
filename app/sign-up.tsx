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

const formSchema = z
	.object({
		email: z.string().email("Please enter a valid email address."),
		password: z
			.string()
			.min(8, "Please enter at least 8 characters.")
			.max(64, "Please enter fewer than 64 characters.")
			.regex(
				/^(?=.*[a-z])/,
				"Your password must have at least one lowercase letter.",
			)
			.regex(
				/^(?=.*[A-Z])/,
				"Your password must have at least one uppercase letter.",
			)
			.regex(/^(?=.*[0-9])/, "Your password must have at least one number.")
			.regex(
				/^(?=.*[!@#$%^&*])/,
				"Your password must have at least one special character.",
			),
		confirmPassword: z.string().min(8, "Please enter at least 8 characters."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Your passwords do not match.",
		path: ["confirmPassword"],
	});

export default function SignUp() {
	const { signUp, loading } = useAuth();
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			const result = await signUp(data.email, data.password);

			if (result.success) {
				form.reset();

				if (result.needsVerification) {
					Alert.alert(
						"Check Your Email",
						"We've sent you a verification email. Please click the link in the email to verify your account before signing in.",
						[
							{
								text: "OK",
								onPress: () => router.push("/sign-in"),
							},
						],
					);
				} else {
					// User is signed up and authenticated
					Alert.alert(
						"Welcome!",
						"Your account has been created successfully.",
						[
							{
								text: "OK",
								// Don't manually navigate - let AuthProvider handle it
							},
						],
					);
				}
			} else {
				Alert.alert(
					"Sign Up Failed",
					result.error || "An error occurred during sign up. Please try again.",
					[{ text: "OK" }],
				);
			}
		} catch (error: any) {
			console.error("Sign up error:", error);
			Alert.alert("Error", "An unexpected error occurred. Please try again.", [
				{ text: "OK" },
			]);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-4 web:m-4">
				<View className="mb-6">
					<H1 className="self-start mb-2">Create Account</H1>
					<Muted>Join Target Sheet to track your shooting progress</Muted>
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
									placeholder="Create a password"
									autoCapitalize="none"
									autoCorrect={false}
									secureTextEntry
									{...field}
								/>
							)}
						/>
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormInput
									label="Confirm Password"
									placeholder="Confirm your password"
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
						<Text>Create Account</Text>
					)}
				</Button>
				<Button
					size="default"
					variant="secondary"
					onPress={() => router.push("/sign-in")}
					disabled={form.formState.isSubmitting || loading}
				>
					<Text>Already have an account? Sign In</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
