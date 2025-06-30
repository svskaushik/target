import React from 'react';
import { View, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { CreateTargetData } from '@/lib/types';

const targetSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  distance: z.number().min(1, 'Distance must be positive').max(1000, 'Distance must be reasonable'),
  target_type: z.enum(['bullseye', 'silhouette', 'custom'], {
    required_error: 'Please select a target type',
  }),
  image_url: z.string().url().optional().or(z.literal('')),
});

interface TargetFormProps {
  onSubmit: (data: CreateTargetData) => void;
  initialData?: Partial<CreateTargetData>;
  isLoading?: boolean;
}

export function TargetForm({ onSubmit, initialData, isLoading = false }: TargetFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateTargetData>({
    resolver: zodResolver(targetSchema),
    defaultValues: {
      name: initialData?.name || '',
      distance: initialData?.distance || 0,
      target_type: initialData?.target_type || 'bullseye',
      image_url: initialData?.image_url || '',
    },
    mode: 'onChange',
  });

  return (
    <ScrollView className="flex-1 p-4">
      <View className="space-y-4">
        <View>
          <Text className="text-base font-semibold mb-2 text-gray-900">Target Name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Enter target name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className={errors.name ? 'border-red-500' : 'border-gray-300'}
              />
            )}
          />
          {errors.name && (
            <Text className="text-red-500 text-sm mt-1">{errors.name.message}</Text>
          )}
        </View>

        <View>
          <Text className="text-base font-semibold mb-2 text-gray-900">Distance (meters)</Text>
          <Controller
            control={control}
            name="distance"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Enter distance"
                onBlur={onBlur}
                onChangeText={(text) => onChange(parseFloat(text) || 0)}
                value={value?.toString()}
                keyboardType="numeric"
                className={errors.distance ? 'border-red-500' : 'border-gray-300'}
              />
            )}
          />
          {errors.distance && (
            <Text className="text-red-500 text-sm mt-1">{errors.distance.message}</Text>
          )}
        </View>

        <View>
          <Text className="text-base font-semibold mb-2 text-gray-900">Target Type</Text>
          <Controller
            control={control}
            name="target_type"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row space-x-2">
                {(['bullseye', 'silhouette', 'custom'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={value === type ? 'default' : 'outline'}
                    onPress={() => onChange(type)}
                    className="flex-1"
                  >
                    <Text className={value === type ? 'text-white' : 'text-gray-700'}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </Button>
                ))}
              </View>
            )}
          />
          {errors.target_type && (
            <Text className="text-red-500 text-sm mt-1">{errors.target_type.message}</Text>
          )}
        </View>

        <View>
          <Text className="text-base font-semibold mb-2 text-gray-900">Image URL (Optional)</Text>
          <Controller
            control={control}
            name="image_url"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Enter image URL"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className={errors.image_url ? 'border-red-500' : 'border-gray-300'}
              />
            )}
          />
          {errors.image_url && (
            <Text className="text-red-500 text-sm mt-1">{errors.image_url.message}</Text>
          )}
        </View>

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isLoading}
          className="mt-6"
        >
          <Text className="text-white font-semibold">
            {isLoading ? 'Creating...' : 'Create Target'}
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
}
