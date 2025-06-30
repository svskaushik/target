import React from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { TargetForm } from '@/components/forms/TargetForm';
import { useTarget, useUpdateTarget } from '@/hooks/useTargets';
import type { CreateTargetData } from '@/lib/types';

export default function EditTargetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: target, isLoading: targetLoading } = useTarget(id!);
  const updateTargetMutation = useUpdateTarget();

  const handleSubmit = async (data: CreateTargetData) => {
    if (!target) return;
    
    try {
      await updateTargetMutation.mutateAsync({ id: target.id, ...data });
      Alert.alert('Success', 'Target updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update target. Please try again.');
    }
  };

  if (targetLoading || !target) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Loading target...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <TargetForm
        onSubmit={handleSubmit}
        initialData={target}
        isLoading={updateTargetMutation.isPending}
      />
    </View>
  );
}
