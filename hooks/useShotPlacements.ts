import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/supabase-provider";
import type { ShotPlacement, CreateShotPlacementData } from "@/lib/types";

export function useShotPlacements(sessionId: string) {
	return useQuery({
		queryKey: ["shotPlacements", sessionId],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("shot_placements")
				.select("*")
				.eq("session_id", sessionId)
				.order("shot_number", { ascending: true });
			if (error) {
				console.error("Error fetching shot placements:", error);
				throw error;
			}
			return (data as ShotPlacement[]).map((shot) => ({
				...shot,
				windage: shot.windage ?? 0,
				elevation: shot.elevation ?? 0,
				status: shot.status ?? "good",
			}));
		},
		enabled: !!sessionId,
	});
}

export function useCreateShotPlacement() {
	const queryClient = useQueryClient();
	const { session } = useAuth();
	return useMutation({
		mutationFn: async (shotData: CreateShotPlacementData) => {
			if (!session?.user?.id) {
				throw new Error("User must be authenticated to create shot placements");
			}
			const { data: sessionData, error: sessionError } = await supabase
				.from("sessions")
				.select("id")
				.eq("id", shotData.session_id)
				.eq("user_id", session.user.id)
				.single();
			if (sessionError || !sessionData) {
				throw new Error("Session not found or access denied");
			}
			const { data, error } = await supabase
				.from("shot_placements")
				.insert({
					...shotData,
					windage: shotData.windage ?? 0,
					elevation: shotData.elevation ?? 0,
					status: shotData.status ?? "good",
					timestamp: new Date().toISOString(),
				})
				.select()
				.single();
			if (error) {
				console.error("Error creating shot placement:", error);
				throw new Error(`Failed to create shot placement: ${error.message}`);
			}
			return data as ShotPlacement;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["shotPlacements", data.session_id],
			});
		},
		onError: (error) => {
			console.error("Shot placement creation failed:", error);
		},
	});
}

export function useUpdateShotPlacement() {
	const queryClient = useQueryClient();
	const { session } = useAuth();
	return useMutation({
		mutationFn: async ({
			id,
			updates,
		}: {
			id: string;
			updates: Partial<Pick<ShotPlacement, "windage" | "elevation" | "status">>;
		}) => {
			if (!session?.user?.id) {
				throw new Error("User must be authenticated to update shot placements");
			}
			const { data: shot, error: fetchError } = await supabase
				.from("shot_placements")
				.select("session_id")
				.eq("id", id)
				.single();
			if (fetchError || !shot) {
				throw new Error("Shot placement not found");
			}
			const { data: sessionData, error: sessionError } = await supabase
				.from("sessions")
				.select("id")
				.eq("id", shot.session_id)
				.eq("user_id", session.user.id)
				.single();
			if (sessionError || !sessionData) {
				throw new Error("Access denied: Session does not belong to user");
			}
			const { error } = await supabase
				.from("shot_placements")
				.update(updates)
				.eq("id", id);
			if (error) {
				console.error("Error updating shot placement:", error);
				throw new Error(`Failed to update shot placement: ${error.message}`);
			}
			return shot.session_id;
		},
		onSuccess: (sessionId) => {
			if (sessionId) {
				queryClient.invalidateQueries({
					queryKey: ["shotPlacements", sessionId],
				});
			}
		},
		onError: (error) => {
			console.error("Shot placement update failed:", error);
		},
	});
}

export function useDeleteShotPlacement() {
	const queryClient = useQueryClient();
	const { session } = useAuth();
	return useMutation({
		mutationFn: async (id: string) => {
			if (!session?.user?.id) {
				throw new Error("User must be authenticated to delete shot placements");
			}
			const { data: shot, error: fetchError } = await supabase
				.from("shot_placements")
				.select("session_id")
				.eq("id", id)
				.single();
			if (fetchError || !shot) {
				throw new Error("Shot placement not found");
			}
			const { data: sessionData, error: sessionError } = await supabase
				.from("sessions")
				.select("id")
				.eq("id", shot.session_id)
				.eq("user_id", session.user.id)
				.single();
			if (sessionError || !sessionData) {
				throw new Error("Access denied: Session does not belong to user");
			}
			const { error } = await supabase
				.from("shot_placements")
				.delete()
				.eq("id", id);
			if (error) {
				console.error("Error deleting shot placement:", error);
				throw new Error(`Failed to delete shot placement: ${error.message}`);
			}
			return shot.session_id;
		},
		onSuccess: (sessionId) => {
			if (sessionId) {
				queryClient.invalidateQueries({
					queryKey: ["shotPlacements", sessionId],
				});
			}
		},
		onError: (error) => {
			console.error("Shot placement deletion failed:", error);
		},
	});
}

export function useClearSessionShots() {
	const queryClient = useQueryClient();
	const { session } = useAuth();
	return useMutation({
		mutationFn: async (sessionId: string) => {
			if (!session?.user?.id) {
				throw new Error("User must be authenticated to clear session shots");
			}
			const { data: sessionData, error: sessionError } = await supabase
				.from("sessions")
				.select("id")
				.eq("id", sessionId)
				.eq("user_id", session.user.id)
				.single();
			if (sessionError || !sessionData) {
				throw new Error("Access denied: Session does not belong to user");
			}
			const { error } = await supabase
				.from("shot_placements")
				.delete()
				.eq("session_id", sessionId);
			if (error) {
				console.error("Error clearing session shots:", error);
				throw new Error(`Failed to clear session shots: ${error.message}`);
			}
		},
		onSuccess: (_, sessionId) => {
			queryClient.invalidateQueries({
				queryKey: ["shotPlacements", sessionId],
			});
		},
		onError: (error) => {
			console.error("Clear session shots failed:", error);
		},
	});
}

export function useTotalShots() {
	const { session } = useAuth();
	return useQuery({
		queryKey: ["totalShots", session?.user?.id],
		queryFn: async () => {
			if (!session?.user?.id) return 0;
			const { data: sessions, error: sessionError } = await supabase
				.from("sessions")
				.select("id")
				.eq("user_id", session.user.id);
			if (sessionError) {
				console.error(
					"Error fetching user sessions for total shots:",
					sessionError,
				);
				throw sessionError;
			}
			const sessionIds = (sessions || []).map((s: any) => s.id);
			if (!sessionIds.length) return 0;
			const { count, error } = await supabase
				.from("shot_placements")
				.select("*", { count: "exact", head: true })
				.in("session_id", sessionIds);
			if (error) {
				console.error("Error fetching total shots:", error);
				throw error;
			}
			return count || 0;
		},
		enabled: !!session?.user?.id,
		staleTime: 60 * 1000,
	});
}
