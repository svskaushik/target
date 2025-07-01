import React from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { SessionForm } from '@/components/forms/SessionForm';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useSession, useUpdateSession } from '@/hooks/useSessions';
import type { CreateSessionData } from '@/lib/types';

export default function EditSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: session, isLoading: sessionLoading } = useSession(id!);
  const updateSessionMutation = useUpdateSession();

  const handleSubmit = async (data: CreateSessionData) => {
    if (!session) return;
    
    try {
      await updateSessionMutation.mutateAsync({ id: session.id, ...data });
      Alert.alert('Success', 'Session updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update session. Please try again.');
    }
  };

  if (sessionLoading || !session) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Loading session...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Breadcrumb Navigation */}
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Sessions', href: '/sessions' },
          { label: session.name, href: `/session/${session.id}` },
          { label: 'Edit' }
        ]}
      />
      
      <SessionForm
        onSubmit={handleSubmit}
        initialData={session}
        isLoading={updateSessionMutation.isPending}
      />
      
      {/* Quick navigation to home */}
      <FloatingActionButton 
        icon="home"
        position="bottom-right"
      />
    </View>
  );
}
