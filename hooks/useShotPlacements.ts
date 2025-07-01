import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/context/supabase-provider';
import type { ShotPlacement, CreateShotPlacementData } from '@/lib/types';

export function useShotPlacements(sessionId: string) {
  return useQuery({
    queryKey: ['shotPlacements', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shot_placements')
        .select('*')
        .eq('session_id', sessionId)
        .order('shot_number', { ascending: true });
      
      if (error) {
        console.error('Error fetching shot placements:', error);
        throw error;
      }
      return data as ShotPlacement[];
    },
    enabled: !!sessionId,
  });
}

export function useCreateShotPlacement() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  
  return useMutation({
    mutationFn: async (shotData: CreateShotPlacementData) => {
      // Ensure user is authenticated
      if (!session?.user?.id) {
        throw new Error('User must be authenticated to create shot placements');
      }

      // Verify the session belongs to the user (RLS compliance)
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('id')
        .eq('id', shotData.session_id)
        .eq('user_id', session.user.id)
        .single();

      if (sessionError || !sessionData) {
        throw new Error('Session not found or access denied');
      }

      console.log('Creating shot placement for session:', shotData.session_id, 'user:', session.user.id);
      
      const { data, error } = await supabase
        .from('shot_placements')
        .insert({
          ...shotData,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating shot placement:', error);
        throw new Error(`Failed to create shot placement: ${error.message}`);
      }
      
      console.log('Shot placement created successfully:', data);
      return data as ShotPlacement;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shotPlacements', data.session_id] });
    },
    onError: (error) => {
      console.error('Shot placement creation failed:', error);
    },
  });
}

export function useDeleteShotPlacement() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Ensure user is authenticated
      if (!session?.user?.id) {
        throw new Error('User must be authenticated to delete shot placements');
      }

      // Get the shot to know which session to invalidate and verify ownership
      const { data: shot, error: fetchError } = await supabase
        .from('shot_placements')
        .select('session_id')
        .eq('id', id)
        .single();
        
      if (fetchError || !shot) {
        throw new Error('Shot placement not found');
      }

      // Verify the session belongs to the user
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('id')
        .eq('id', shot.session_id)
        .eq('user_id', session.user.id)
        .single();

      if (sessionError || !sessionData) {
        throw new Error('Access denied: Session does not belong to user');
      }

      console.log('Deleting shot placement:', id, 'for user:', session.user.id);
      
      const { error } = await supabase
        .from('shot_placements')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting shot placement:', error);
        throw new Error(`Failed to delete shot placement: ${error.message}`);
      }
      
      console.log('Shot placement deleted successfully:', id);
      return shot.session_id;
    },
    onSuccess: (sessionId) => {
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: ['shotPlacements', sessionId] });
      }
    },
    onError: (error) => {
      console.error('Shot placement deletion failed:', error);
    },
  });
}

export function useClearSessionShots() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  
  return useMutation({
    mutationFn: async (sessionId: string) => {
      // Ensure user is authenticated
      if (!session?.user?.id) {
        throw new Error('User must be authenticated to clear session shots');
      }

      // Verify the session belongs to the user
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('id')
        .eq('id', sessionId)
        .eq('user_id', session.user.id)
        .single();

      if (sessionError || !sessionData) {
        throw new Error('Access denied: Session does not belong to user');
      }

      console.log('Clearing shots for session:', sessionId, 'user:', session.user.id);
      
      const { error } = await supabase
        .from('shot_placements')
        .delete()
        .eq('session_id', sessionId);
        
      if (error) {
        console.error('Error clearing session shots:', error);
        throw new Error(`Failed to clear session shots: ${error.message}`);
      }
      
      console.log('Session shots cleared successfully:', sessionId);
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['shotPlacements', sessionId] });
    },
    onError: (error) => {
      console.error('Clear session shots failed:', error);
    },
  });
}

// New: Fetch total shots for the current user
export function useTotalShots() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ['totalShots', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      // First, get all session ids for this user
      const { data: sessions, error: sessionError } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', session.user.id);
      if (sessionError) {
        console.error('Error fetching user sessions for total shots:', sessionError);
        throw sessionError;
      }
      const sessionIds = (sessions || []).map((s: any) => s.id);
      if (!sessionIds.length) return 0;
      // Now count all shots for those session ids
      const { count, error } = await supabase
        .from('shot_placements')
        .select('*', { count: 'exact', head: true })
        .in('session_id', sessionIds);
      if (error) {
        console.error('Error fetching total shots:', error);
        throw error;
      }
      return count || 0;
    },
    enabled: !!session?.user?.id,
    staleTime: 60 * 1000,
  });
}
