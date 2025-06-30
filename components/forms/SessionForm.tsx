import React from 'react';
import { View, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useTargets } from '@/hooks/useTargets';
import type { CreateSessionData } from '@/lib/types';

const sessionSchema = z.object({
  target_id: z.string().min(1, 'Please select a target'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  notes: z.string().optional(),
  weather_conditions: z.object({
    temperature: z.number().optional(),
    humidity: z.number().optional(),
    wind_speed: z.number().optional(),
    wind_direction: z.string().optional(),
  }).optional(),
});

interface SessionFormProps {
  onSubmit: (data: CreateSessionData) => void;
  initialData?: Partial<CreateSessionData>;
  preselectedTargetId?: string;
  isLoading?: boolean;
}

export function SessionForm({ onSubmit, initialData, preselectedTargetId, isLoading = false }: SessionFormProps) {
  const { data: targets } = useTargets();
  
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateSessionData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      target_id: preselectedTargetId || initialData?.target_id || '',
      name: initialData?.name || '',
      notes: initialData?.notes || '',
      weather_conditions: initialData?.weather_conditions || {},
    },
    mode: 'onChange',
  });

  return (
    <ScrollView className="flex-1 p-4">
      <View className="space-y-4">
        <View>
          <Text className="text-base font-semibold mb-2 text-gray-900">Session Name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Enter session name"
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
          <Text className="text-base font-semibold mb-2 text-gray-900">Target</Text>
          <Controller
            control={control}
            name="target_id"
            render={({ field: { onChange, value } }) => (
              <View className="space-y-2">
                {targets?.map((target) => (
                  <Button
                    key={target.id}
                    variant={value === target.id ? 'default' : 'outline'}
                    onPress={() => onChange(target.id)}
                    className="justify-start"
                  >
                    <View className="items-start">
                      <Text className={value === target.id ? 'text-white font-semibold' : 'text-gray-700 font-semibold'}>
                        {target.name}
                      </Text>
                      <Text className={value === target.id ? 'text-white/80 text-sm' : 'text-gray-500 text-sm'}>
                        {target.distance}m • {target.target_type}
                      </Text>
                    </View>
                  </Button>
                ))}
              </View>
            )}
          />
          {errors.target_id && (
            <Text className="text-red-500 text-sm mt-1">{errors.target_id.message}</Text>
          )}
        </View>

        <View>
          <Text className="text-base font-semibold mb-2 text-gray-900">Weather Conditions (Optional)</Text>
          <View className="space-y-3 bg-gray-50 p-3 rounded-lg">
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-sm font-medium mb-1">Temperature (°C)</Text>
                <Controller
                  control={control}
                  name="weather_conditions.temperature"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      placeholder="20"
                      onChangeText={(text) => onChange(parseFloat(text) || undefined)}
                      value={value?.toString() || ''}
                      keyboardType="numeric"
                      className="border-gray-300"
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium mb-1">Humidity (%)</Text>
                <Controller
                  control={control}
                  name="weather_conditions.humidity"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      placeholder="60"
                      onChangeText={(text) => onChange(parseFloat(text) || undefined)}
                      value={value?.toString() || ''}
                      keyboardType="numeric"
                      className="border-gray-300"
                    />
                  )}
                />
              </View>
            </View>
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-sm font-medium mb-1">Wind Speed (m/s)</Text>
                <Controller
                  control={control}
                  name="weather_conditions.wind_speed"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      placeholder="5"
                      onChangeText={(text) => onChange(parseFloat(text) || undefined)}
                      value={value?.toString() || ''}
                      keyboardType="numeric"
                      className="border-gray-300"
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium mb-1">Wind Direction</Text>
                <Controller
                  control={control}
                  name="weather_conditions.wind_direction"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      placeholder="N, NE, E, SE..."
                      onChangeText={onChange}
                      value={value || ''}
                      className="border-gray-300"
                    />
                  )}
                />
              </View>
            </View>
          </View>
        </View>

        <View>
          <Text className="text-base font-semibold mb-2 text-gray-900">Notes (Optional)</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <Textarea
                placeholder="Add any notes about this session..."
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className="border-gray-300 min-h-[100px]"
              />
            )}
          />
        </View>

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isLoading}
          className="mt-6"
        >
          <Text className="text-white font-semibold">
            {isLoading ? 'Creating...' : 'Create Session'}
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
}
