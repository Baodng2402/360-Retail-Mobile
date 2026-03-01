import React from 'react';
import { View, TouchableOpacity, Linking, Alert as RNAlert } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { useFeatureGate } from '@/src/hooks/useFeatureGate';
import type { FeatureKey } from '@/src/config/plan.config';

// URL placeholder — sẽ thay bằng link pricing thật
const UPGRADE_URL = 'https://360retail.app/pricing';

interface Props {
    feature: FeatureKey;
    children: React.ReactNode;
}

// =============================================
// FeatureGate — wrap UI cần lock theo gói
// Nếu gói hiện tại KHÔNG cho phép → hiện overlay blur
// Usage: <FeatureGate feature="dashboard"><Content /></FeatureGate>
// =============================================

export function FeatureGate({ feature, children }: Props) {
    const { allowed, label, minPlanLabel } = useFeatureGate(feature);

    if (allowed) return <>{children}</>;

    // Hỏi xác nhận trước khi mở web
    const handleUpgrade = () => {
        RNAlert.alert(
            'Nâng cấp gói',
            `Bạn cần gói ${minPlanLabel} để sử dụng "${label}". Bạn muốn xem các gói ngay không?`,
            [
                { text: 'Để sau', style: 'cancel' },
                { text: 'Xem các gói', onPress: () => Linking.openURL(UPGRADE_URL) },
            ]
        );
    };

    return (
        <View className="relative">
            {/* Locked content — mờ đi */}
            <View className="opacity-30 pointer-events-none">
                {children}
            </View>

            {/* Overlay thông báo nâng cấp */}
            <View className="absolute inset-0 items-center justify-center rounded-2xl bg-black/5 px-6">
                <View className="bg-white rounded-2xl p-5 items-center shadow-sm w-full max-w-[300px]">
                    <Text className="text-2xl mb-2">🔒</Text>
                    <Text className="text-base font-bold text-center mb-1">
                        {label}
                    </Text>
                    <Text className="text-sm text-center text-gray-500 mb-4">
                        Nâng cấp lên gói {minPlanLabel} để sử dụng tính năng này
                    </Text>
                    <TouchableOpacity
                        onPress={handleUpgrade}
                        activeOpacity={0.8}
                        className="w-full py-3 rounded-xl items-center bg-cyan-500"
                    >
                        <Text className="text-white font-bold text-sm">
                            Xem các gói →
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
