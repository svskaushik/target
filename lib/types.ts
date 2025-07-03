export interface Target {
	id: string;
	user_id: string;
	name: string;
	distance: number;
	target_type: "bullseye" | "silhouette" | "custom";
	image_url?: string;
	discipline_id?: string;
	target_type_id?: string;
	zone_config?: TargetZone[]; // Optional per-target override
	created_at: string;
	updated_at: string;
}

export interface Session {
	id: string;
	user_id: string;
	target_id: string;
	name: string;
	date: string;
	weather_conditions?: {
		temperature?: number;
		humidity?: number;
		wind_speed?: number;
		wind_direction?: string;
	};
	notes?: string;
	created_at: string;
	target?: Target;
}

export interface ShotPlacement {
	id: string;
	session_id: string;
	x_coordinate: number;
	y_coordinate: number;
	shot_number: number;
	timestamp: string;
}

export interface ApertureSetting {
	id: string;
	user_id: string;
	name: string;
	value: number;
	is_default: boolean;
	created_at: string;
}

export interface ElevationSetting {
	id: string;
	user_id: string;
	name: string;
	value: number;
	is_default: boolean;
	created_at: string;
}

export interface Profile {
	id: string;
	first_name?: string;
	last_name?: string;
	username?: string;
	avatar_url?: string;
	bio?: string;
	preferred_units: "metric" | "imperial";
	shooting_discipline?: string;
	created_at: string;
	updated_at: string;
}
export interface Discipline {
	id: string;
	name: string;
	description?: string;
}

export interface TargetType {
	id: string;
	name: string;
	shape: "bullseye" | "silhouette" | "polygon" | "custom";
	zone_definitions: TargetZone[];
	scoring_system_id: string;
}

export interface TargetZone {
	id?: string;
	label: string;
	shape: "circle" | "polygon" | "rectangle" | "custom";
	// For circles: radiusRatio (0-1), for polygons: points, for rectangle: width/height ratios, etc.
	params: Record<string, any>;
	score_value: number;
}

export interface ScoringSystem {
	id: string;
	name: string;
	logic: Record<string, number> | string; // zone label to score, or custom logic as string
}

// Form types
export interface CreateTargetData {
	name: string;
	distance: number;
	discipline_id: string;
	target_type_id: string;
	image_url?: string;
}

export interface CreateSessionData {
	target_id: string;
	name: string;
	date?: string;
	weather_conditions?: {
		temperature?: number;
		humidity?: number;
		wind_speed?: number;
		wind_direction?: string;
	};
	notes?: string;
}

export interface CreateShotPlacementData {
	session_id: string;
	x_coordinate: number;
	y_coordinate: number;
	shot_number: number;
}

// UI Types
export interface ButtonProps {
	variant?: "primary" | "secondary" | "danger" | "ghost";
	size?: "sm" | "md" | "lg";
	children: React.ReactNode;
	className?: string;
	onPress?: () => void;
	disabled?: boolean;
}

export interface TargetCanvasProps {
	targetImageUrl?: string;
	shots: ShotPlacement[];
	onShotPlaced?: (x: number, y: number) => void;
	readonly?: boolean;
	width?: number;
	height?: number;
}
