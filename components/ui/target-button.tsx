import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import { Text } from '@/components/ui/text';

interface TargetButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link';
}

export const TargetButton = forwardRef<any, TargetButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, accessibilityLabel, accessibilityHint, accessibilityRole = 'button', ...props }, ref) => {
    return (
      <Pressable
        ref={ref}
        accessible={true}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        className={cn(
          'flex items-center justify-center rounded-xl font-semibold transition-all duration-200',
          {
            'bg-blue-600 active:bg-blue-800': variant === 'primary',
            'bg-gray-100 active:bg-gray-300': variant === 'secondary',
            'bg-red-600 active:bg-red-800': variant === 'danger',
            'bg-transparent active:bg-gray-200': variant === 'ghost',
          },
          {
            'px-3 py-2': size === 'sm',
            'px-4 py-3': size === 'md',
            'px-6 py-4': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </Pressable>
    );
  }
);

TargetButton.displayName = 'TargetButton';
