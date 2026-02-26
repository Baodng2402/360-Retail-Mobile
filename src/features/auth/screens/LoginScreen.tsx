import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { Button } from '@/src/components/ui/button';

import { useLoginMutation } from '../api';
import { LoginSchema, type LoginFormValues } from '../types';

export function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  const loginMutation = useLoginMutation();

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : 'Đăng nhập thất bại, vui lòng thử lại.';

        Toast.show({
          type: 'error',
          text1: 'Đăng nhập thất bại',
          text2: message,
        });
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-4">
      <View className="mt-12">
        <Text className="text-2xl font-semibold text-foreground">Chào mừng quay lại 👋</Text>
        <Text className="mt-2 text-base text-muted-foreground">
          Đăng nhập để tiếp tục mua sắm tại 360 Retail.
        </Text>
      </View>

      <View className="mt-8 space-y-4">
        <View>
          <Text className="text-sm font-medium text-foreground">Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                className="mt-2 rounded-md border border-input bg-background px-3 py-2 text-foreground"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="you@example.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.email?.message && (
            <Text className="mt-1 text-xs text-destructive">{errors.email.message}</Text>
          )}
        </View>

        <View className="mt-4">
          <Text className="text-sm font-medium text-foreground">Mật khẩu</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                className="mt-2 rounded-md border border-input bg-background px-3 py-2 text-foreground"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.password?.message && (
            <Text className="mt-1 text-xs text-destructive">{errors.password.message}</Text>
          )}
        </View>
      </View>

      <View className="mt-8">
        <Button
          fullWidth
          variant="default"
          isLoading={loginMutation.isPending}
          onPress={handleSubmit(onSubmit)}
        >
          Đăng nhập
        </Button>
      </View>
    </SafeAreaView>
  );
}

