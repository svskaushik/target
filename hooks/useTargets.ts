import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/supabase-provider";
import { useUserDisciplines } from "./useUserDisciplines";
import type { Target, CreateTargetData } from "@/lib/types";

export function useTargets() {
	const { data: userDisciplines = [], isLoading } = useUserDisciplines();
	const { session } = useAuth();
	return useQuery({
		queryKey: ["targets", userDisciplines.map((d) => d.id)],
		queryFn: async () => {
			if (isLoading) return [];
			if (!session?.user?.id) return [];
			const disciplineIds = userDisciplines
				.map((d) => d.id)
				.filter((id) => !!id);
			let query = supabase
				.from("targets")
				.select("*")
				.eq("user_id", session.user.id)
				.order("created_at", { ascending: false });
			if (disciplineIds.length > 0) {
				query = query.in("discipline_id", disciplineIds);
			}
			const { data, error } = await query;
			if (error) {
				console.error("Error fetching targets:", error);
				throw error;
			}
			return data as Target[];
		},
		enabled: !isLoading,
	});
}

export function useTarget(id: string) {
	return useQuery({
		queryKey: ["target", id],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("targets")
				.select("*")
				.eq("id", id)
				.single();

			if (error) {
				console.error("Error fetching target:", error);
				throw error;
			}
			return data as Target;
		},
		enabled: !!id,
	});
}

export function useCreateTarget() {
	const queryClient = useQueryClient();
	const { session } = useAuth();

	return useMutation({
		mutationFn: async (target: CreateTargetData) => {
			// Ensure user is authenticated
			if (!session?.user?.id) {
				throw new Error("User must be authenticated to create targets");
			}

			// Add user_id to the target data for RLS compliance
			const targetWithUserId = {
				...target,
				user_id: session.user.id,
			};

			// Remove legacy target_type if present
			delete (targetWithUserId as any).target_type;

			console.log(
				"Creating target with user_id:",
				session.user.id,
				targetWithUserId,
			);

			const { data, error } = await supabase
				.from("targets")
				.insert(targetWithUserId)
				.select()
				.single();

			if (error) {
				console.error("Error creating target:", error);
				throw new Error(`Failed to create target: ${error.message}`);
			}

			console.log("Target created successfully:", data);
			return data as Target;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["targets"] });
		},
		onError: (error) => {
			console.error("Target creation failed:", error);
		},
	});
}

export function useUpdateTarget() {
	const queryClient = useQueryClient();
	const { session } = useAuth();

	return useMutation({
		mutationFn: async ({
			id,
			...updates
		}: Partial<Target> & { id: string }) => {
			// Ensure user is authenticated
			if (!session?.user?.id) {
				throw new Error("User must be authenticated to update targets");
			}

			// Ensure the update includes user_id for RLS compliance
			const updateData = {
				...updates,
				user_id: session.user.id,
				updated_at: new Date().toISOString(),
			};

			console.log("Updating target:", id, "with user_id:", session.user.id);

			const { data, error } = await supabase
				.from("targets")
				.update(updateData)
				.eq("id", id)
				.eq("user_id", session.user.id) // Ensure user owns the target
				.select()
				.single();

			if (error) {
				console.error("Error updating target:", error);
				throw new Error(`Failed to update target: ${error.message}`);
			}

			return data as Target;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["targets"] });
			queryClient.invalidateQueries({ queryKey: ["target", data.id] });
		},
		onError: (error) => {
			console.error("Target update failed:", error);
		},
	});
}

export function useDeleteTarget() {
	const queryClient = useQueryClient();
	const { session } = useAuth();

	return useMutation({
		mutationFn: async (id: string) => {
			// Ensure user is authenticated
			if (!session?.user?.id) {
				throw new Error("User must be authenticated to delete targets");
			}

			console.log("Deleting target:", id, "for user:", session.user.id);

			const { error } = await supabase
				.from("targets")
				.delete()
				.eq("id", id)
				.eq("user_id", session.user.id); // Ensure user owns the target

			if (error) {
				console.error("Error deleting target:", error);
				throw new Error(`Failed to delete target: ${error.message}`);
			}

			console.log("Target deleted successfully:", id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["targets"] });
		},
		onError: (error) => {
			console.error("Target deletion failed:", error);
		},
	});
}
