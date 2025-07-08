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
			if (!session?.user?.id) throw new Error("Not authenticated");
			// Remove all current
			await supabase
				.from("user_disciplines")
				.delete()
				.eq("user_id", session.user.id);
			// Insert new
			const validIds = (disciplineIds || []).filter(
				(id) => typeof id === "string" && id.length > 0,
			);
			if (validIds.length > 0) {
				const inserts = validIds.map((id) => ({
					user_id: session.user.id,
					discipline_id: id,
				}));
				console.log("Inserting user_disciplines:", inserts);
				const { error } = await supabase
					.from("user_disciplines")
					.insert(inserts);
				if (error) {
					console.error("Supabase insert error:", error, inserts);
					throw error;
				}
			} else {
				console.log("No valid discipline IDs to insert.");
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user_disciplines"] });
		},
	});
}
