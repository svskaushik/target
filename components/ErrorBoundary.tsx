import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { TargetButton } from '@/components/ui/target-button';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // You can log to error reporting service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center p-8 bg-white">
          <AlertTriangle size={64} color="#dc2626" />
          <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
            Something went wrong
          </Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">
            We're sorry, but something unexpected happened. Please try refreshing the app.
          </Text>
          <TargetButton
            variant="primary"
            onPress={() => this.setState({ hasError: false })}
          >
            <View className="flex-row items-center">
              <RefreshCw size={18} color="white" />
              <Text className="text-white font-semibold ml-2">Try Again</Text>
            </View>
          </TargetButton>
        </View>
      );
    }

    return this.props.children;
  }
}
