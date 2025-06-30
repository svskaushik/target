import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { TargetButton } from '@/components/ui/target-button';
import { Input } from '@/components/ui/input';
import { TargetCardSkeleton } from '@/components/ui/loading-skeleton';
import { Plus, Search, Target as TargetIcon, Trash2 } from 'lucide-react-native';
import { useTargets, useDeleteTarget } from '@/hooks/useTargets';

export default function TargetsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: targets, isLoading, refetch } = useTargets();
  const deleteTargetMutation = useDeleteTarget();

  const filteredTargets = targets?.filter(target =>
    target.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    target.target_type.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDeleteTarget = (targetId: string, targetName: string) => {
    Alert.alert(
      'Delete Target',
      `Are you sure you want to delete "${targetName}"? This will also delete all associated sessions and shots.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTargetMutation.mutateAsync(targetId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete target. Please try again.');
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
          <Text className="text-xl font-bold text-gray-900">Targets</Text>
          <TargetButton
            variant="primary"
            size="sm"
            onPress={() => router.push('/target/create')}
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
            placeholder="Search targets..."
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
                <TargetCardSkeleton key={index} />
              ))}
            </View>
          ) : filteredTargets.length > 0 ? (
            <View className="space-y-3">
              {filteredTargets.map((target) => (
                <View
                  key={target.id}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <TargetButton
                        variant="ghost"
                        className="items-start justify-start p-0"
                        onPress={() => router.push(`/target/${target.id}`)}
                      >
                        <Text className="font-semibold text-gray-900 text-lg">
                          {target.name}
                        </Text>
                        <Text className="text-gray-600 text-sm mt-1">
                          {target.distance}m • {target.target_type}
                        </Text>
                        <Text className="text-gray-400 text-xs mt-1">
                          Created {new Date(target.created_at).toLocaleDateString()}
                        </Text>
                      </TargetButton>
                    </View>
                    <TargetButton
                      variant="ghost"
                      size="sm"
                      onPress={() => handleDeleteTarget(target.id, target.name)}
                    >
                      <Trash2 size={16} color="#dc2626" />
                    </TargetButton>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white p-8 rounded-lg border border-gray-200 items-center">
              <TargetIcon size={48} color="#9ca3af" />
              <Text className="text-gray-500 mt-2 text-center">
                {searchQuery ? 'No targets found' : 'No targets yet'}
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-1 mb-4">
                {searchQuery ? 'Try adjusting your search' : 'Create your first target to get started'}
              </Text>
              {!searchQuery && (
                <TargetButton
                  variant="primary"
                  onPress={() => router.push('/target/create')}
                >
                  <View className="flex-row items-center">
                    <Plus size={16} color="white" />
                    <Text className="text-white font-semibold ml-2">Create Target</Text>
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
