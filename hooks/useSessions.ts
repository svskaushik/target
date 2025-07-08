import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/supabase-provider";
import { useUserDisciplines } from "./useUserDisciplines";
import type { Session, CreateSessionData } from "@/lib/types";

export function useSessions() {
	const { data: userDisciplines = [], isLoading } = useUserDisciplines();
	return useQuery({
		queryKey: ["sessions", userDisciplines.map((d) => d.id)],
		queryFn: async () => {
			if (isLoading) return [];
			// Fetch all sessions, discipline filtering is done via joined target if needed
			const { data, error } = await supabase
				.from("sessions")
				.select(
					`
		  *,
		  target:targets(*)
		`,
				)
				.order("date", { ascending: false });
			if (error) {
				console.error("Error fetching sessions:", error);
				throw error;
			}
			// Optionally filter sessions by discipline via the joined target
			const disciplineIds = userDisciplines.map((d) => d.id).filter(Boolean);
			let filtered = data as Session[];
			if (disciplineIds.length > 0) {
				filtered = filtered.filter(
					(session: any) =>
						session.target &&
						disciplineIds.includes(session.target.discipline_id),
				);
			}
			return filtered;
		},
		enabled: !isLoading,
	});
}

export function useSession(id: string) {
	return useQuery({
		queryKey: ["session", id],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("sessions")
				.select(
					`
		  *,
		  target:targets(*)
		`,
				)
				.eq("id", id)
				.single();

			if (error) {
				console.error("Error fetching session:", error);
				throw error;
			}
			return data as Session;
		},
		enabled: !!id,
	});
}

export function useCreateSession() {
	const queryClient = useQueryClient();
	const { session } = useAuth();

	return useMutation({
		mutationFn: async (sessionData: CreateSessionData) => {
			// Ensure user is authenticated
			if (!session?.user?.id) {
				throw new Error("User must be authenticated to create sessions");
			}

			// Add user_id to the session data for RLS compliance
			const sessionWithUserId = {
				...sessionData,
				user_id: session.user.id,
				date: sessionData.date || new Date().toISOString(),
			};

			console.log(
				"Creating session with user_id:",
				session.user.id,
				sessionWithUserId,
			);

			const { data, error } = await supabase
				.from("sessions")
				.insert(sessionWithUserId)
				.select(
					`
		  *,
		  target:targets(*)
		`,
				)
				.single();

			if (error) {
				console.error("Error creating session:", error);
				throw new Error(`Failed to create session: ${error.message}`);
			}

			console.log("Session created successfully:", data);
			return data as Session;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
		},
		onError: (error) => {
			console.error("Session creation failed:", error);
		},
	});
}

export function useUpdateSession() {
	const queryClient = useQueryClient();
	const { session } = useAuth();

	return useMutation({
		mutationFn: async ({
			id,
			...updates
		}: Partial<Session> & { id: string }) => {
			// Ensure user is authenticated
			if (!session?.user?.id) {
				throw new Error("User must be authenticated to update sessions");
			}

			// Ensure the update includes user_id for RLS compliance
			const updateData = {
				...updates,
				user_id: session.user.id,
			};

			console.log("Updating session:", id, "with user_id:", session.user.id);

			const { data, error } = await supabase
				.from("sessions")
				.update(updateData)
				.eq("id", id)
				.eq("user_id", session.user.id) // Ensure user owns the session
				.select(
					`
		  *,
		  target:targets(*)
		`,
				)
				.single();

			if (error) {
				console.error("Error updating session:", error);
				throw new Error(`Failed to update session: ${error.message}`);
			}

			return data as Session;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
			queryClient.invalidateQueries({ queryKey: ["session", data.id] });
		},
		onError: (error) => {
			console.error("Session update failed:", error);
		},
	});
}

export function useDeleteSession() {
	const queryClient = useQueryClient();
	const { session } = useAuth();

	return useMutation({
		mutationFn: async (id: string) => {
			// Ensure user is authenticated
			if (!session?.user?.id) {
				console.error("[Delete] No user id in session:", session);
				throw new Error("User must be authenticated to delete sessions");
			}

			console.log(
				"[Delete] MutationFn called for session:",
				id,
				"user:",
				session.user.id,
			);

			const { error } = await supabase
				.from("sessions")
				.delete()
				.eq("id", id)
				.eq("user_id", session.user.id); // Ensure user owns the session

			if (error) {
				console.error("[Delete] Supabase error:", error);
				throw new Error(`Failed to delete session: ${error.message}`);
			}

			console.log("[Delete] Session deleted successfully:", id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
		},
		onError: (error) => {
			console.error("Session deletion failed:", error);
		},
	});
}
