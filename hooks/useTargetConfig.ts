import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { useUserDisciplines } from "./useUserDisciplines";
import type { Discipline, TargetType, ScoringSystem } from "@/lib/types";

// Fetch all disciplines
export function useDisciplines() {
	return useQuery({
		queryKey: ["disciplines"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("disciplines")
				.select("*")
				.order("name", { ascending: true });
			if (error) throw error;
			return data as Discipline[];
		},
	});
}

// Fetch only disciplines selected by the user
export function useFilteredDisciplines() {
	const { data: userDisciplines = [], isLoading } = useUserDisciplines();
	const { data: allDisciplines = [], isLoading: loadingAll } = useDisciplines();
	if (isLoading || loadingAll) return { data: [], isLoading: true };
	const userDisciplineIds = userDisciplines.map((ud: any) => ud.discipline_id);
	const filtered = allDisciplines.filter((d) =>
		userDisciplineIds.includes(d.id),
	);
	return { data: filtered, isLoading: false };
}

// Fetch all target types
export function useTargetTypes() {
	return useQuery({
		queryKey: ["target_types"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("target_types")
				.select("*")
				.order("name", { ascending: true });
			if (error) throw error;
			return data as TargetType[];
		},
	});
}

// Fetch all scoring systems
export function useScoringSystems() {
	return useQuery({
		queryKey: ["scoring_systems"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("scoring_systems")
				.select("*")
				.order("name", { ascending: true });
			if (error) throw error;
			return data as ScoringSystem[];
		},
	});
}
