import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, X } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from '@/components/safe-area-view';

interface CustomHeaderProps {
  title: string;
  onBack?: () => void;
  showClose?: boolean;
  rightElement?: React.ReactNode;
}

export function CustomHeader({ 
  title, 
  onBack, 
  showClose = false, 
  rightElement 
}: CustomHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="bg-white border-b border-gray-200" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleBack}
            className="mr-3 p-1"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            {showClose ? (
              <X size={24} color="#374151" />
            ) : (
              <ArrowLeft size={24} color="#374151" />
            )}
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">{title}</Text>
        </View>
        
        {rightElement && (
          <View className="flex-row items-center">
            {rightElement}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
