import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { TargetButton } from '@/components/ui/target-button';
import { TargetCanvas } from '@/components/target/TargetCanvas';
import { useSession } from '@/hooks/useSessions';
import { useShotPlacements, useCreateShotPlacement, useClearSessionShots } from '@/hooks/useShotPlacements';
import { Save, RotateCcw, Eye } from 'lucide-react-native';

export default function ShootingSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [shotCount, setShotCount] = useState(0);
  
  const { data: session, isLoading: sessionLoading } = useSession(id!);
  const { data: shots, isLoading: shotsLoading } = useShotPlacements(id!);
  const createShotMutation = useCreateShotPlacement();
  const clearShotsMutation = useClearSessionShots();

  const handleShotPlaced = async (x: number, y: number) => {
    if (!session) return;

    try {
      await createShotMutation.mutateAsync({
        session_id: session.id,
        x_coordinate: x,
        y_coordinate: y,
        shot_number: (shots?.length || 0) + 1,
      });
      setShotCount(prev => prev + 1);
    } catch (error) {
      Alert.alert('Error', 'Failed to record shot placement');
    }
  };

  const handleSaveSession = () => {
    Alert.alert(
      'Session Complete',
      `You've recorded ${shots?.length || 0} shots. Save this session?`,
      [
        { text: 'Continue Shooting', style: 'cancel' },
        {
          text: 'Save & Exit',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleResetShots = () => {
    Alert.alert(
      'Reset Shots',
      'Are you sure you want to clear all shot placements?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            if (session) {
              try {
                await clearShotsMutation.mutateAsync(session.id);
                setShotCount(0);
              } catch (error) {
                Alert.alert('Error', 'Failed to clear shots');
              }
            }
          },
        },
      ]
    );
  };

  const handleViewSession = () => {
    router.push(`/session/${id}` as any);
  };

  if (sessionLoading || shotsLoading || !session) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Loading session...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-lg font-bold text-gray-900">{session.name}</Text>
        <Text className="text-gray-600">
          {session.target?.name} • {session.target?.distance}m
        </Text>
        <Text className="text-blue-600 font-medium">
          Shots: {shots?.length || 0}
        </Text>
      </View>

      {/* Target Canvas */}
      <View className="flex-1 justify-center items-center p-4">
        <TargetCanvas
          targetImageUrl={session.target?.image_url}
          shots={shots || []}
          onShotPlaced={handleShotPlaced}
          readonly={false}
        />
      </View>

      {/* Controls */}
      <View className="p-4 bg-white border-t border-gray-200">
        <View className="flex-row space-x-3 mb-3">
          <TargetButton
            variant="ghost"
            className="flex-1"
            onPress={handleViewSession}
          >
            <View className="flex-row items-center justify-center">
              <Eye size={18} color="#374151" />
              <Text className="text-gray-700 font-semibold ml-2">View</Text>
            </View>
          </TargetButton>
          
          <TargetButton
            variant="secondary"
            className="flex-1"
            onPress={handleResetShots}
          >
            <View className="flex-row items-center justify-center">
              <RotateCcw size={18} color="#374151" />
              <Text className="text-gray-700 font-semibold ml-2">Reset</Text>
            </View>
          </TargetButton>
        </View>
        
        <TargetButton
          variant="primary"
          className="w-full"
          onPress={handleSaveSession}
        >
          <View className="flex-row items-center justify-center">
            <Save size={18} color="white" />
            <Text className="text-white font-semibold ml-2">Save Session</Text>
          </View>
        </TargetButton>
      </View>
    </View>
  );
}
