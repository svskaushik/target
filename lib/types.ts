export interface Target {
  id: string;
  user_id: string;
  name: string;
  distance: number;
  target_type: 'bullseye' | 'silhouette' | 'custom';
  image_url?: string;
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
  preferred_units: 'metric' | 'imperial';
  shooting_discipline?: string;
  created_at: string;
  updated_at: string;
}

// Form types
export interface CreateTargetData {
  name: string;
  distance: number;
  target_type: 'bullseye' | 'silhouette' | 'custom';
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
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
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
