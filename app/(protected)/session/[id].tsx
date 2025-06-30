import React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { TargetButton } from '@/components/ui/target-button';
import { TargetCanvas } from '@/components/target/TargetCanvas';
import { useSession, useDeleteSession } from '@/hooks/useSessions';
import { useShotPlacements } from '@/hooks/useShotPlacements';
import { Play, Edit3, Trash2, Target as TargetIcon, Calendar } from 'lucide-react-native';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: session, isLoading: sessionLoading } = useSession(id!);
  const { data: shots, isLoading: shotsLoading } = useShotPlacements(id!);
  const deleteSessionMutation = useDeleteSession();

  const handleDeleteSession = () => {
    if (!session) return;
    
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete "${session.name}"? This will also delete all associated shots.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSessionMutation.mutateAsync(session.id);
              Alert.alert('Success', 'Session deleted successfully!', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete session. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleStartShooting = () => {
    router.push(`/session/shoot/${id}` as any);
  };

  if (sessionLoading || shotsLoading || !session) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Loading session...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white p-4 border-b border-gray-200">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {session.name}
            </Text>
            <View className="space-y-1">
              <Text className="text-gray-600">
                Target: {session.target?.name}
              </Text>
              <Text className="text-gray-600">
                Distance: {session.target?.distance}m • Type: {session.target?.target_type}
              </Text>
              <Text className="text-gray-600">
                Date: {new Date(session.date).toLocaleDateString()}
              </Text>
              <Text className="text-blue-600 font-medium">
                Shots Recorded: {shots?.length || 0}
              </Text>
            </View>
          </View>
          <View className="flex-row space-x-2">
            <TargetButton
              variant="secondary"
              size="sm"
              onPress={() => router.push(`/session/edit/${session.id}` as any)}
              accessibilityLabel="Edit session"
              accessibilityHint="Opens the session editing form"
            >
              <Edit3 size={16} color="#374151" />
            </TargetButton>
            <TargetButton
              variant="danger"
              size="sm"
              onPress={handleDeleteSession}
            >
              <Trash2 size={16} color="white" />
            </TargetButton>
          </View>
        </View>
      </View>

      {/* Weather Conditions */}
      {session.weather_conditions && (
        <View className="bg-white p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Weather Conditions</Text>
          <View className="flex-row flex-wrap space-x-4">
            {session.weather_conditions.temperature && (
              <Text className="text-gray-600">Temperature: {session.weather_conditions.temperature}°C</Text>
            )}
            {session.weather_conditions.humidity && (
              <Text className="text-gray-600">Humidity: {session.weather_conditions.humidity}%</Text>
            )}
            {session.weather_conditions.wind_speed && (
              <Text className="text-gray-600">Wind: {session.weather_conditions.wind_speed}m/s</Text>
            )}
            {session.weather_conditions.wind_direction && (
              <Text className="text-gray-600">Direction: {session.weather_conditions.wind_direction}</Text>
            )}
          </View>
        </View>
      )}

      {/* Notes */}
      {session.notes && (
        <View className="bg-white p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Notes</Text>
          <Text className="text-gray-600">{session.notes}</Text>
        </View>
      )}

      {/* Target with Shots */}
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Target with Shots</Text>
        
        {shots && shots.length > 0 ? (
          <View className="bg-white p-4 rounded-lg border border-gray-200">
            <TargetCanvas
              targetImageUrl={session.target?.image_url}
              shots={shots}
              readonly={true}
            />
          </View>
        ) : (
          <View className="bg-white p-8 rounded-lg border border-gray-200 items-center">
            <TargetIcon size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-2 text-center">
              No shots recorded yet
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-1 mb-4">
              Start shooting to see your shots on the target
            </Text>
          </View>
        )}

        {/* Action Button */}
        <TargetButton
          variant="primary"
          className="w-full mt-4"
          onPress={handleStartShooting}
        >
          <View className="flex-row items-center justify-center">
            <Play size={18} color="white" />
            <Text className="text-white font-semibold ml-2">
              {shots && shots.length > 0 ? 'Continue Shooting' : 'Start Shooting'}
            </Text>
          </View>
        </TargetButton>
      </View>
    </ScrollView>
  );
}
