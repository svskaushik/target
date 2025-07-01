import React from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { TargetButton } from '@/components/ui/target-button';
import { H1, Muted } from '@/components/ui/typography';
import { TargetCardSkeleton, SessionCardSkeleton } from '@/components/ui/loading-skeleton';
import { Plus, Target, List, TrendingUp } from 'lucide-react-native';
import { useTargets } from '@/hooks/useTargets';
import { useSessions } from '@/hooks/useSessions';
import { useTotalShots } from '@/hooks/useShotPlacements';

export default function Home() {
  const { data: targets, isLoading: targetsLoading } = useTargets();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { data: totalShots, isLoading: shotsLoading } = useTotalShots();

  const recentTargets = targets?.slice(0, 3) || [];
  const recentSessions = sessions?.slice(0, 3) || [];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <H1 className="text-2xl font-bold text-gray-900 mb-2">Target Sheet</H1>
          <Muted className="text-gray-600">Track your shooting performance</Muted>
        </View>

        {/* Quick Actions */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
          <View className="flex-row space-x-3">
            <TargetButton
              variant="primary"
              className="flex-1 py-4"
              onPress={() => router.push('/target/create' as any)}
              accessibilityLabel="Create new target"
              accessibilityHint="Opens the target creation form"
            >
              <View className="items-center">
                <Plus size={20} color="white" />
                <Text className="text-white font-semibold mt-1">New Target</Text>
              </View>
            </TargetButton>
            
            <TargetButton
              variant="secondary"
              className="flex-1 py-4"
              onPress={() => router.push('/session/create' as any)}
              accessibilityLabel="Create new session"
              accessibilityHint="Opens the session creation form"
            >
              <View className="items-center">
                <Target size={20} color="#374151" />
                <Text className="text-gray-700 font-semibold mt-1">New Session</Text>
              </View>
            </TargetButton>
          </View>
        </View>

        {/* Stats Overview */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Overview</Text>
          <View className="flex-row space-x-3">
            <View className="flex-1 bg-white p-4 rounded-lg border border-gray-200">
              <Target size={24} color="#2563eb" />
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {targets?.length || 0}
              </Text>
              <Text className="text-gray-600 text-sm">Targets</Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-lg border border-gray-200">
              <List size={24} color="#059669" />
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {sessions?.length || 0}
              </Text>
              <Text className="text-gray-600 text-sm">Sessions</Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-lg border border-gray-200">
              <TrendingUp size={24} color="#dc2626" />
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {shotsLoading ? '...' : totalShots ?? 0}
              </Text>
              <Text className="text-gray-600 text-sm">Shots</Text>
            </View>
          </View>
        </View>

        {/* Recent Targets */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">Recent Targets</Text>
            <TargetButton
              variant="ghost"
              size="sm"
              onPress={() => router.push('/targets' as any)}
            >
              <Text className="text-blue-600">View All</Text>
            </TargetButton>
          </View>
          
          {targetsLoading ? (
            <View className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <TargetCardSkeleton key={index} />
              ))}
            </View>
          ) : recentTargets.length > 0 ? (
            <View className="space-y-3">
              {recentTargets.map((target) => (
                <View
                  key={target.id}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <TargetButton
                    variant="ghost"
                    className="items-start justify-start p-0"
                    onPress={() => router.push(`/target/${target.id}` as any)}
                  >
                    <Text className="font-semibold text-gray-900">{target.name}</Text>
                    <Text className="text-gray-600 text-sm">
                      {target.distance}m • {target.target_type}
                    </Text>
                  </TargetButton>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white p-8 rounded-lg border border-gray-200 items-center">
              <Target size={48} color="#9ca3af" />
              <Text className="text-gray-500 mt-2">No targets yet</Text>
              <Text className="text-gray-400 text-sm text-center mt-1 mb-4">
                Create your first target to get started
              </Text>
              <TargetButton
                variant="primary"
                onPress={() => router.push('/target/create' as any)}
              >
                <View className="flex-row items-center">
                  <Plus size={16} color="white" />
                  <Text className="text-white font-semibold ml-2">Create Target</Text>
                </View>
              </TargetButton>
            </View>
          )}
        </View>

        {/* Recent Sessions */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">Recent Sessions</Text>
            <TargetButton
              variant="ghost"
              size="sm"
              onPress={() => router.push('/sessions' as any)}
            >
              <Text className="text-blue-600">View All</Text>
            </TargetButton>
          </View>
          
          {sessionsLoading ? (
            <View className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <SessionCardSkeleton key={index} />
              ))}
            </View>
          ) : recentSessions.length > 0 ? (
            <View className="space-y-3">
              {recentSessions.map((session) => (
                <View
                  key={session.id}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <TargetButton
                    variant="ghost"
                    className="items-start justify-start p-0"
                    onPress={() => router.push(`/session/${session.id}` as any)}
                  >
                    <Text className="font-semibold text-gray-900">{session.name}</Text>
                    <Text className="text-gray-600 text-sm">
                      {new Date(session.date).toLocaleDateString()} • {session.target?.name}
                    </Text>
                  </TargetButton>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white p-8 rounded-lg border border-gray-200 items-center">
              <List size={48} color="#9ca3af" />
              <Text className="text-gray-500 mt-2">No sessions yet</Text>
              <Text className="text-gray-400 text-sm text-center mt-1 mb-4">
                Create your first session to start tracking
              </Text>
              <TargetButton
                variant="primary"
                onPress={() => router.push('/session/create' as any)}
              >
                <View className="flex-row items-center">
                  <Plus size={16} color="white" />
                  <Text className="text-white font-semibold ml-2">Create Session</Text>
                </View>
              </TargetButton>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
