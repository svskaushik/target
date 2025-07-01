import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/text';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const handleNavigation = (href?: string) => {
    if (href) {
      router.push(href as any);
    }
  };

  return (
    <View className={`flex-row items-center bg-gray-50 px-4 py-2 ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight size={16} color="#9CA3AF" className="mx-2" />
          )}
          
          {item.href ? (
            <TouchableOpacity
              onPress={() => handleNavigation(item.href)}
              className="py-1"
              accessibilityRole="button"
              accessibilityLabel={`Navigate to ${item.label}`}
            >
              <Text className="text-blue-600 text-sm font-medium">
                {item.label}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-gray-900 text-sm font-medium py-1">
              {item.label}
            </Text>
          )}
        </React.Fragment>
      ))}
    </View>
  );
}
