import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '@/src/navigation/types';
import { COLORS } from '@/src/constants/colors';

type Props = StackScreenProps<AuthStackParamList, 'Introduction'>;

export function IntroductionScreen({ navigation }: Props) {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Login');
        }, 2500);
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View className="flex-1 items-center justify-center bg-bg">
            <View className="mb-6 h-28 w-28 items-center justify-center rounded-3xl bg-primary/20">
                <Ionicons name="storefront" size={60} color={COLORS.primary} />
            </View>
            <Text className="text-4xl font-extrabold text-foreground">360 Rental</Text>
            <Text className="mt-3 text-lg font-medium text-muted">Nền tảng cho thuê toàn diện</Text>
        </View>
    );
}
