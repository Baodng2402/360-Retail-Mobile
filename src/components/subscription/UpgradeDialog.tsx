import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFeatureGateStore } from '@/src/stores/useFeatureGateStore';
import { COLORS } from '@/src/constants/colors';

// =============================================
// UpgradeDialog — Dialog nâng cấp gói dịch vụ
//
// Hiển thị tự động khi nhận HTTP 403 từ backend:
//   - TrialExpired: "Thời gian dùng thử đã hết"
//   - SubscriptionExpired: "Gói dịch vụ đã hết hạn"
//   - FeatureNotAvailable: "Tính năng không khả dụng trong gói hiện tại"
//
// Đặt component này ở App.tsx gốc để hoạt động toàn cục.
// =============================================

/** Map error type → Tiêu đề dialog */
const TITLE_MAP = {
    TrialExpired: 'Thời gian dùng thử đã hết',
    SubscriptionExpired: 'Gói dịch vụ đã hết hạn',
    FeatureNotAvailable: 'Tính năng không khả dụng',
} as const;

/** Map error type → Icon name */
const ICON_MAP = {
    TrialExpired: 'time-outline',
    SubscriptionExpired: 'card-outline',
    FeatureNotAvailable: 'lock-closed-outline',
} as const;

interface UpgradeDialogProps {
    /** Callback khi user nhấn "Nâng cấp ngay" */
    onUpgrade?: () => void;
}

export function UpgradeDialog({ onUpgrade }: UpgradeDialogProps) {
    const { isOpen, errorType, message, currentPlan, requiredPlan, feature } =
        useFeatureGateStore();
    const closeUpgradeModal = useFeatureGateStore((s) => s.closeUpgradeModal);

    const handleUpgrade = () => {
        closeUpgradeModal();
        onUpgrade?.();
    };

    return (
        <Modal visible={isOpen} transparent animationType="fade" statusBarTranslucent>
            <View className="flex-1 items-center justify-center bg-black/50 px-6">
                <View className="w-full max-w-sm rounded-2xl bg-surface p-6">
                    {/* Icon + Tiêu đề */}
                    <View className="mb-4 items-center">
                        <View
                            className="mb-3 h-14 w-14 items-center justify-center rounded-full"
                            style={{ backgroundColor: COLORS.warningLight }}>
                            <Ionicons
                                name={ICON_MAP[errorType] as any}
                                size={28}
                                color={COLORS.warning}
                            />
                        </View>

                        <Text className="text-center text-lg font-bold text-foreground">
                            {TITLE_MAP[errorType]}
                        </Text>
                    </View>

                    {/* Nội dung từ server */}
                    {message && (
                        <Text className="mb-3 text-center text-sm leading-5 text-muted">
                            {message}
                        </Text>
                    )}

                    {/* Thông tin thêm cho FeatureNotAvailable */}
                    {errorType === 'FeatureNotAvailable' && currentPlan && (
                        <View className="mb-4 rounded-xl bg-bg p-3">
                            <Text className="text-sm text-muted">
                                Gói hiện tại:{' '}
                                <Text className="font-semibold text-foreground">{currentPlan}</Text>
                            </Text>
                            {requiredPlan && (
                                <Text className="mt-1 text-sm text-muted">
                                    Yêu cầu gói:{' '}
                                    <Text className="font-semibold text-primary">{requiredPlan}</Text>
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Buttons */}
                    <View className="mt-2 flex-row gap-3">
                        <TouchableOpacity
                            className="flex-1 items-center rounded-xl border border-border py-3"
                            activeOpacity={0.7}
                            onPress={closeUpgradeModal}>
                            <Text className="font-semibold text-muted">Để sau</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 items-center rounded-xl py-3"
                            style={{ backgroundColor: COLORS.primary }}
                            activeOpacity={0.7}
                            onPress={handleUpgrade}>
                            <Text className="font-semibold text-white">Nâng cấp ngay</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
