import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';

// =============================================
// ErrorBoundary — Bắt lỗi React crash toàn app
//
// Không có ErrorBoundary → app trắng khi 1 component crash
// Có ErrorBoundary → hiện UI thân thiện + nút thử lại
//
// Class component là bắt buộc vì React chưa có
// hook tương đương cho getDerivedStateFromError.
// =============================================

interface Props {
  children: React.ReactNode;
  /** Custom fallback UI. Mặc định dùng UI có sẵn */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Có thể gửi lên crash reporting service (Sentry, etc.)
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View className="flex-1 items-center justify-center bg-bg p-8">
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
            <Ionicons name="warning-outline" size={32} color={COLORS.error ?? '#EF4444'} />
          </View>
          <Text className="text-lg font-bold text-foreground text-center mb-2">
            Đã xảy ra lỗi
          </Text>
          <Text className="text-sm text-muted text-center mb-6">
            {this.state.error?.message ?? 'Lỗi không xác định. Vui lòng thử lại.'}
          </Text>
          <TouchableOpacity
            onPress={this.handleRetry}
            className="px-6 py-3 rounded-xl bg-primary"
            activeOpacity={0.8}>
            <Text className="text-sm font-bold text-slate-900">Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
