import React, { createContext, useContext, useState, useCallback } from "react";
import { View, Text, Animated, Dimensions } from "react-native";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react-native";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
	id: string;
	type: ToastType;
	title: string;
	description?: string;
	duration?: number;
}

interface ToastContextType {
	showToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}

const ToastIcons = {
	success: CheckCircle,
	error: XCircle,
	warning: AlertCircle,
	info: Info,
};

const ToastColors = {
	success: { bg: "#10b981", border: "#059669", text: "#ffffff" },
	error: { bg: "#ef4444", border: "#dc2626", text: "#ffffff" },
	warning: { bg: "#f59e0b", border: "#d97706", text: "#ffffff" },
	info: { bg: "#3b82f6", border: "#2563eb", text: "#ffffff" },
};

function ToastItem({
	toast,
	onDismiss,
}: {
	toast: Toast;
	onDismiss: () => void;
}) {
	const [fadeAnim] = useState(new Animated.Value(0));
	const [slideAnim] = useState(new Animated.Value(-100));
	const Icon = ToastIcons[toast.type];
	const colors = ToastColors[toast.type];

	React.useEffect(() => {
		// Animate in
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}),
		]).start();

		// Auto dismiss
		const timer = setTimeout(() => {
			handleDismiss();
		}, toast.duration || 4000);

		return () => clearTimeout(timer);
	}, []);

	const handleDismiss = () => {
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: -100,
				duration: 200,
				useNativeDriver: true,
			}),
		]).start(() => {
			onDismiss();
		});
	};

	return (
		<Animated.View
			style={{
				opacity: fadeAnim,
				transform: [{ translateY: slideAnim }],
				position: "absolute",
				top: 50,
				left: 16,
				right: 16,
				zIndex: 9999,
				backgroundColor: colors.bg,
				borderLeftWidth: 4,
				borderLeftColor: colors.border,
				borderRadius: 8,
				padding: 16,
				flexDirection: "row",
				alignItems: "center",
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.25,
				shadowRadius: 4,
				elevation: 5,
			}}
		>
			<Icon size={24} color={colors.text} style={{ marginRight: 12 }} />
			<View style={{ flex: 1 }}>
				<Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>
					{toast.title}
				</Text>
				{toast.description && (
					<Text
						style={{
							color: colors.text,
							fontSize: 14,
							marginTop: 4,
							opacity: 0.9,
						}}
					>
						{toast.description}
					</Text>
				)}
			</View>
		</Animated.View>
	);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const showToast = useCallback((toast: Omit<Toast, "id">) => {
		const id = Math.random().toString(36).substr(2, 9);
		const newToast = { ...toast, id };
		setToasts((prev) => [...prev, newToast]);
	}, []);

	const dismissToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			{toasts.map((toast) => (
				<ToastItem
					key={toast.id}
					toast={toast}
					onDismiss={() => dismissToast(toast.id)}
				/>
			))}
		</ToastContext.Provider>
	);
}
