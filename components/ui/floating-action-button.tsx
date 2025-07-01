import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Home, ArrowLeft } from 'lucide-react-native';

interface FloatingActionButtonProps {
  onPress?: () => void;
  icon?: 'home' | 'back';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export function FloatingActionButton({ 
  onPress, 
  icon = 'home',
  position = 'bottom-right'
}: FloatingActionButtonProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (icon === 'home') {
      router.push('/');
    } else if (icon === 'back') {
      router.back();
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-left':
        return 'absolute bottom-6 left-6';
      case 'bottom-center':
        return 'absolute bottom-6 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
      default:
        return 'absolute bottom-6 right-6';
    }
  };

  const IconComponent = icon === 'home' ? Home : ArrowLeft;

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`${getPositionStyles()} bg-blue-600 w-14 h-14 rounded-full shadow-lg items-center justify-center`}
      accessibilityLabel={icon === 'home' ? 'Navigate to home' : 'Go back'}
      accessibilityRole="button"
    >
      <IconComponent size={24} color="white" />
    </TouchableOpacity>
  );
}
