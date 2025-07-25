import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/supabase-provider";
import type { Discipline } from "@/lib/types";

export function useUserDisciplines() {
	const { session } = useAuth();
	return useQuery({
		queryKey: ["user_disciplines", session?.user?.id],
		queryFn: async () => {
			if (!session?.user?.id) return [];
			const { data, error } = await supabase
				.from("user_disciplines")
				.select("discipline_id")
				.eq("user_id", session.user.id);
			if (error) throw error;
			// Return array of discipline_id strings
			return (data || [])
				.map((row: any) => row.discipline_id)
				.filter((id: string) => !!id);
		},
		enabled: !!session?.user?.id,
	});
}

export function useUpdateUserDisciplines() {
	const { session } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (disciplineIds: string[]) => {
			if (!session?.user?.id) {
				throw new Error("Not authenticated - please sign in again");
			}

			console.log("Updating disciplines for user:", session.user.id);
			console.log("Discipline IDs:", disciplineIds);

			// Validate discipline IDs
			const validIds = (disciplineIds || []).filter(
				(id) => typeof id === "string" && id.length > 0,
			);

			if (validIds.length === 0) {
				throw new Error("At least one discipline must be selected");
			}

			// First, verify the disciplines exist
			const { data: existingDisciplines, error: disciplineError } =
				await supabase.from("disciplines").select("id").in("id", validIds);

			if (disciplineError) {
				console.error("Error checking disciplines:", disciplineError);
				throw new Error("Failed to verify disciplines");
			}

			if (
				!existingDisciplines ||
				existingDisciplines.length !== validIds.length
			) {
				throw new Error("Some selected disciplines are invalid");
			}

			// Remove all current disciplines for this user
			const { error: deleteError } = await supabase
				.from("user_disciplines")
				.delete()
				.eq("user_id", session.user.id);

			if (deleteError) {
				console.error("Error deleting existing disciplines:", deleteError);
				// Don't throw here, continue with insert
			}

			// Insert new disciplines
			const inserts = validIds.map((id) => ({
				user_id: session.user.id,
				discipline_id: id,
			}));

			console.log("Inserting user_disciplines:", inserts);

			const { data, error: insertError } = await supabase
				.from("user_disciplines")
				.insert(inserts)
				.select();

			if (insertError) {
				console.error("Supabase insert error:", insertError);

				// Provide more specific error messages
				if (insertError.code === "23503") {
					if (insertError.message.includes("user_id")) {
						throw new Error(
							"User account not found. Please sign out and sign in again.",
						);
					} else if (insertError.message.includes("discipline_id")) {
						throw new Error("Invalid discipline selected. Please try again.");
					}
				}

				throw new Error(`Failed to save disciplines: ${insertError.message}`);
			}

			console.log("Successfully inserted disciplines:", data);
			return data;
		},
		onSuccess: () => {
			// Invalidate all related queries
			queryClient.invalidateQueries({ queryKey: ["user_disciplines"] });
			queryClient.invalidateQueries({ queryKey: ["targets"] });
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
		},
		onError: (error) => {
			console.error("Failed to update user disciplines:", error);
		},
	});
}
