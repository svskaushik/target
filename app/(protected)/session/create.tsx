import React from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SessionForm } from '@/components/forms/SessionForm';
import { useCreateSession } from '@/hooks/useSessions';
import type { CreateSessionData } from '@/lib/types';

export default function CreateSessionScreen() {
  const { targetId } = useLocalSearchParams<{ targetId?: string }>();
  const createSessionMutation = useCreateSession();

  const handleSubmit = async (data: CreateSessionData) => {
    try {
      const session = await createSessionMutation.mutateAsync(data);
      Alert.alert(
        'Success', 
        'Session created successfully! Would you like to start shooting?',
        [
          { text: 'Later', onPress: () => router.back() },
          { text: 'Start Shooting', onPress: () => router.replace(`/session/shoot/${session.id}` as any) }
        ]
      );
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
    </View>
  );
}
