import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { View, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { TargetButton } from '@/components/ui/target-button';
import { TargetCanvas } from '@/components/target/TargetCanvas';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { useSession } from '@/hooks/useSessions';
import { useShotPlacements, useCreateShotPlacement, useClearSessionShots } from '@/hooks/useShotPlacements';
import { Save, RotateCcw, Eye } from 'lucide-react-native';

export default function ShootingSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [shotCount, setShotCount] = useState(0);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [showPointsOnTarget, setShowPointsOnTarget] = useState(false);

  const { data: session, isLoading: sessionLoading } = useSession(id!);
  const { data: shots, isLoading: shotsLoading } = useShotPlacements(id!);
  const createShotMutation = useCreateShotPlacement();
  const clearShotsMutation = useClearSessionShots();

  const handleShotPlaced = async (x: number, y: number) => {
    if (!session) return;

    if (
      typeof x !== 'number' || typeof y !== 'number' ||
      isNaN(x) || isNaN(y)
    ) {
      console.error('[ShotPlacement] Invalid coordinates:', { x, y });
      // Optionally show error UI here
      return;
    }

    console.log('[ShotPlacement] Placing shot at:', { x, y });

    try {
      await createShotMutation.mutateAsync({
        session_id: session.id,
        x_coordinate: x,
        y_coordinate: y,
        shot_number: (shots?.length || 0) + 1,
      });
      setShotCount(prev => prev + 1);
    } catch (error) {
      // Optionally show error UI here
    }
  };

  const handleSaveSession = () => {
    setSaveModalVisible(true);
  };

  const confirmSaveSession = () => {
    setSaveModalVisible(false);
    router.back();
  };

  const cancelSaveSession = () => {
    setSaveModalVisible(false);
  };

  const handleResetShots = () => {
    setResetModalVisible(true);
  };

  const confirmResetShots = async () => {
    if (!session) return;
    setResetLoading(true);
    try {
      await clearShotsMutation.mutateAsync(session.id);
      setShotCount(0);
      setResetModalVisible(false);
    } catch (error) {
      // Optionally show error UI here
    } finally {
      setResetLoading(false);
    }
  };

  const cancelResetShots = () => {
    setResetModalVisible(false);
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
    <>
      {/* Save Session Modal */}
      <Modal
        visible={saveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelSaveSession}
      >
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="bg-white p-6 rounded-lg w-80 max-w-full items-center">
            <Text className="text-lg font-bold text-gray-900 mb-2">Session Complete</Text>
            <Text className="text-gray-700 mb-4 text-center">
              You've recorded {shots?.length || 0} shots. Save this session?
            </Text>
            <View className="flex-row space-x-3 mt-2">
              <TargetButton
                variant="secondary"
                onPress={cancelSaveSession}
              >
                <Text className="text-gray-700 font-semibold">Continue Shooting</Text>
              </TargetButton>
              <TargetButton
                variant="primary"
                onPress={confirmSaveSession}
              >
                <Text className="text-white font-semibold">Save & Exit</Text>
              </TargetButton>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reset Shots Modal */}
      <Modal
        visible={resetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelResetShots}
      >
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="bg-white p-6 rounded-lg w-80 max-w-full items-center">
            <Text className="text-lg font-bold text-gray-900 mb-2">Reset Shots</Text>
            <Text className="text-gray-700 mb-4 text-center">
              Are you sure you want to clear all shot placements?
            </Text>
            <View className="flex-row space-x-3 mt-2">
              <TargetButton
                variant="secondary"
                onPress={cancelResetShots}
                disabled={resetLoading}
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TargetButton>
              <TargetButton
                variant="danger"
                onPress={confirmResetShots}
                disabled={resetLoading}
              >
                <Text className="text-white font-semibold">
                  {resetLoading ? 'Resetting...' : 'Reset'}
                </Text>
              </TargetButton>
            </View>
          </View>
        </View>
      </Modal>

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
        {/* Toggle for showing shot points on canvas */}
        <View className="flex-row items-center mb-2">
          <Switch
            checked={showPointsOnTarget}
            onCheckedChange={setShowPointsOnTarget}
            className="mr-2"
          />
          <Text className="text-gray-700">Show shot points on target</Text>
        </View>
        <TargetCanvas
          targetImageUrl={session.target?.image_url}
          shots={shots || []}
          onShotPlaced={handleShotPlaced}
          readonly={false}
          showPoints={showPointsOnTarget}
        />
      </View>
      {/* Shot List / Scorecard */}
      <View className="px-4 pb-2">
        <Text className="text-base font-semibold text-gray-900 mb-1">Scorecard</Text>
        <View className="bg-gray-50 rounded-lg p-2">
          {(shots || []).length === 0 ? (
            <Text className="text-gray-400 italic">No shots yet.</Text>
          ) : (
            <>
              {(shots || []).map((shot, idx) => {
                // Calculate score (same logic as in TargetCanvas)
                const width = 320; // fallback, not used for display
                const height = 320;
                const cx = (shot.x_coordinate / 100) * width;
                const cy = (shot.y_coordinate / 100) * height;
                const centerX = width / 2;
                const centerY = height / 2;
                const dx = cx - centerX;
                const dy = cy - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const radii = [
                  width / 2 * 0.1, // 10
                  width / 2 * 0.3, // 9
                  width / 2 * 0.5, // 8
                  width / 2 * 0.7, // 7
                  width / 2 * 0.9, // 6
                ];
                let score = 0;
                if (distance <= radii[0]) score = 10;
                else if (distance <= radii[1]) score = 9;
                else if (distance <= radii[2]) score = 8;
                else if (distance <= radii[3]) score = 7;
                else if (distance <= radii[4]) score = 6;
                else score = 0;
                return (
                  <View key={shot.id} className="flex-row justify-between items-center py-1 px-2 border-b border-gray-200 last:border-b-0">
                    <Text className="text-gray-700 font-medium">#{idx + 1}</Text>
                    <Text className="text-blue-700 font-semibold">{score} pts</Text>
                  </View>
                );
              })}
              {/* Running total */}
              <View className="flex-row justify-between items-center pt-2 mt-2 border-t border-gray-300">
                <Text className="text-gray-900 font-bold">Total</Text>
                <Text className="text-green-700 font-bold">
                  {shots && shots.length > 0
                    ? shots.reduce((sum, shot) => {
                        const width = 320;
                        const height = 320;
                        const cx = (shot.x_coordinate / 100) * width;
                        const cy = (shot.y_coordinate / 100) * height;
                        const centerX = width / 2;
                        const centerY = height / 2;
                        const dx = cx - centerX;
                        const dy = cy - centerY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const radii = [
                          width / 2 * 0.1,
                          width / 2 * 0.3,
                          width / 2 * 0.5,
                          width / 2 * 0.7,
                          width / 2 * 0.9,
                        ];
                        let score = 0;
                        if (distance <= radii[0]) score = 10;
                        else if (distance <= radii[1]) score = 9;
                        else if (distance <= radii[2]) score = 8;
                        else if (distance <= radii[3]) score = 7;
                        else if (distance <= radii[4]) score = 6;
                        else score = 0;
                        return sum + score;
                      }, 0)
                    : 0} pts
                </Text>
              </View>
            </>
          )}
        </View>
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
      
      {/* Quick navigation to home */}
      <FloatingActionButton 
        icon="home"
        position="bottom-left"
      />
    </View>
    </>
  );
}
