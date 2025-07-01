import React from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SessionForm } from '@/components/forms/SessionForm';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { useCreateSession } from '@/hooks/useSessions';
import type { CreateSessionData } from '@/lib/types';

export default function CreateSessionScreen() {
  const { targetId } = useLocalSearchParams<{ targetId?: string }>();
  const createSessionMutation = useCreateSession();

  const handleSubmit = async (data: CreateSessionData) => {
    try {
      const session = await createSessionMutation.mutateAsync(data);
      // Immediately navigate to the new session's detail page
      router.replace(`/session/${session.id}` as any);
    } catch (error) {
      Alert.alert('Error', 'Failed to create session. Please try again.');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <SessionForm
        onSubmit={handleSubmit}
        preselectedTargetId={targetId}
        isLoading={createSessionMutation.isPending}
      />
      
      {/* Quick navigation to home */}
      <FloatingActionButton 
        icon="home"
        position="bottom-right"
      />
    </View>
  );
}
