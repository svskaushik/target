import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";

export interface SessionAnalytics {
	id: string;
	name: string;
	date: string;
	total_score: number;
	max_score: number;
	target_count: number;
	shot_count: number;
}

export interface PerformanceMetrics {
	totalSessions: number;
	totalTargets: number;
	totalShots: number;
	averageScore: number;
	bestScore: number;
	accuracyRate: number;
	improvementTrend: number; // Percentage change from previous period
}

export interface PerformanceTrend {
	date: string;
	score: number;
	maxScore: number;
	accuracy: number;
}

// Helper function to calculate shot score based on target zones
function calculateShotScore(x: number, y: number, targetZones: any[]): number {
	// Convert coordinates to center-based (0,0 at center, range -50 to 50)
	const centerX = x - 50;
	const centerY = y - 50;
	const distance = Math.sqrt(centerX * centerX + centerY * centerY);
	const distanceRatio = distance / 50; // Normalize to 0-1 range

	// Find the zone this shot falls into
	for (const zone of targetZones.sort((a, b) => a.params.radiusRatio - b.params.radiusRatio)) {
		if (distanceRatio <= zone.params.radiusRatio) {
			return zone.score_value;
		}
	}
	
	return 0; // Miss
}

// Get comprehensive analytics data
export function useAnalytics() {
	return useQuery({
		queryKey: ["analytics"],
		queryFn: async (): Promise<PerformanceMetrics> => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error("Not authenticated");

			// Get sessions with target information
			const { data: sessions, error: sessionsError } = await supabase
				.from("sessions")
				.select(`
					id, 
					name, 
					date,
					target_id,
					targets (
						id,
						name,
						target_type_id,
						target_types (
							id,
							name,
							zone_definitions
						)
					)
				`)
				.eq("user_id", user.id)
				.order("date", { ascending: false });

			if (sessionsError) throw sessionsError;

			// Get all shot placements for these sessions
			const sessionIds = sessions?.map(s => s.id) || [];
			const { data: shots, error: shotsError } = await supabase
				.from("shot_placements")
				.select("id, session_id, x_coordinate, y_coordinate, shot_number")
				.in("session_id", sessionIds);

			if (shotsError) throw shotsError;

			// Calculate metrics
			const totalSessions = sessions?.length || 0;
			const totalTargets = new Set(sessions?.map(s => s.target_id)).size || 0;
			const totalShots = shots?.length || 0;

			// Calculate scores for each session
			const sessionScores: { sessionId: string; totalScore: number; maxScore: number; shotCount: number }[] = [];
			
			sessions?.forEach(session => {
				const sessionShots = shots?.filter(shot => shot.session_id === session.id) || [];
				const targetZones = session.targets?.target_types?.zone_definitions || [];
				
				let sessionTotalScore = 0;
				sessionShots.forEach(shot => {
					const score = calculateShotScore(
						parseFloat(shot.x_coordinate), 
						parseFloat(shot.y_coordinate), 
						targetZones
					);
					sessionTotalScore += score;
				});

				// Calculate max possible score (assuming perfect shots)
				const maxPossibleScore = targetZones.length > 0 
					? Math.max(...targetZones.map(z => z.score_value)) * sessionShots.length
					: sessionShots.length * 10; // Default to 10 if no zones

				sessionScores.push({
					sessionId: session.id,
					totalScore: sessionTotalScore,
					maxScore: maxPossibleScore,
					shotCount: sessionShots.length
				});
			});

			// Calculate overall metrics
			const allScores = sessionScores.map(s => s.totalScore);
			const allMaxScores = sessionScores.map(s => s.maxScore);

			const averageScore = allScores.length > 0
				? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
				: 0;

			const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0;

			// Calculate accuracy rate as percentage of max possible
			const totalActualScore = allScores.reduce((sum, score) => sum + score, 0);
			const totalMaxScore = allMaxScores.reduce((sum, score) => sum + score, 0);
			const accuracyRate = totalMaxScore > 0 ? (totalActualScore / totalMaxScore) * 100 : 0;

			// Calculate improvement trend (last 5 sessions vs previous 5)
			const recentSessions = sessionScores.slice(0, 5);
			const previousSessions = sessionScores.slice(5, 10);

			const recentAverage = recentSessions.length > 0
				? recentSessions.reduce((sum, s) => sum + s.totalScore, 0) / recentSessions.length
				: 0;

			const previousAverage = previousSessions.length > 0
				? previousSessions.reduce((sum, s) => sum + s.totalScore, 0) / previousSessions.length
				: 0;

			const improvementTrend = previousAverage > 0
				? ((recentAverage - previousAverage) / previousAverage) * 100
				: 0;

			return {
				totalSessions,
				totalTargets,
				totalShots,
				averageScore,
				bestScore,
				accuracyRate,
				improvementTrend,
			};
		},
	});
}

// Get performance trend data for charts
export function usePerformanceTrend(days: number = 30) {
	return useQuery({
		queryKey: ["performance-trend", days],
		queryFn: async (): Promise<PerformanceTrend[]> => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error("Not authenticated");

			const startDate = new Date();
			startDate.setDate(startDate.getDate() - days);

			// Get sessions in date range
			const { data: sessions, error: sessionsError } = await supabase
				.from("sessions")
				.select("id, date")
				.eq("user_id", user.id)
				.gte("date", startDate.toISOString())
				.order("date", { ascending: true });

			if (sessionsError) throw sessionsError;

			// Get sessions with target information
			const { data: sessionsWithTargets, error: sessionsError2 } = await supabase
				.from("sessions")
				.select(`
					id, 
					date,
					targets (
						target_types (
							zone_definitions
						)
					)
				`)
				.eq("user_id", user.id)
				.gte("date", startDate.toISOString())
				.order("date", { ascending: true });

			if (sessionsError2) throw sessionsError2;

			if (!sessionsWithTargets || sessionsWithTargets.length === 0) return [];

			// Get shot placements for these sessions
			const sessionIds = sessionsWithTargets.map(s => s.id);
			const { data: shots, error: shotsError } = await supabase
				.from("shot_placements")
				.select("session_id, x_coordinate, y_coordinate")
				.in("session_id", sessionIds);

			if (shotsError) throw shotsError;

			return sessionsWithTargets.map(session => {
				const sessionShots = shots?.filter(shot => shot.session_id === session.id) || [];
				const targetZones = session.targets?.target_types?.zone_definitions || [];
				
				let totalScore = 0;
				sessionShots.forEach(shot => {
					const score = calculateShotScore(
						parseFloat(shot.x_coordinate), 
						parseFloat(shot.y_coordinate), 
						targetZones
					);
					totalScore += score;
				});

				const maxScore = targetZones.length > 0 
					? Math.max(...targetZones.map(z => z.score_value)) * sessionShots.length
					: sessionShots.length * 10;

				const accuracy = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

				return {
					date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
					score: totalScore,
					maxScore,
					accuracy
				};
			});
		},
	});
}

// Get recent session analytics
export function useRecentSessions(limit: number = 10) {
	return useQuery({
		queryKey: ["recent-sessions", limit],
		queryFn: async (): Promise<SessionAnalytics[]> => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error("Not authenticated");

			// Get recent sessions with target information
			const { data: sessions, error: sessionsError } = await supabase
				.from("sessions")
				.select(`
					id,
					name,
					date,
					targets (
						target_types (
							zone_definitions
						)
					)
				`)
				.eq("user_id", user.id)
				.order("date", { ascending: false })
				.limit(limit);

			if (sessionsError) throw sessionsError;

			if (!sessions || sessions.length === 0) return [];

			// Get shot placements for these sessions
			const sessionIds = sessions.map(s => s.id);
			const { data: shots, error: shotsError } = await supabase
				.from("shot_placements")
				.select("session_id, x_coordinate, y_coordinate")
				.in("session_id", sessionIds);

			if (shotsError) throw shotsError;

			return sessions.map(session => {
				const sessionShots = shots?.filter(shot => shot.session_id === session.id) || [];
				const targetZones = session.targets?.target_types?.zone_definitions || [];
				
				let totalScore = 0;
				sessionShots.forEach(shot => {
					const score = calculateShotScore(
						parseFloat(shot.x_coordinate), 
						parseFloat(shot.y_coordinate), 
						targetZones
					);
					totalScore += score;
				});

				const maxScore = targetZones.length > 0 
					? Math.max(...targetZones.map(z => z.score_value)) * sessionShots.length
					: sessionShots.length * 10;

				return {
					id: session.id,
					name: session.name,
					date: session.date,
					total_score: totalScore,
					max_score: maxScore,
					target_count: 1, // Each session has one target
					shot_count: sessionShots.length
				};
			});
		},
	});
}

// Get discipline-specific analytics
export function useDisciplineAnalytics() {
	return useQuery({
		queryKey: ["discipline-analytics"],
		queryFn: async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error("Not authenticated");

			const { data: targets, error } = await supabase
				.from("targets")
				.select(
					`
					id,
					total_score,
					max_score,
					target_types (
						id,
						name,
						disciplines (
							id,
							name
						)
					)
				`,
				)
				.eq("user_id", user.id);

			if (error) throw error;

			// Group by discipline
			const disciplineStats =
				targets?.reduce(
					(acc, target) => {
						const disciplineName =
							target.target_types?.disciplines?.name || "Unknown";

						if (!acc[disciplineName]) {
							acc[disciplineName] = {
								name: disciplineName,
								targetCount: 0,
								totalScore: 0,
								maxScore: 0,
								averageScore: 0,
							};
						}

						acc[disciplineName].targetCount++;
						acc[disciplineName].totalScore += target.total_score || 0;
						acc[disciplineName].maxScore += target.max_score || 100;

						return acc;
					},
					{} as Record<string, any>,
				) || {};

			// Calculate averages
			Object.values(disciplineStats).forEach((discipline: any) => {
				discipline.averageScore =
					discipline.targetCount > 0
						? discipline.totalScore / discipline.targetCount
						: 0;
			});

			return Object.values(disciplineStats);
		},
	});
}
