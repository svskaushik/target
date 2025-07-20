import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/supabase-provider";

export function useDistances() {
	return useQuery({
		queryKey: ["distances"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("distances")
				.select("*")
				.order("name", { ascending: true });
			if (error) throw error;
			return data;
		},
	});
}

export function useApertures(distanceId?: string) {
	return useQuery({
		queryKey: ["apertures", distanceId],
		queryFn: async () => {
			if (!distanceId) return [];
			const { data, error } = await supabase
				.from("apertures")
				.select("*")
				.eq("distance_id", distanceId)
				.order("value", { ascending: true });
			if (error) throw error;
			return data;
		},
		enabled: !!distanceId,
	});
}

export function useElevations(distanceId?: string) {
	return useQuery({
		queryKey: ["elevations", distanceId],
		queryFn: async () => {
			if (!distanceId) return [];
			const { data, error } = await supabase
				.from("elevations")
				.select("*")
				.eq("distance_id", distanceId)
				.order("value", { ascending: true });
			if (error) throw error;
			return data;
		},
		enabled: !!distanceId,
	});
}

export function useCreateDistance() {
	const queryClient = useQueryClient();
	const { session } = useAuth();
	return useMutation({
		mutationFn: async (payload: { name: string }) => {
			if (!session?.user?.id) throw new Error("Not authenticated");
			const { data, error } = await supabase
				.from("distances")
				.insert([
					{ name: payload.name, is_premade: false, user_id: session.user.id },
				])
				.select();
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["distances"] });
		},
	});
}

export function useCreateAperture() {
	const queryClient = useQueryClient();
	const { session } = useAuth();
	return useMutation({
		mutationFn: async (payload: { value: number; distance_id: string }) => {
			if (!session?.user?.id) throw new Error("Not authenticated");
			const { data, error } = await supabase
				.from("apertures")
				.insert([
					{
						value: payload.value,
						distance_id: payload.distance_id,
						is_premade: false,
						user_id: session.user.id,
					},
				])
				.select();
			if (error) throw error;
			return data;
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["apertures", variables.distance_id],
			});
		},
	});
}

export function useCreateElevation() {
	const queryClient = useQueryClient();
	const { session } = useAuth();
	return useMutation({
		mutationFn: async (payload: { value: number; distance_id: string }) => {
			if (!session?.user?.id) throw new Error("Not authenticated");
			const { data, error } = await supabase
				.from("elevations")
				.insert([
					{
						value: payload.value,
						distance_id: payload.distance_id,
						is_premade: false,
						user_id: session.user.id,
					},
				])
				.select();
			if (error) throw error;
			return data;
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["elevations", variables.distance_id],
			});
		},
	});
}

export function useDeleteDistance() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase.from("distances").delete().eq("id", id);
			if (error) throw error;
			return id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["distances"] });
		},
	});
}

export function useDeleteAperture() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase.from("apertures").delete().eq("id", id);
			if (error) throw error;
			return id;
		},
		onSuccess: (_id, variables) => {
			queryClient.invalidateQueries({ queryKey: ["apertures"] });
		},
	});
}

export function useDeleteElevation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase.from("elevations").delete().eq("id", id);
			if (error) throw error;
			return id;
		},
		onSuccess: (_id, variables) => {
			queryClient.invalidateQueries({ queryKey: ["elevations"] });
		},
	});
}
