import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { TargetButton } from '@/components/ui/target-button';
import { Input } from '@/components/ui/input';
import { SessionCardSkeleton } from '@/components/ui/loading-skeleton';
import { Plus, Search, Calendar, Trash2 } from 'lucide-react-native';
import { useSessions, useDeleteSession } from '@/hooks/useSessions';

export default function SessionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: sessions, isLoading, refetch } = useSessions();
  const deleteSessionMutation = useDeleteSession();

  const filteredSessions = sessions?.filter(session =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.target?.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDeleteSession = (sessionId: string, sessionName: string) => {
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete "${sessionName}"? This will also delete all associated shots.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSessionMutation.mutateAsync(sessionId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete session. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-bold text-gray-900">Sessions</Text>
          <TargetButton
            variant="primary"
            size="sm"
            onPress={() => router.push('/session/create' as any)}
          >
            <View className="flex-row items-center">
              <Plus size={16} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </View>
          </TargetButton>
        </View>
        
        {/* Search */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Search size={20} color="#6b7280" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 bg-transparent border-0"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View className="p-4">
          {isLoading ? (
            <View className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <SessionCardSkeleton key={index} />
              ))}
            </View>
          ) : filteredSessions.length > 0 ? (
            <View className="space-y-3">
              {filteredSessions.map((session) => (
                <View
                  key={session.id}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <TargetButton
                        variant="ghost"
                        className="items-start justify-start p-0"
                        onPress={() => router.push(`/session/${session.id}` as any)}
                      >
                        <Text className="font-semibold text-gray-900 text-lg">
                          {session.name}
                        </Text>
                        <Text className="text-gray-600 text-sm mt-1">
                          {new Date(session.date).toLocaleDateString()} • {session.target?.name}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {session.target?.distance}m • {session.target?.target_type}
                        </Text>
                        {session.notes && (
                          <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
                            {session.notes}
                          </Text>
                        )}
                        <Text className="text-gray-400 text-xs mt-1">
                          Created {new Date(session.created_at).toLocaleDateString()}
                        </Text>
                      </TargetButton>
                    </View>
                    <TargetButton
                      variant="ghost"
                      size="sm"
                      onPress={() => handleDeleteSession(session.id, session.name)}
                    >
                      <Trash2 size={16} color="#dc2626" />
                    </TargetButton>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white p-8 rounded-lg border border-gray-200 items-center">
              <Calendar size={48} color="#9ca3af" />
              <Text className="text-gray-500 mt-2 text-center">
                {searchQuery ? 'No sessions found' : 'No sessions yet'}
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-1 mb-4">
                {searchQuery ? 'Try adjusting your search' : 'Create your first session to get started'}
              </Text>
              {!searchQuery && (
                <TargetButton
                  variant="primary"
                  onPress={() => router.push('/session/create' as any)}
                >
                  <View className="flex-row items-center">
                    <Plus size={16} color="white" />
                    <Text className="text-white font-semibold ml-2">Create Session</Text>
                  </View>
                </TargetButton>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
